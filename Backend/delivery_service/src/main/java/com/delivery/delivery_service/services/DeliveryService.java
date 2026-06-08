package com.delivery.delivery_service.services;

import com.delivery.delivery_service.client.OrderClient; // 1. Import OrderClient
import com.delivery.delivery_service.models.Delivery;
import com.delivery.delivery_service.models.DeliveryStatus;
import com.delivery.delivery_service.repositories.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Random;
import java.util.Arrays;
import java.time.LocalDateTime;

@Service
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private OrderClient orderClient; // 2. Tiêm OrderClient vào đây

    // --- 1. DANH SÁCH TÀI XẾ GIẢ LẬP ---
    private final List<DriverInfo> availableDrivers = Arrays.asList(
        new DriverInfo("DR001", "Nguyễn Văn A", "29H1-123.45"),
        new DriverInfo("DR002", "Trần Thị B", "29H1-678.90"),
        new DriverInfo("DR003", "Lê Văn C", "29H1-999.99"),
        new DriverInfo("DR004", "Phạm Văn D", "29H1-555.55")
    );

    private static class DriverInfo {
        String id; String name; String vehicle;
        public DriverInfo(String id, String name, String vehicle) {
            this.id = id; this.name = name; this.vehicle = vehicle;
        }
    }

    // --- 2. HÀM TỰ ĐỘNG TẠO ĐƠN & GÁN TÀI XẾ ---
    public Delivery createAndAutoAssign(String orderId) {
        if (deliveryRepository.existsByOrderId(orderId)) {
            return deliveryRepository.findByOrderId(orderId).orElse(null);
        }

        Delivery delivery = new Delivery();
        delivery.setOrderId(orderId);
        
        Random rand = new Random();
        DriverInfo driver = availableDrivers.get(rand.nextInt(availableDrivers.size()));

        delivery.setDriverId(driver.id);
        delivery.setDriverName(driver.name);
        delivery.setVehicleNumber(driver.vehicle);
        delivery.setStatus(DeliveryStatus.CONFIRMED); 
        
        System.out.println(">>> 🛵 Đã gán đơn " + orderId + " cho tài xế: " + driver.name);

        return deliveryRepository.save(delivery);
    }

    // --- 3. HÀM CẬP NHẬT TRẠNG THÁI (QUAN TRỌNG NHẤT) ---
    public Delivery updateDeliveryStatus(Long id, DeliveryStatus status) {
        Delivery delivery = getDeliveryById(id);
        
        // Cập nhật trạng thái tại Delivery Service
        delivery.setStatus(status);
        Delivery savedDelivery = deliveryRepository.save(delivery);

        // 👇 LOGIC ĐỒNG BỘ: Nếu hoàn thành -> Gọi về Order Service 👇
        if (status == DeliveryStatus.COMPLETED || status == DeliveryStatus.DELIVERED) {
            try {
                System.out.println(">>> ✅ Shipper đã giao xong. Đang báo về Order Service...");
                
                // Parse orderId sang Long (Vì bên Order dùng Long)
                Long orderIdLong = Long.parseLong(delivery.getOrderId());
                
                // Gọi API báo hoàn thành
                orderClient.updateOrderStatus(orderIdLong, "COMPLETED");
                
                System.out.println(">>> ✅ Đồng bộ Order thành công!");
            } catch (Exception e) {
                System.err.println(">>> ⚠️ Lỗi gọi về Order Service: " + e.getMessage());
                // Không throw lỗi để Admin Delivery vẫn thao tác được
            }
        }
        
        return savedDelivery;
    }

    // --- CÁC HÀM KHÁC GIỮ NGUYÊN ---

    public Delivery createDelivery(Delivery delivery) {
        if (deliveryRepository.existsByOrderId(delivery.getOrderId())) {
            throw new RuntimeException("Order ID already exists!");
        }
        delivery.setStatus(DeliveryStatus.PENDING);
        return deliveryRepository.save(delivery);
    }

    public Delivery getDeliveryById(Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery not found: " + id));
    }
    
    public Delivery getDeliveryByOrderId(String orderId) {
        return deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Delivery not found for Order: " + orderId));
    }

    public Delivery assignDriver(Long id, String driverId, String driverName, String vehicleNumber) {
        Delivery delivery = getDeliveryById(id);
        if (delivery.getStatus() != DeliveryStatus.PENDING) {
            throw new RuntimeException("Can only assign driver to PENDING delivery");
        }
        delivery.setDriverId(driverId);
        delivery.setDriverName(driverName);
        delivery.setVehicleNumber(vehicleNumber);
        delivery.setStatus(DeliveryStatus.CONFIRMED);
        return deliveryRepository.save(delivery);
    }

    public Delivery updateDelivery(Long id, Delivery updatedDelivery) {
        Delivery delivery = getDeliveryById(id);
        if(updatedDelivery.getRecipientName() != null) delivery.setRecipientName(updatedDelivery.getRecipientName());
        if(updatedDelivery.getRecipientPhone() != null) delivery.setRecipientPhone(updatedDelivery.getRecipientPhone());
        if(updatedDelivery.getDeliveryAddress() != null) delivery.setDeliveryAddress(updatedDelivery.getDeliveryAddress());
        return deliveryRepository.save(delivery);
    }

    public void deleteDelivery(Long id) {
        Delivery delivery = getDeliveryById(id);
        if (delivery.getStatus() != DeliveryStatus.PENDING) {
            throw new RuntimeException("Can only delete PENDING delivery");
        }
        deliveryRepository.deleteById(id);
    }
    
    public List<Delivery> getAllDeliveries() { return deliveryRepository.findAll(); }
    public List<Delivery> getDeliveriesByDriver(String driverId) { return deliveryRepository.findByDriverId(driverId); }
    public List<Delivery> getDeliveriesByStatus(DeliveryStatus status) { return deliveryRepository.findByStatus(status); }
    
    public Delivery completeDelivery(Long id) {
        return updateDeliveryStatus(id, DeliveryStatus.DELIVERED);
    }
    
    public Delivery failDelivery(Long id, String reason) {
        Delivery delivery = getDeliveryById(id);
        delivery.setStatus(DeliveryStatus.FAILED);
        return deliveryRepository.save(delivery);
    }
}