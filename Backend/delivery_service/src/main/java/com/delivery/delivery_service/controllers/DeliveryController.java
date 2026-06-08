package com.delivery.delivery_service.controllers;

import com.delivery.delivery_service.models.Delivery;
import com.delivery.delivery_service.models.DeliveryStatus;
import com.delivery.delivery_service.services.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
// @CrossOrigin(origins = "*") // Bật dòng này nếu bạn test trực tiếp không qua Gateway (tùy chọn)
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    // ==========================================
    // 1. API TẠO ĐƠN GIAO HÀNG (Internal Service gọi)
    // ==========================================
    // URL: POST /api/deliveries/create-task?orderId=...
    @PostMapping("/create-task")
    public ResponseEntity<?> createDeliveryTask(@RequestParam("orderId") String orderId) {
        try {
            // Gọi hàm tự động random tài xế
            Delivery delivery = deliveryService.createAndAutoAssign(orderId);
            return ResponseEntity.ok(delivery);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo đơn giao hàng: " + e.getMessage());
        }
    }

    // ==========================================
    // 2. API LẤY DANH SÁCH (Admin Delivery gọi)
    // ==========================================
    // URL: GET /api/deliveries
    @GetMapping
    public ResponseEntity<List<Delivery>> getAllDeliveries() {
        return ResponseEntity.ok(deliveryService.getAllDeliveries());
    }

    // ==========================================
    // 3. API CẬP NHẬT TRẠNG THÁI (Sửa lỗi 404 & 405)
    // ==========================================
    // URL: PUT /api/deliveries/{id}/status?status=DELIVERING
    // Lưu ý: Dùng RequestMapping để chấp nhận cả PUT và POST (tránh lỗi 405 Method Not Allowed)
    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<?> updateDeliveryStatus(
            @PathVariable Long id, 
            @RequestParam("status") String status) {
        try {
            // 1. Chuyển đổi String sang Enum (Ví dụ: "DELIVERING" -> DeliveryStatus.DELIVERING)
            // .toUpperCase() để đảm bảo không lỗi nếu frontend gửi chữ thường
            DeliveryStatus newStatus = DeliveryStatus.valueOf(status.toUpperCase());
            
            // 2. Gọi Service xử lý update
            Delivery updatedDelivery = deliveryService.updateDeliveryStatus(id, newStatus);
            
            return ResponseEntity.ok(updatedDelivery);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Trạng thái không hợp lệ: " + status + ". Hãy kiểm tra file Enum!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật: " + e.getMessage());
        }
    }
}