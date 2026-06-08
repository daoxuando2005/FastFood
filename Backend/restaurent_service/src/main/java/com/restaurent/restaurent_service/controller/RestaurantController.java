package com.restaurent.restaurent_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.restaurent.restaurent_service.dto.DishRequest;
import com.restaurent.restaurent_service.dto.DishResponse;
import com.restaurent.restaurent_service.dto.RestaurantRequest;
import com.restaurent.restaurent_service.dto.RestaurantResponse;
import com.restaurent.restaurent_service.service.RestaurantService;

@RestController
@RequestMapping("/api/v1/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    // --- NHÀ HÀNG ---

    // Tạo nhà hàng (Chỉ được tạo 1 lần)
    @PostMapping
    public ResponseEntity<?> createRestaurant(@RequestBody RestaurantRequest request) {
        try {
            return new ResponseEntity<>(restaurantService.createRestaurant(request), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // Trả về lỗi nếu đã có nhà hàng
        }
    }

    // Lấy danh sách tất cả (Cho admin xem)
    @GetMapping
    public ResponseEntity<List<RestaurantResponse>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }

    // Xem chi tiết nhà hàng
    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurant(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }
    
    // API cho Owner xem nhà hàng của mình
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<RestaurantResponse> getMyRestaurant(@PathVariable Long ownerId) {
        return ResponseEntity.ok(restaurantService.getRestaurantByOwnerId(ownerId));
    }
    
    // Cập nhật thông tin nhà hàng
    @PutMapping("/{id}")
    public ResponseEntity<RestaurantResponse> updateRestaurant(@PathVariable Long id, @RequestBody RestaurantRequest request) {
        return ResponseEntity.ok(restaurantService.updateRestaurantInfo(id, request));
    }

    // Xóa nhà hàng
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRestaurant(@PathVariable Long id) {
        restaurantService.deleteRestaurant(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Xóa nhà hàng thành công"));
    }

    // --- MÓN ĂN (MENU CRUD) ---

    // Thêm món ăn
    @PostMapping("/{restaurantId}/dishes")
    public ResponseEntity<?> addDish(@PathVariable Long restaurantId, @RequestBody DishRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Tên món ăn không được để trống"));
        }
        if (request.getPrice() == null || request.getPrice().doubleValue() < 0) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Giá món ăn không hợp lệ"));
        }
        if (request.getCategory() == null || request.getCategory().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Danh mục món ăn không được để trống"));
        }
        if (request.getImageUrl() == null || request.getImageUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Hình ảnh món ăn không được để trống"));
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Mô tả món ăn không được để trống"));
        }
        return new ResponseEntity<>(restaurantService.createDish(restaurantId, request), HttpStatus.CREATED);
    }
    
    // [MỚI] Cập nhật món ăn (Sửa giá, tên, tình trạng còn hàng...)
    // /api/v1/restaurants/dishes/{dishId}
    @PutMapping("/dishes/{dishId}")
    public ResponseEntity<?> updateDish(@PathVariable Long dishId, @RequestBody DishRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Tên món ăn không được để trống"));
        }
        if (request.getPrice() == null || request.getPrice().doubleValue() < 0) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Giá món ăn không hợp lệ"));
        }
        if (request.getCategory() == null || request.getCategory().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Danh mục món ăn không được để trống"));
        }
        if (request.getImageUrl() == null || request.getImageUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Hình ảnh món ăn không được để trống"));
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Mô tả món ăn không được để trống"));
        }
        return ResponseEntity.ok(restaurantService.updateDish(dishId, request));
    }
    
    // [MỚI] Xóa món ăn
    @DeleteMapping("/dishes/{dishId}")
    public ResponseEntity<?> deleteDish(@PathVariable Long dishId) {
        restaurantService.deleteDish(dishId);
        return ResponseEntity.ok(java.util.Map.of("message", "Xóa món ăn thành công"));
    }

    // Lấy menu của nhà hàng
    @GetMapping("/{restaurantId}/menu")
    public ResponseEntity<List<DishResponse>> getMenu(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(restaurantService.getMenuByRestaurantId(restaurantId));
    }

    // Endpoint nội bộ cho Order Service
    @GetMapping("/dishes/{dishId}")
    public ResponseEntity<DishResponse> getDishDetails(@PathVariable Long dishId) {
        return ResponseEntity.ok(restaurantService.getDishById(dishId));
    }
}