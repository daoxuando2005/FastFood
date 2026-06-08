package com.payment.payment_service.model;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data // Annotation này của Lombok sẽ tự tạo Getter, Setter, toString...
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    
    // Đảm bảo tên biến chính xác như thế này:
    private String orderId; 
    private long amount;

    // Nếu Lombok của bạn bị lỗi không nhận, bạn có thể tự viết hàm Setter thủ công dưới đây để chắc ăn:
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setAmount(long amount) {
        this.amount = amount;
    }

    public long getAmount() {
        return amount;
    }
}