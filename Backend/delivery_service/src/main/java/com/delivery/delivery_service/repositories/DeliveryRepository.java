package com.delivery.delivery_service.repositories;

import com.delivery.delivery_service.models.Delivery;
import com.delivery.delivery_service.models.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    boolean existsByOrderId(String orderId);
    Optional<Delivery> findByOrderId(String orderId);
    List<Delivery> findByDriverId(String driverId);
    List<Delivery> findByStatus(DeliveryStatus status);
}