package com.payment.payment_service.controller;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// 👇 1. Thêm Import Client
import com.payment.payment_service.client.OrderClient;

import org.springframework.beans.factory.annotation.Autowired; // <-- Thêm cái này
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.payment.payment_service.model.Order;
import com.payment.payment_service.model.PaymentRequest;
import com.payment.payment_service.response.PaymentResponse;
import com.payment.payment_service.response.VnPayIpnResponse;
import com.payment.payment_service.service.PaymentService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
    public final PaymentService paymentService;

    // 👇 2. Tiêm OrderClient vào để dùng
    @Autowired
    private OrderClient orderClient;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
    
    // API tạo link thanh toán
    @PostMapping("/create")
    public ResponseEntity<PaymentResponse> createPayment(
            @RequestParam("amount") long amount,
            @RequestParam("orderId") String orderId,
            HttpServletRequest httpReq) {
        
        PaymentRequest request = new PaymentRequest();
        request.setAmount(amount);
        request.setOrderId(orderId);

        PaymentResponse res = paymentService.createPayment(request, httpReq);
        return ResponseEntity.ok(res);
    }

    // API IPN
    @GetMapping("/vnpay-ipn")
    public VnPayIpnResponse vnpayIpn(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        for (Enumeration<String> paramsEnum = request.getParameterNames(); paramsEnum.hasMoreElements();) {
            String key = paramsEnum.nextElement();
            params.put(key, request.getParameter(key));
        }
        return paymentService.processIpn(params);
    }

    // API Return (Người dùng quay lại sau khi thanh toán)
    @GetMapping("/vnpay-return")
    public ResponseEntity<String> vnpayReturn(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        for (Enumeration<String> paramsEnum = request.getParameterNames(); paramsEnum.hasMoreElements();) {
            String key = paramsEnum.nextElement();
            params.put(key, request.getParameter(key));
        }

        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");
        String orderInfo = params.get("vnp_OrderInfo"); // Lấy thông tin nội dung thanh toán
        
        String amountStr = params.get("vnp_Amount");
        long amount = (amountStr != null) ? Long.parseLong(amountStr) / 100 : 0;
        String htmlResponse;
        
        String homeUrl = "http://127.0.0.1:5500/Frontend/index.html"; 

        if ("00".equals(vnp_ResponseCode)) {
            // --- THÀNH CÔNG ---
            paymentService.processIpn(params);

            // 👇 3. LOGIC MỚI: GỌI ORDER SERVICE CẬP NHẬT TRẠNG THÁI 👇
            try {
                System.out.println(">>> 💰 Thanh toán thành công! Đang báo Order Service...");
                
                // Cố gắng lấy ID đơn hàng. 
                // Ưu tiên 1: Lấy số từ vnp_OrderInfo (Ví dụ: "Thanh toan don 26" -> lấy 26)
                // Ưu tiên 2: Nếu không có, thử lấy từ txnRef (Nếu txnRef bạn lưu là orderId)
                
                String orderIdStr = "";
                if (orderInfo != null) {
                    orderIdStr = orderInfo.replaceAll("[^0-9]", ""); // Lọc chỉ lấy số
                }
                
                if (orderIdStr.isEmpty()) {
                     // Fallback: Thử dùng txnRef nếu orderInfo không có số
                     orderIdStr = txnRef; 
                }

                if (!orderIdStr.isEmpty()) {
                    Long orderId = Long.parseLong(orderIdStr);
                    
                    // Gọi sang Order Service: Update thành PAID
                    orderClient.updateOrderStatus(orderId, "PAID");
                    
                    System.out.println(">>> ✅ Đã cập nhật đơn hàng #" + orderId + " sang PAID");
                } else {
                    System.err.println(">>> ⚠️ Không tìm thấy Order ID hợp lệ để cập nhật.");
                }

            } catch (Exception e) {
                System.err.println(">>> ❌ Lỗi gọi Order Service: " + e.getMessage());
                // e.printStackTrace(); 
            }
            // -----------------------------------------------------------

            htmlResponse = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Thanh toán thành công</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f0f0; }
                    .success { background: white; padding: 40px; border-radius: 10px;
                             max-width: 500px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    .icon { font-size: 60px; color: #28a745; margin-bottom: 20px; }
                    h1 { color: #28a745; margin-bottom: 10px; }
                    .info { margin: 20px 0; text-align: left; background: #f9f9f9; padding: 15px; border-radius: 5px; }
                    p { margin: 8px 0; color: #555; }
                    button { background: #28a745; color: white; padding: 12px 30px;
                            border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; transition: 0.3s; }
                    button:hover { background: #218838; }
                </style>
            </head>
            <body>
                <div class="success">
                    <div class="icon">✅</div>
                    <h1>Thanh toán thành công!</h1>
                    <div class="info">
                        <p><strong>Mã giao dịch:</strong> %s</p>
                        <p><strong>Số tiền:</strong> %s VNĐ</p>
                        <p><strong>Trạng thái:</strong> Đã cập nhật hệ thống</p>
                    </div>
                    <button onclick="window.location.href='%s'">
                        Về trang chủ
                    </button>
                </div>
            </body>
            </html>
            """.formatted(txnRef, String.format("%,d", amount), homeUrl);

        } else {
            // --- THẤT BẠI ---
            String lyDo = "Giao dịch bị hủy hoặc lỗi";
            if ("24".equals(vnp_ResponseCode)) lyDo = "Bạn đã hủy giao dịch";
            if ("11".equals(vnp_ResponseCode)) lyDo = "Hết hạn chờ thanh toán";
            
            htmlResponse = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Thanh toán thất bại</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f0f0; }
                    .failed { background: white; padding: 40px; border-radius: 10px; 
                             max-width: 500px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    .icon { font-size: 60px; color: #dc3545; margin-bottom: 20px; }
                    h1 { color: #dc3545; margin-bottom: 10px; }
                    p { color: #555; }
                    .error-code { font-weight: bold; color: #dc3545; margin: 15px 0; }
                    button { background: #dc3545; color: white; padding: 12px 30px; 
                           border: none; border-radius: 5px; cursor: pointer; font-size: 16px; transition: 0.3s; }
                    button:hover { background: #c82333; }
                </style>
            </head>
            <body>
                <div class="failed">
                    <div class="icon">❌</div>
                    <h1>Thanh toán thất bại!</h1>
                    <p>Lý do: <strong>%s</strong></p>
                    <p class="error-code">Mã lỗi VNPAY: %s</p>
                    <br>
                    <button onclick="window.location.href='%s'">Quay về trang chủ</button>
                </div>
            </body>
            </html>
            """.formatted(lyDo, vnp_ResponseCode, homeUrl);
        }

        return ResponseEntity.ok()
            .header("Content-Type", "text/html; charset=UTF-8")
            .body(htmlResponse);
    }   

    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(paymentService.getAllOrders());
    }
}