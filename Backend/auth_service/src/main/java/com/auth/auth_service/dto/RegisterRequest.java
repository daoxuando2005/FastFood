package com.auth.auth_service.dto;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String role;
    // Sau này có thể thêm fullName, phone để gửi sang Customer Service
}