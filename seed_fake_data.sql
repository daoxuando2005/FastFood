SET NAMES utf8mb4;

-- Seed Orders
INSERT INTO order_service.orders (created_at, customer_id, delivery_address, restaurant_id, status, total_amount) VALUES
(DATE_SUB(NOW(), INTERVAL 1 DAY), 1, '123 Cầu Giấy, HN', 1, 'COMPLETED', 150000),
(DATE_SUB(NOW(), INTERVAL 2 DAY), 2, '45 Đống Đa, HN', 2, 'COMPLETED', 85000),
(DATE_SUB(NOW(), INTERVAL 3 DAY), 1, '78 Hai Bà Trưng, HN', 3, 'COMPLETED', 250000),
(DATE_SUB(NOW(), INTERVAL 4 DAY), 2, '12 Láng Hạ, HN', 1, 'COMPLETED', 120000),
(DATE_SUB(NOW(), INTERVAL 5 DAY), 1, '34 Thái Hà, HN', 2, 'COMPLETED', 90000),
(DATE_SUB(NOW(), INTERVAL 6 DAY), 2, '56 Chùa Bộc, HN', 3, 'COMPLETED', 320000),
(DATE_SUB(NOW(), INTERVAL 7 DAY), 1, '78 Tây Sơn, HN', 1, 'COMPLETED', 110000),
(DATE_SUB(NOW(), INTERVAL 8 DAY), 2, '90 Nguyễn Lương Bằng, HN', 2, 'COMPLETED', 75000),
(DATE_SUB(NOW(), INTERVAL 9 DAY), 1, '12 Tôn Đức Thắng, HN', 3, 'COMPLETED', 210000),
(DATE_SUB(NOW(), INTERVAL 10 DAY), 2, '34 Khâm Thiên, HN', 1, 'COMPLETED', 160000),
(DATE_SUB(NOW(), INTERVAL 11 DAY), 1, '56 Lê Duẩn, HN', 2, 'COMPLETED', 80000),
(DATE_SUB(NOW(), INTERVAL 12 DAY), 2, '78 Giải Phóng, HN', 3, 'COMPLETED', 180000),
(DATE_SUB(NOW(), INTERVAL 1 DAY), 1, '123 Cầu Giấy, HN', 1, 'DELIVERING', 135000),
(DATE_SUB(NOW(), INTERVAL 2 DAY), 2, '45 Đống Đa, HN', 2, 'DELIVERING', 95000),
(DATE_SUB(NOW(), INTERVAL 1 DAY), 1, '78 Hai Bà Trưng, HN', 3, 'DELIVERING', 280000),
(NOW(), 2, '12 Láng Hạ, HN', 1, 'PENDING', 140000),
(NOW(), 1, '34 Thái Hà, HN', 2, 'PENDING', 100000),
(NOW(), 2, '56 Chùa Bộc, HN', 3, 'PENDING', 350000),
(NOW(), 1, '78 Tây Sơn, HN', 1, 'PENDING', 125000),
(NOW(), 2, '90 Nguyễn Lương Bằng, HN', 2, 'CONFIRMED', 85000),
(NOW(), 1, '12 Tôn Đức Thắng, HN', 3, 'CONFIRMED', 230000),
(DATE_SUB(NOW(), INTERVAL 3 DAY), 2, '34 Khâm Thiên, HN', 1, 'CANCELLED', 170000),
(DATE_SUB(NOW(), INTERVAL 4 DAY), 1, '56 Lê Duẩn, HN', 2, 'CANCELLED', 90000),
(DATE_SUB(NOW(), INTERVAL 5 DAY), 2, '78 Giải Phóng, HN', 3, 'CANCELLED', 190000);

-- Seed Deliveries
INSERT INTO delivery_service.deliveries (created_at, delivery_address, driver_id, driver_name, order_id, recipient_name, recipient_phone, shipping_cost, status, updated_at) VALUES
(DATE_SUB(NOW(), INTERVAL 1 DAY), '123 Cầu Giấy, HN', 'TX01', 'Nguyễn Văn Tài', '5', 'Khách hàng 1', '0901111111', 15000, 'DELIVERED', NOW()),
(DATE_SUB(NOW(), INTERVAL 2 DAY), '45 Đống Đa, HN', 'TX02', 'Lê Văn Xế', '6', 'Khách hàng 2', '0902222222', 15000, 'DELIVERED', NOW()),
(DATE_SUB(NOW(), INTERVAL 3 DAY), '78 Hai Bà Trưng, HN', 'TX03', 'Trần Văn Lái', '7', 'Khách hàng 1', '0901111111', 20000, 'DELIVERED', NOW()),
(DATE_SUB(NOW(), INTERVAL 1 DAY), '123 Cầu Giấy, HN', 'TX01', 'Nguyễn Văn Tài', '17', 'Khách hàng 1', '0901111111', 15000, 'DELIVERING', NOW()),
(DATE_SUB(NOW(), INTERVAL 2 DAY), '45 Đống Đa, HN', 'TX02', 'Lê Văn Xế', '18', 'Khách hàng 2', '0902222222', 15000, 'DELIVERING', NOW()),
(DATE_SUB(NOW(), INTERVAL 1 DAY), '78 Hai Bà Trưng, HN', 'TX03', 'Trần Văn Lái', '19', 'Khách hàng 1', '0901111111', 20000, 'DELIVERING', NOW());
