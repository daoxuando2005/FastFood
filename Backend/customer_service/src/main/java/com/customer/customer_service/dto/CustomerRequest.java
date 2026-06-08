package com.customer.customer_service.dto;

import lombok.Data;

@Data
public class CustomerRequest {
    private String fullname;
    private String phoneNumber; // Dùng String, không dùng int
    private String email;
    private Long userId; // ID từ Auth Service gửi sang
}   