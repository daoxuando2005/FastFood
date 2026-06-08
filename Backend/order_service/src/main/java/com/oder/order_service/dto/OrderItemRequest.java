package com.oder.order_service.dto;
import lombok.Data;

@Data
public class OrderItemRequest {
    private Long dishId;
    private Integer quantity;

    public Long getDishId() {
        return dishId;
    }

    public void setDishId(Long dishId) {
        this.dishId = dishId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}