package com.restaurent.restaurent_service.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurent.restaurent_service.model.Restaurant;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    // Có thể thêm tìm kiếm theo tên sau này
    
    Optional<Restaurant> findByOwnerId(Long ownerId);
    
}
