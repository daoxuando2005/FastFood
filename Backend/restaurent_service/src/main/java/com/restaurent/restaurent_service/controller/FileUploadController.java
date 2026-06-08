package com.restaurent.restaurent_service.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/upload")
public class FileUploadController {

    private final Path fileStorageLocation;

    public FileUploadController() {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        try {
            // Validate file
            if (file.isEmpty()) {
                response.put("error", "Vui lòng chọn file ảnh hợp lệ!");
                return ResponseEntity.badRequest().body(response);
            }

            // Normalize file name and generate unique name
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = "";
            int i = originalFileName.lastIndexOf('.');
            if (i > 0) {
                extension = originalFileName.substring(i);
            }
            String fileName = UUID.randomUUID().toString() + extension;

            // Copy file to the target location (Replacing existing file with the same name)
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Xây dựng URL trả về (cổng 8080 của API Gateway sẽ tự động routing, 
            // nhưng file đang host ở service port 8086. Vì gateway chưa chắc routing /uploads, 
            // ta trả về URL tương đối hoặc tuyệt đối cổng gateway)
            // Tuy nhiên, để linh hoạt, trả về path.
            // Để hiển thị trên client, client sẽ map: http://localhost:8086/uploads/{fileName} 
            // Hoặc nếu Gateway có routing /uploads qua restaurant-service thì tuyệt vời.
            // Để an toàn, trả về URL gốc của restaurant service cho Frontend dùng trực tiếp.
            String fileDownloadUri = "http://localhost:8086/uploads/" + fileName;
            
            response.put("url", fileDownloadUri);
            response.put("fileName", fileName);

            return ResponseEntity.ok(response);
        } catch (IOException ex) {
            response.put("error", "Không thể lưu file: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
