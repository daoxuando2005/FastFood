package com.customer.customer_service.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.customer.customer_service.dto.AddressDTO;
import com.customer.customer_service.dto.CustomerRequest;
import com.customer.customer_service.dto.CustomerResponse;
import com.customer.customer_service.exception.ResourceAlreadyExistsException;
import com.customer.customer_service.exception.ResourceNotFoundException;
import com.customer.customer_service.model.Address;
import com.customer.customer_service.model.User;
import com.customer.customer_service.reponsitory.AddressResponsitory;
import com.customer.customer_service.reponsitory.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressResponsitory addressRepository;

    // --- 1. TẠO CUSTOMER ---
    @Override
    public CustomerResponse createCustomer(CustomerRequest request) {
        // Kiểm tra xem user từ Auth này đã có hồ sơ chưa
        if (userRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new ResourceAlreadyExistsException("Hồ sơ khách hàng đã tồn tại cho UserID: " + request.getUserId());
        }

        User user = new User();
        user.setUserId(request.getUserId());
        user.setEmail(request.getEmail());
        user.setFullname(request.getFullname() != null ? request.getFullname() : "Chưa cập nhật");
        user.setPhoneNumber(request.getPhoneNumber());

        User savedUser = userRepository.save(user);
        return mapToCustomerResponse(savedUser);
    }

    // --- 2. LẤY THÔNG TIN ---
    @Override
    public CustomerResponse getCustomerByAuthId(Long authUserId) {
        User user = userRepository.findByUserId(authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ với AuthID: " + authUserId));
        return mapToCustomerResponse(user);
    }

    // --- 3. CẬP NHẬT ---
    @Override
    public CustomerResponse updateCustomer(Long authUserId, CustomerRequest request) {
        User user = userRepository.findByUserId(authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ để cập nhật"));

        if (request.getFullname() != null && !request.getFullname().isEmpty()) {
            user.setFullname(request.getFullname());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        User updatedUser = userRepository.save(user);
        return mapToCustomerResponse(updatedUser);
    }

    // --- 4. THÊM ĐỊA CHỈ ---
    @Override
    public AddressDTO addAddress(Long authUserId, AddressDTO addressDTO) {
        // Lấy User để biết ID nội bộ (primary key)
        User user = userRepository.findByUserId(authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        Address address = new Address();
        address.setCustomerId(user.getId()); // Quan trọng: Liên kết bằng ID nội bộ của bảng Users
        address.setStreet(addressDTO.getStreet());
        address.setCity(addressDTO.getCity());

        Address savedAddress = addressRepository.save(address);
        
        // Map ngược lại DTO để trả về
        addressDTO.setId(savedAddress.getId());
        return addressDTO;
    }

    // --- 5. LẤY DANH SÁCH ĐỊA CHỈ ---
    @Override
    public List<AddressDTO> getAddressesByAuthId(Long authUserId) {
        User user = userRepository.findByUserId(authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        // Tìm trong bảng Address theo customerId (ID nội bộ)
        List<Address> addresses = addressRepository.findByCustomerId(user.getId());

        // Chuyển đổi List<Address> sang List<AddressDTO>
        return addresses.stream().map(addr -> {
            AddressDTO dto = new AddressDTO();
            dto.setId(addr.getId());
            dto.setStreet(addr.getStreet());
            dto.setCity(addr.getCity());
            return dto;
        }).collect(Collectors.toList());
    }

    // --- 6. XÓA ĐỊA CHỈ ---
    @Override
    public void deleteAddress(Long addressId) {
        if (!addressRepository.existsById(addressId)) {
            throw new ResourceNotFoundException("Không tìm thấy địa chỉ ID: " + addressId);
        }
        addressRepository.deleteById(addressId);
    }

    // --- HELPER: CHUYỂN ENTITY SANG RESPONSE DTO ---
    private CustomerResponse mapToCustomerResponse(User user) {
        CustomerResponse response = new CustomerResponse();
        response.setId(user.getId());
        response.setUserId(user.getUserId());
        response.setFullname(user.getFullname());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());

        // Lấy luôn danh sách địa chỉ để hiển thị
        List<Address> addresses = addressRepository.findByCustomerId(user.getId());
        List<AddressDTO> addressDTOS = addresses.stream().map(addr -> {
            AddressDTO dto = new AddressDTO();
            dto.setId(addr.getId());
            dto.setStreet(addr.getStreet());
            dto.setCity(addr.getCity());
            return dto;
        }).collect(Collectors.toList());

        response.setAddresses(addressDTOS);
        return response;
    }

    @Override
    public List<CustomerResponse> getAllCustomers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(this::mapToCustomerResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteCustomer(Long customerId) {
        if (!userRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Không tìm thấy khách hàng ID: " + customerId);
        }
        // Xóa tất cả các địa chỉ liên quan trước
        List<Address> addresses = addressRepository.findByCustomerId(customerId);
        addressRepository.deleteAll(addresses);
        
        // Sau đó xóa khách hàng
        userRepository.deleteById(customerId);
    }


    
    
}