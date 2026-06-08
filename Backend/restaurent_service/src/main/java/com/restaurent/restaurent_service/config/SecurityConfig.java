package com.restaurent.restaurent_service.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(401);
                    response.getWriter().write("{\"error\": \"Bạn chưa đăng nhập hoặc Token không hợp lệ!\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(403);
                    response.getWriter().write("{\"error\": \"Bạn không có quyền truy cập chức năng này!\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Allow GET methods publicly
                .requestMatchers(HttpMethod.GET, "/api/v1/restaurants/**").permitAll()
                // Cho phép DispatcherServlet truy cập /error để trả về lỗi 404/500
                .requestMatchers("/error").permitAll()
                // Require ADMIN or OWNER for modifications
                .requestMatchers(HttpMethod.POST, "/api/v1/restaurants/**").hasAnyAuthority("ADMIN", "OWNER")
                .requestMatchers(HttpMethod.PUT, "/api/v1/restaurants/**").hasAnyAuthority("ADMIN", "OWNER")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/restaurants/**").hasAnyAuthority("ADMIN", "OWNER")
                // Any other request must be authenticated
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
