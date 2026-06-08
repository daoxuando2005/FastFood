package com.customer.customer_service.dto;

import lombok.Data;

import java.util.List;

@Data
public class CustomerResponse {

    private Long id;        // ID nội bộ (dùng để map trong Order)
    private Long userId;    // ID từ Auth (dùng để định danh)
    private String fullname;
    private String email;
    private String phoneNumber;
    private List<AddressDTO> addresses; // Kèm danh sách địa chỉ
}
