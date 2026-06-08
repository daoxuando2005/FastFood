package com.customer.customer_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "addresses")
@Data
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_internal_id") // Liên kết với ID nội bộ của Customer
    private Long customerId; 

    private String street;
    private String city;
}