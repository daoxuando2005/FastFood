package com.customer.customer_service.reponsitory;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.customer.customer_service.model.Address;

public interface AddressResponsitory extends JpaRepository<Address, Long> {
    // Sửa tên tham số cho dễ hiểu
    List<Address> findByCustomerId(Long customerId);
}