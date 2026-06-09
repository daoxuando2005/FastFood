SET NAMES utf8mb4;

INSERT INTO delivery_service.deliveries (
    created_at, delivery_address, driver_id, driver_name, 
    order_id, recipient_name, recipient_phone, shipping_cost, 
    status, updated_at
)
SELECT 
    o.created_at, 
    o.delivery_address, 
    CONCAT('TX', FLOOR(RAND() * 90 + 10)), 
    ELT(FLOOR(RAND() * 5) + 1, 'Nguyễn Văn Tài', 'Lê Văn Xế', 'Trần Văn Lái', 'Phạm Đình Tốc', 'Hoàng Vận Chuyển'), 
    CAST(o.id AS CHAR), 
    c.fullname, 
    c.phone_number, 
    15000, 
    IF(o.status = 'COMPLETED', 'DELIVERED', 'DELIVERING'), 
    NOW()
FROM order_service.orders o
LEFT JOIN customer_service.customers c ON o.customer_id = c.id
WHERE o.status IN ('COMPLETED', 'DELIVERING')
AND CAST(o.id AS CHAR) NOT IN (SELECT order_id FROM delivery_service.deliveries);
