package com.delivery.delivery_service.exceptions;

import lombok.Getter;

/**
 * Custom Exception cho Delivery Service
 */
@Getter
public class DeliveryException extends RuntimeException {
    private String errorCode;
    private String message;
    
    public DeliveryException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.message = message;
    }
    
    public DeliveryException(String message) {
        super(message);
        this.errorCode = "DELIVERY_ERROR";
        this.message = message;
    }
}
