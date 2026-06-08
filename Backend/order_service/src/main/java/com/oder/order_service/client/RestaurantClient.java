package com.oder.order_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.oder.order_service.dto.external.DishResponse;

@FeignClient(name = "restaurant-service", path = "/api/v1/restaurants")
public interface RestaurantClient {
    // Gọi API lấy chi tiết món ăn để tính tiền
    @GetMapping("/dishes/{dishId}")
    DishResponse getDishById(@PathVariable("dishId") Long dishId);
}