package com.delivery.delivery_service.models;

public enum DeliveryStatus {
    PENDING("Chờ xử lý"),
    CONFIRMED("Đã xác nhận"),
    
    // 👇 SỬA DÒNG NÀY: Đổi IN_TRANSIT thành DELIVERING
    DELIVERING("Đang vận chuyển"), 
    
    DELIVERED("Đã giao hàng"), // Lưu ý: DELIVERED (Đã giao) khác DELIVERING (Đang giao)
    
    // Nếu bạn muốn khớp 100% với code Frontend mình gửi, hãy đổi DELIVERED thành COMPLETED
    // Hoặc giữ nguyên DELIVERED thì phải sửa JS. 
    // Tốt nhất sửa thành COMPLETED để khớp với trạng thái "Hoàn thành" chung.
    COMPLETED("Đã giao hàng thành công"), 

    FAILED("Giao hàng thất bại"),
    CANCELLED("Đã hủy");

    private final String description;

    DeliveryStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}