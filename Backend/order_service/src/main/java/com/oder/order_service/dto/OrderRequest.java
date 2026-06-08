package com.oder.order_service.dto;
import java.util.List;

import lombok.Data;

@Data
public class OrderRequest {
    private Long userId;        // ID khách hàng (từ Auth/Customer)
    private Long restaurantId;  // ID nhà hàng
    private String deliveryAddress; // Địa chỉ giao hàng cụ thể
    private List<OrderItemRequest> items; // Danh sách món

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}