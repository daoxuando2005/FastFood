package com.payment.payment_service.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
// import lombok.Data;
// import lombok.NoArgsConstructor;

@Entity
@Table(name="orders")
// @Data
// @NoArgsConstructor

public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private  String orderInfo;
    private  Long amount;
    private String vnpTxnRef;// Mã tham chiếu
    // Trạng thái đơn hàng, mặc định là PENDING (chưa thanh toán)
    // Khi IPN gọi về, ta sẽ cập nhật thành "PAID" (đã thanh toán) hoặc "FAILED" (thất bại)
    private String status;// PENDING, PAID, FAILED
/**
     * Đây là cột RẤT QUAN TRỌNG.
     * Nó lưu mã giao dịch (vnp_TxnRef) mà BẠN tự tạo ra.
     * Khi VNPay gọi IPN về, bạn sẽ dùng mã này để tìm lại đơn hàng
     * trong CSDL của mình và cập nhật trạng thái.
     */
    

    public Order(String orderInfo, Long amount, String vnpTxnRef) {
        this.amount = amount;
        this.orderInfo = orderInfo;
        this.status = "PENDING";
        this.vnpTxnRef = vnpTxnRef;
    }

    public Order() {
    }

    
    // public Order(String orderInfo, long l, String string) {
    //     throw new UnsupportedOperationException("Not supported yet.");
    // }  

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderInfo() {
        return orderInfo;
    }
    public void setOrderInfo(String orderInfo) {
        this.orderInfo = orderInfo;
    }

    public Long getAmount() {
        return amount;
    }
    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getVnpTxnRef() {
        return vnpTxnRef;
    }
    public void setVnpTxnRef(String vnpTxnRef) {
        this.vnpTxnRef = vnpTxnRef;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
}
