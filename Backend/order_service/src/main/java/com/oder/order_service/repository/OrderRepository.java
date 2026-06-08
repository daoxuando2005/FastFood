package com.oder.order_service.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.oder.order_service.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Tìm tất cả đơn hàng của một khách hàng (dùng cho lịch sử đơn hàng)
    List<Order> findByCustomerId(Long customerId);
}
