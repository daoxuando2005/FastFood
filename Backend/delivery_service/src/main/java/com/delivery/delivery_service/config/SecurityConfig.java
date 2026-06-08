package com.delivery.delivery_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Tắt chống giả mạo
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/deliveries/**").permitAll() // Cho phép vào API delivery
                .anyRequest().permitAll() // Cho phép tất cả các API khác (để test)
            );
        return http.build();
    }
}