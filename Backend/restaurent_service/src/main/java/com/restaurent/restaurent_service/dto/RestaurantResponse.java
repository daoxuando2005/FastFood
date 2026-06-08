package com.restaurent.restaurent_service.dto;
import java.util.List;

import com.restaurent.restaurent_service.model.RestaurantStatus;

import lombok.Data;

@Data
public class RestaurantResponse {
    private Long id;
    private Long ownerId;
    private String name;
    private String description;
    private String address;
    private String phoneNumber;
    private RestaurantStatus status;
    private Double averageRating;
    
    // Quan trọng: Kèm danh sách món ăn để Frontend hiển thị
    private List<DishResponse> menu; 

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public RestaurantStatus getStatus() {
        return status;
    }

    public void setStatus(RestaurantStatus status) {
        this.status = status;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public List<DishResponse> getMenu() {
        return menu;
    }

    public void setMenu(List<DishResponse> menu) {
        this.menu = menu;
    }
}