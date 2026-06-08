package com.payment.payment_service.response;

// import lombok.AllArgsConstructor;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// @Data
// @AllArgsConstructor
// @NoArgsConstructor
public class PaymentResponse {
    private String code;
    private String message;
    private String paymentUrl;

    public PaymentResponse(String code, String message, String paymentUrl) {
        this.code = code;
        this.message = message;
        this.paymentUrl = paymentUrl;
    }

    public PaymentResponse() {
    }

    public String getCode() {
        return code;
    }
    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }

    public String getPaymentUrl() {
        return paymentUrl;
    }
    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }


}
