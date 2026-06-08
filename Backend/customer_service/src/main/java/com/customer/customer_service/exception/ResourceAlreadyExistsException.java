package com.customer.customer_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ResourceAlreadyExistsException extends RuntimeException{
    
    private static final long serialVersionUID = 1L;  //Ma serialVersionUID

    //Constructor
    public ResourceAlreadyExistsException(String message){
        super(message);
    }
    }

