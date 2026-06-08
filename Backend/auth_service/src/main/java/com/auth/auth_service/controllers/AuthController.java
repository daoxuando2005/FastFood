package com.auth.auth_service.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auth.auth_service.dto.AuthResponse;
import com.auth.auth_service.dto.LoginRequest;
import com.auth.auth_service.dto.RegisterRequest;
import com.auth.auth_service.models.User;
import com.auth.auth_service.services.AuthService;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // Đăng ký
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            User newUser = authService.register(request);
            
            // --- SỬA Ở ĐÂY ---
            // Thay vì trả về String, ta trả về Map (sẽ tự chuyển thành JSON)
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Collections.singletonMap("message", "Đăng ký thành công cho email: " + newUser.getEmail()));
            
        } catch (RuntimeException e) {
            // --- SỬA CẢ Ở ĐÂY (Để lỗi trả về cũng là JSON) ---
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // --- SỬA CẢ Ở ĐÂY ---
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    
    // API xác thực token
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        // Tráº£ vá» JSON cho Ä‘á»“ng bá»™
        return ResponseEntity.ok(Collections.singletonMap("message", "Token is valid"));
    }
    // Đổi mật khẩu
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody com.auth.auth_service.dto.ChangePasswordRequest request) {
        try {
            authService.changePassword(request.getEmail(), request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok(Collections.singletonMap("message", "Đổi mật khẩu thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
