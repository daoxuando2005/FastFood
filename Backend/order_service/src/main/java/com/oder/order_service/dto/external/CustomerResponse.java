package com.oder.order_service.dto.external;

import lombok.Data;

@Data
public class CustomerResponse {

    private Long id;        // ID nội bộ (dùng để map trong Order)
    private Long userId;    // ID từ Auth (dùng để định danh)
    private String fullname;
    private String email;
    private String phoneNumber;
     // Kèm danh sách địa chỉ

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
