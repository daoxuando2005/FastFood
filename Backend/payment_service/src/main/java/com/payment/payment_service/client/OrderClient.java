package com.payment.payment_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

// name = "ORDER-SERVICE" phải khớp tên trên Eureka
@FeignClient(name = "ORDER-SERVICE")
public interface OrderClient {

    // Gọi API cập nhật trạng thái bên Order Service
    @PutMapping("/api/v1/orders/{id}/status")
    void updateOrderStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
}