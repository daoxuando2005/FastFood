package com.delivery.delivery_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

// name = "ORDER-SERVICE" phải khớp chính xác tên bạn đặt trong Eureka
@FeignClient(name = "ORDER-SERVICE")
public interface OrderClient {

    // Gọi vào API cập nhật trạng thái bên Order Service
    // PUT /api/v1/orders/{id}/status?status=...
    @PutMapping("/api/v1/orders/{id}/status")
    void updateOrderStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
}