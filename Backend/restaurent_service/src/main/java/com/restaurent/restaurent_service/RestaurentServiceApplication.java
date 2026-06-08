package com.restaurent.restaurent_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class RestaurentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(RestaurentServiceApplication.class, args);
	}

}
