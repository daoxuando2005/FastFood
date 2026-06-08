package com.payment.payment_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.payment.payment_service.model.Order;
// import com.payment.payment_service.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByVnpTxnRef(String vnpTxnRef);
}
