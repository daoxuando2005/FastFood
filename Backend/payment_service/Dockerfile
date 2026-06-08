# 1. Chọn môi trường Java (JDK 17 hoặc version bạn đang dùng)
FROM eclipse-temurin:21-jdk-alpine

# 2. Tạo thư mục làm việc trong container
WORKDIR /app

# 3. Copy file JAR đã build từ máy thật vào trong container
# Lưu ý: Tên file jar có thể khác, kiểm tra trong thư mục target/
COPY target/*.jar app.jar

# 4. Lệnh chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]