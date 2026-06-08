package com.oder.order_service.client;

import com.oder.order_service.dto.external.CustomerResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// name: Tên service đã đăng ký trên Eureka (customer-service)
@FeignClient(name = "customer-service", path = "/api/v1/customers")
public interface CustomerClient {
    @GetMapping("/{userId}")
    CustomerResponse getCustomerByUserId(@PathVariable("userId") Long userId);
}