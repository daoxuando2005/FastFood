package com.oder.order_service.controller;

import com.oder.order_service.dto.OrderRequest;
import com.oder.order_service.dto.OrderResponse;
import com.oder.order_service.model.OrderStatus;
import com.oder.order_service.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // 1. Tạo đơn hàng
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest request) {
        OrderResponse resp = orderService.createOrder(request);
        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }

    // 2. Xem chi tiết đơn hàng
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    // 2b. Lấy tất cả đơn (cho Admin)
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // 2c. Lấy đơn theo user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    /**
     * 3. Cập nhật trạng thái đơn hàng
     *    Nhận status dưới dạng String (ví dụ: ?status=PAID hoặc ?status=delivering)
     *    -> parse sang Enum một cách an toàn, nếu invalid trả 400.
     *
     *  Payment service or admin will call: PUT /api/v1/orders/{id}/status?status=PAID
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id,
                                                           @RequestParam("status") String status) {
        try {
            OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
            OrderResponse updated = orderService.updateOrderStatus(id, newStatus);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid order status: " + status);
        }
    }

    @PutMapping("/{id}/address")
    public ResponseEntity<OrderResponse> updateOrderAddress(@PathVariable Long id,
                                                            @RequestBody String newAddress) {
        OrderResponse updated = orderService.updateOrderAddress(id, newAddress);
        return ResponseEntity.ok(updated);
    }
}
