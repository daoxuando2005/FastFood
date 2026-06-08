package com.payment.payment_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class PaymentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(PaymentServiceApplication.class, args);
	}
	//docker-compose down
	//mvn clean package -DskipTests
	//docker-compose up -d --build
	//docker ps -a

	//docker logs payment_app_container

	//mvn clean spring-boot:run

	// Ngân hàng	NCB
	// Số thẻ	9704198526191432198
	// Tên chủ thẻ	NGUYEN VAN A
	// Ngày phát hành	07/15
	// Mật khẩu OTP	123456
}
