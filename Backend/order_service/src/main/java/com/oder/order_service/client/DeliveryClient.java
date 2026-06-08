package com.oder.order_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

// name = "DELIVERY-SERVICE" phải khớp tên trong Eureka
@FeignClient(name = "DELIVERY-SERVICE") 
public interface DeliveryClient {

    // Gọi vào API tạo đơn giao hàng mà ta đã viết bên Delivery Service
    @PostMapping("/api/deliveries/create-task")
    void createDeliveryTask(@RequestParam("orderId") String orderId);
}