package com.auth.auth_service.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

import java.util.Date;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity 
@Table(name = "users") 
@Getter 
@Setter 
@NoArgsConstructor
// 1. Đã sửa lỗi: Xóa bỏ "<updatedAt>" thừa ở tên class
public class User {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

    @Column(nullable = false, unique = true) 
    private String email;

    @Column(nullable = false) 
    private String password;

    @Column(nullable = false)
    private String role;

    @CreationTimestamp 
    @Column(updatable = false, nullable = false) 
    private Date createdAt;

    @UpdateTimestamp 
    @Column(nullable = false)
    private Date updatedAt;

    // 2. Đã sửa lỗi: XÓA hoàn toàn hàm getEmail() thủ công ở đây.
    // Lý do: Annotation @Getter của Lombok (ở dòng 19) đã tự động tạo hàm này rồi.
    // Việc bạn viết lại hàm này với dòng "throw exception" chính là nguyên nhân gây lỗi.
}