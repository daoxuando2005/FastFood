# 🍔 Hệ Thống Đặt Đồ Ăn Trực Tuyến (FastFood Microservices)

Đây là dự án Phát triển Phần mềm Hướng Dịch vụ (Service-Oriented Programming). Hệ thống được thiết kế theo kiến trúc **Microservices**, sử dụng **Spring Boot** cho Backend và **React** cho Frontend, giúp đảm bảo tính khả mở, linh hoạt và hiệu suất cao.

## 🛠 Công Nghệ Sử Dụng

### Backend (Microservices)
- **Framework:** Spring Boot 3.x, Spring Cloud
- **Ngôn ngữ:** Java 17
- **Cơ sở dữ liệu:** MySQL
- **Bảo mật:** Spring Security & JWT (JSON Web Token)
- **Service Registry:** Netflix Eureka Server
- **Routing:** Spring Cloud API Gateway

### Frontend
- **Framework chính:** React.js (Sử dụng Vite)
- **Giao diện:** HTML/CSS/JavaScript thuần (dành cho phiên bản Basic)

---

## 🏗 Cấu Trúc Hệ Thống (Kiến Trúc Microservices)

Toàn bộ Backend được chia nhỏ thành nhiều dịch vụ (Service) chạy độc lập để dễ dàng bảo trì:

1. **Eureka Server (`eureka_server`)**: Máy chủ trung tâm lưu trữ danh bạ. Các service khác sẽ tự động ghi danh vào đây.
2. **API Gateway (`gateway`)**: "Cửa ngõ" điều hướng mọi Request từ giao diện xuống đúng Service cần thiết (Cổng 8080).
3. **Auth Service (`auth_service`)**: Xử lý Đăng ký, Đăng nhập và mã hóa Token JWT.
4. **Restaurant Service (`restaurent_service`)**: Quản lý thông tin nhà hàng, CRUD thực đơn món ăn. (Có phân quyền Admin/Owner).
5. **Customer Service (`customer_service`)**: Quản lý hồ sơ và địa chỉ khách hàng.
6. **Order Service (`order_service`)**: Xử lý quy trình đặt hàng.
7. **Delivery Service (`delivery_service`)**: Quản lý giao nhận đồ ăn (Shipper).
8. **Payment Service (`payment_service`)**: Tích hợp và xử lý thanh toán.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Chuẩn Bị Môi Trường
- Cài đặt **JDK 17** trở lên.
- Cài đặt **Node.js** (để chạy Frontend).
- Bật **MySQL** (Dùng XAMPP hoặc Docker) ở cổng mặc định `3306`.

### 2. Thiết Lập Database
- Tạo sẵn các Database trống trong MySQL tương ứng với từng Service (VD: `auth_service`, `restaurant_service`...). Spring Boot (JPA) sẽ tự động tạo bảng khi khởi động.
- *(Hoặc bạn có thể Import trực tiếp file `database_backup.sql` nằm ở thư mục gốc của dự án vào MySQL).*

### 3. Khởi Động Backend (BẮT BUỘC CHẠY THEO THỨ TỰ)
Mở dự án bằng **IntelliJ IDEA**. Bạn cần tìm các file `...Application.java` và nhấn nút Run theo đúng thứ tự sau:
1. **Chạy đầu tiên:** `EurekaServerApplication` (Chờ khởi động xong hoàn toàn).
2. **Chạy thứ hai:** `ApiGatewayApplication` (Đây là cổng chính 8080).
3. **Chạy các Service còn lại:** Bạn có thể bật đồng loạt `AuthServiceApplication`, `RestaurantServiceApplication`, `OrderServiceApplication`... (Thứ tự không quan trọng).

### 4. Khởi Động Frontend
Mở Terminal của VSCode hoặc IntelliJ, di chuyển vào thư mục Frontend:

**Nếu dùng phiên bản React (Giao diện chính):**
```bash
cd Frontend-React
npm install
npm run dev
```
👉 Truy cập trình duyệt: `http://localhost:5173`

**Nếu dùng phiên bản cơ bản (HTML/JS thuần):**
```bash
cd Frontend
node server.js
```
👉 Truy cập trình duyệt: `http://localhost:3000`

---

## 🛡 Đặc Điểm Nổi Bật Về Bảo Mật
- **Kiểm soát truy cập nghiêm ngặt:** Các API thay đổi dữ liệu lõi (Thêm/Sửa/Xóa món ăn) đều bắt buộc đi qua bộ lọc `JwtAuthenticationFilter`, kiểm tra quyền hạn `ADMIN` hoặc `OWNER`.
- **Custom Exception Handling:** Bắt mọi ngoại lệ (401 Unauthorized, 403 Forbidden, 404 Not Found...) và trả về phản hồi chuẩn JSON Tiếng Việt thay vì trang lỗi thô cứng của Spring Boot.
- **Stateless Session:** Mọi giao tiếp đều dùng JWT không lưu trữ trạng thái, giúp hệ thống không bị nghẽn bộ nhớ khi có hàng ngàn user truy cập cùng lúc.
