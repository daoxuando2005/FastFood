package com.payment.payment_service.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.TreeMap;

import org.springframework.stereotype.Service;

import com.payment.payment_service.config.VNPAYConfig;
import com.payment.payment_service.model.Order;
import com.payment.payment_service.model.PaymentRequest;
import com.payment.payment_service.repository.OrderRepository;
import com.payment.payment_service.response.PaymentResponse;
import com.payment.payment_service.response.VnPayIpnResponse;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class PaymentService {

    private final OrderRepository orderRepository;

    public PaymentService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // ==========================================
    // 1. TẠO URL THANH TOÁN
    // ==========================================
    public PaymentResponse createPayment(PaymentRequest request, HttpServletRequest httpServletRequest) {
        long amount = request.getAmount() * 100;
        String vnp_TxnRef = String.valueOf(System.currentTimeMillis());
        String vnp_IpAddr = getIpAddress(httpServletRequest);
        String vnp_TmnCode = VNPAYConfig.vnp_TmnCode;

        Map<String, String> vnp_Params = new TreeMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        
        // 👇 SỬA LỖI TẠI ĐÂY: Dùng ID đơn hàng thật (request.getOrderId()) thay vì vnp_TxnRef
        // Ví dụ kết quả: "Thanh toan don hang 26"
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + request.getOrderId());
        
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", VNPAYConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(calendar.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        calendar.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(calendar.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {
                try {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    query.append(fieldName);
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                        query.append('&');
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        String vnp_SecureHash = VNPAYConfig.hmacSHA512(VNPAYConfig.vnp_HashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);

        String paymentUrl = VNPAYConfig.vnp_Url + "?" + query.toString();

        // Lưu đơn hàng vào DB Payment (Tùy chọn, để tracking lịch sử giao dịch)
        // Lưu ý: Đây là bảng t_payment, không phải bảng t_order của Order Service
        Order order = new Order("Order " + request.getOrderId(), request.getAmount(), vnp_TxnRef);
        orderRepository.save(order);

        System.out.println("--- LINK THANH TOAN: " + paymentUrl);
        return new PaymentResponse("OK", "Success", paymentUrl);
    }

    // ==========================================
    // 2. XỬ LÝ IPN (CẬP NHẬT TRẠNG THÁI)
    // ==========================================
    public VnPayIpnResponse processIpn(Map<String, String> params) {
        String vnp_SecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = params.get(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {
                try {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        String signValue = VNPAYConfig.hmacSHA512(VNPAYConfig.vnp_HashSecret, hashData.toString());

        if (!signValue.equals(vnp_SecureHash)) {
            return new VnPayIpnResponse("97", "Invalid Checksum");
        }

        String vnp_TxnRef = params.get("vnp_TxnRef");
        Order order = orderRepository.findByVnpTxnRef(vnp_TxnRef).orElse(null);

        if (order == null) {
            return new VnPayIpnResponse("01", "Order not found");
        }

        long vnpAmount = Long.parseLong(params.get("vnp_Amount")) / 100;
        if (order.getAmount() != vnpAmount) {
            return new VnPayIpnResponse("04", "Invalid Amount");
        }

        if (!"PENDING".equals(order.getStatus())) {
            return new VnPayIpnResponse("02", "Order already confirmed");
        }

        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        if ("00".equals(vnp_ResponseCode)) {
            order.setStatus("PAID");
        } else {
            order.setStatus("FAILED");
        }

        orderRepository.save(order);
        return new VnPayIpnResponse("00", "Confirm Success");
    }

    private String getIpAddress(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String ipAddr = request.getHeader("X-FORWARDED-FOR");
        if (ipAddr == null || ipAddr.isEmpty() || "unknown".equalsIgnoreCase(ipAddr)) {
            ipAddr = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddr == null || ipAddr.isEmpty() || "unknown".equalsIgnoreCase(ipAddr)) {
            ipAddr = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddr == null || ipAddr.isEmpty() || "unknown".equalsIgnoreCase(ipAddr)) {
            ipAddr = request.getRemoteAddr();
        }
        return ipAddr;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"));
    }
}