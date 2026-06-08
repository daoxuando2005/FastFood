package com.payment.payment_service.response;

public class VnPayIpnResponse {

    private String RspCode;
    private String Message;

    public VnPayIpnResponse() {
    }

    // ĐÚNG THỨ TỰ: rspCode trước, message sau
    public VnPayIpnResponse(String rspCode, String message) {
        this.RspCode = rspCode;
        this.Message = message;
    }

    public String getRspCode() {
        return RspCode;
    }

    public void setRspCode(String rspCode) {
        this.RspCode = rspCode;
    }

    public String getMessage() {
        return Message;
    }

    public void setMessage(String message) {
        this.Message = message;
    }
}
