package com.auth.auth_service.services;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date; // Import DTO

import org.springframework.beans.factory.annotation.Autowired;   // Import DTO
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.auth.auth_service.dto.AuthResponse;
import com.auth.auth_service.dto.RegisterRequest;
import com.auth.auth_service.models.User;
import com.auth.auth_service.repositories.UserRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}") // Đọc từ config cho chuẩn
    private Long jwtExpiration;

    // --- ĐĂNG KÝ ---
    public User register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        // Mặc định role là CUSTOMER nếu không truyền
        newUser.setRole(request.getRole() != null ? request.getRole() : "CUSTOMER"); 

        return userRepository.save(newUser);
    }

    // --- ĐĂNG NHẬP ---
    public AuthResponse login(String email, String password) {
        // 1. Tìm user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại!"));

        // 2. Kiểm tra password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Mật khẩu không đúng!");
        }

        // 3. Tạo Token
        String token = generateToken(user);
        
        // 4. Trả về DTO
        return new AuthResponse(token, user.getRole(), user.getId());
    }

    // HĂ m táº¡o Token tĂ¡ch riĂªng cho gá»n
    private String generateToken(User user) {
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        Date exp = new Date(nowMillis + jwtExpiration); // DĂ¹ng biáº¿n tá»« config
        
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getId()) // Ráº¥t quan trá»ng cho cĂ¡c Service khĂ¡c
                .claim("role", user.getRole())
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    // --- ĐỔI MẬT KHẨU ---
    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại!"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không đúng!");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
