package com.oder.order_service.model;

public enum OrderStatus {
    CREATED,            // Đã tạo đơn hàng
    PENDING,            // Chờ thanh toán
    PAID,               // Đã thanh toán, chờ nhà hàng chấp nhận
    
    // 👇 THÊM DÒNG NÀY VÀO ĐỂ KHỚP VỚI ADMIN 👇
    CONFIRMED,          // Đã xác nhận đơn hàng
    
    PREPARING,          // Nhà hàng đang chuẩn bị
    READY_FOR_PICKUP,   // Sẵn sàng cho Shipper lấy
    DELIVERING,         // Đang giao hàng
    COMPLETED,          // Hoàn thành
    CANCELLED           // Đã hủy
}