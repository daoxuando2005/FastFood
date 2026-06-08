package com.restaurent.restaurent_service.model;
public enum RestaurantStatus { OPEN, CLOSED, MAINTENANCE; 

    public static RestaurantStatus getOPEN() {
        return OPEN;
    }

    public static RestaurantStatus getCLOSED() {
        return CLOSED;
    }

    public static RestaurantStatus getMAINTENANCE() {
        return MAINTENANCE;
    }
}