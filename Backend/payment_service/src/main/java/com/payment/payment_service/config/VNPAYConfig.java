package com.payment.payment_service.config;

import java.nio.charset.StandardCharsets;
import java.util.Random;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.context.annotation.Configuration;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
public class VNPAYConfig {

    // Đây là Mã website (Terminal ID) của bạn, do VNPay cung cấp.
    public static String vnp_TmnCode = "HFH0EW8X";

    // Đây là Chuỗi bí mật (Secret Key) của bạn, do VNPay cung cấp.
    // **TUYỆT ĐỐI KHÔNG** để lộ chuỗi này ra bên ngoài (frontend).
    public static String vnp_HashSecret = "5P56F0FIWJVCRBST3WQH4EW6T2TKXT0M";
    
    // Đây là URL của cổng thanh toán VNPay (môi trường Sandbox).
    public static String vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    
    // Đây là URL mà trình duyệt của người dùng sẽ được chuyển về SAU KHI thanh toán xong.
    // Nó trỏ đến API "/api/v1/payment/vnpay-return" trong PaymentController.
    // URL này chỉ dùng để hiển thị thông báo cho người dùng.
    public static String vnp_ReturnUrl = "http://localhost:8080/api/v1/payments/vnpay-return";

    // Đây là URL mà máy chủ VNPay sẽ "gọi ngầm" (server-to-server) để BÁO CÁO kết quả.
    // Nó trỏ đến API "/api/v1/payment/vnpay-ipn" trong PaymentController.
    // Đây là URL quan trọng nhất, dùng để cập nhật trạng thái đơn hàng trong CSDL.
    public static String vnp_IpnUrl = "http://localhost:8080/api/v1/payments/vnpay-ipn";
    // Hàm tiện ích: Tạo chữ ký HmacSHA512
    /**
     * Hàm tạo chữ ký HmacSHA512.
     * Đây là hàm bảo mật cốt lõi, dùng để tạo vnp_SecureHash.
     * @param key Chuỗi bí mật (vnp_HashSecret)
     * @param data Chuỗi dữ liệu (đã được sắp xếp và nối lại)
     * @return Chuỗi chữ ký
     */
    public static String hmacSHA512(final String key, final String data) {
        try {
            // Kiểm tra key và data không được null
            if (key == null || data == null) throw new NullPointerException();

            // Lấy thuật toán HmacSHA512
            final Mac hmac512 = Mac.getInstance("HmacSHA512");

            // Chuyển key (chuỗi bí mật) thành mảng byte
            byte[] hmacKeyBytes = key.getBytes();

            // Tạo một SecretKeySpec từ mảng byte
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            
            // Khởi tạo Mac với secretKey
            hmac512.init(secretKey);

            // Chuyển dữ liệu cần băm (data) thành mảng byte
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            // Thực hiện băm
            byte[] result = hmac512.doFinal(dataBytes);

            // Chuyển kết quả (mảng byte) thành chuỗi Hex (chữ thường)
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception ex) {
            // Nếu có lỗi (ví dụ: thuật toán không tồn tại), trả về chuỗi rỗng
            return "";
        }
    }

    // Hàm tiện ích: Lấy IP
    public static String getIpAddress(HttpServletRequest request) {
        String ipAddr = request.getHeader("X-Forwarded-For");
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

    /**
     * Hàm này dùng để lấy tất cả tham số từ request (dùng cho IPN).
     * @param request HttpServletRequest
     * @return Một Map<String, String> chứa các tham số
     */
    // Hàm tiện ích: Lấy tham số ngẫu nhiên
    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
