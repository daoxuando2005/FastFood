package com.customer.customer_service.reponsitory;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.customer.customer_service.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    
    // Phương thức custom: JPA tự động triển khai để tìm kiếm người dùng bằng userId tu auth
    Optional<User> findByUserId(Long userId);
}
