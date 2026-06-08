package com.customer.customer_service.controller;

import com.customer.customer_service.dto.AddressDTO;
import com.customer.customer_service.dto.CustomerRequest;
import com.customer.customer_service.dto.CustomerResponse;
import com.customer.customer_service.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
public class UserController {

    @Autowired
    private UserService userService;

    // --- CUSTOMER ---

    @PostMapping
    // [QUAN TRỌNG] Đã sửa: Nhận CustomerRequest (DTO) thay vì User (Entity)
    public ResponseEntity<CustomerResponse> createCustomer(@RequestBody CustomerRequest request) {
        return new ResponseEntity<>(userService.createCustomer(request), HttpStatus.CREATED);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<CustomerResponse> getCustomer(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getCustomerByAuthId(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<CustomerResponse> updateCustomer(@PathVariable Long userId, @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(userService.updateCustomer(userId, request));
    }
    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        return ResponseEntity.ok(userService.getAllCustomers());
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long userId) {
        userService.deleteCustomer(userId);
        return ResponseEntity.noContent().build();
    }


    // --- ADDRESS ---

    @PostMapping("/{userId}/addresses")
    public ResponseEntity<AddressDTO> addAddress(@PathVariable Long userId, @RequestBody AddressDTO addressDTO) {
        return new ResponseEntity<>(userService.addAddress(userId, addressDTO), HttpStatus.CREATED);
    }

    @GetMapping("/{userId}/addresses")
    public ResponseEntity<List<AddressDTO>> getAddresses(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getAddressesByAuthId(userId));
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long addressId) {
        userService.deleteAddress(addressId);
        return ResponseEntity.noContent().build();
    }
}