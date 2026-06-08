package com.customer.customer_service.service;

import java.util.List;

import com.customer.customer_service.dto.AddressDTO;
import com.customer.customer_service.dto.CustomerRequest;
import com.customer.customer_service.dto.CustomerResponse;

public interface UserService {
    CustomerResponse createCustomer(CustomerRequest request);
    CustomerResponse getCustomerByAuthId(Long authUserId);
    CustomerResponse updateCustomer(Long authUserId, CustomerRequest request);
    List<CustomerResponse> getAllCustomers();
    void deleteCustomer(Long customerId);


    AddressDTO addAddress(Long authUserId, AddressDTO addressDTO);
    List<AddressDTO> getAddressesByAuthId(Long authUserId);
    void deleteAddress(Long addressId);
}