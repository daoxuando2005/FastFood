-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: auth_service
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `auth_service`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `auth_service` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `auth_service`;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2026-05-20 17:16:13.265000','admin@fastfood.com','$2a$10$gVfdqPlMnkBE7NBviQo4v.GXhWpfNFO7gh9OLbFUY4AV8y.qrH3FK','ADMIN','2026-05-20 17:16:13.265000'),(2,'2026-05-20 17:17:22.946000','user@fastfood.com','$2a$10$qavV6TwA4mKkXeyZXpLUYesXyhqS8w2jV82Tl9HQpscScMChmMqr.','CUSTOMER','2026-05-20 17:17:22.946000'),(3,'2026-05-20 17:23:23.509000','do@gmail.com','$2a$10$DeHp5FDtpHm2xtcV3O79xOfI7f1n9D0y384xdlXCYg69unvPTKzIK','CUSTOMER','2026-05-20 17:23:23.509000');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `customer_service`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `customer_service` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `customer_service`;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `city` varchar(255) DEFAULT NULL,
  `customer_internal_id` bigint DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKrfbvkrffamfql7cjmen8v976v` (`email`),
  UNIQUE KEY `UKeuat1oase6eqv195jvb71a93s` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'do@gmail.com','dao xuan do','0123456789',3),(2,'user@fastfood.com','dao xuan do','06787658',2);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `restaurant_service`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `restaurant_service` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `restaurant_service`;

--
-- Table structure for table `dishes`
--

DROP TABLE IF EXISTS `dishes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dishes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_available` bit(1) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  `restaurant_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dishes`
--

LOCK TABLES `dishes` WRITE;
/*!40000 ALTER TABLE `dishes` DISABLE KEYS */;
INSERT INTO `dishes` VALUES (1,'BĂºn & Phá»Ÿ','BĂºn bĂ² Huáº¿ vá»›i giĂ² heo, cháº£ cua, huyáº¿t Ä‘áº·c biá»‡t','https://images.unsplash.com/photo-1547496502-affa22d38842?w=500&auto=format&fit=crop',_binary '','BĂºn BĂ² Huáº¿ Äáº·c Biá»‡t',65000.00,1),(2,'BĂºn & Phá»Ÿ','BĂºn bĂ² Huáº¿ tiĂªu chuáº©n vá»›i thá»‹t bĂ² vĂ  cháº£','https://images.unsplash.com/photo-1547496502-affa22d38842?w=500&auto=format&fit=crop',_binary '','BĂºn BĂ² ThÆ°á»ng',45000.00,1),(3,'Khai vá»‹','Nem lá»¥i nÆ°á»›ng than hoa, cháº¥m tÆ°Æ¡ng Ä‘áº­u','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop',_binary '','Nem Lá»¥i Huáº¿',35000.00,1),(4,'BĂ¡nh mĂ¬','BĂ¡nh mĂ¬ nhĂ¢n thá»‹t heo quay vĂ  cháº£ lá»¥a','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop',_binary '','BĂ¡nh MĂ¬ Huáº¿',25000.00,1),(6,'BĂºn & Phá»Ÿ','Phá»Ÿ vá»›i Ä‘áº§y Ä‘á»§ tĂ¡i, chĂ­n, gáº§u, gĂ¢n, sĂ¡ch','https://images.unsplash.com/photo-1547496502-affa22d38842?w=500&auto=format&fit=crop',_binary '','Phá»Ÿ BĂ² Äáº·c Biá»‡t',85000.00,2),(7,'BĂºn & Phá»Ÿ','Phá»Ÿ gĂ  ta tháº£ Ä‘á»“ng, nÆ°á»›c dĂ¹ng ngá»t thanh','https://images.unsplash.com/photo-1547496502-affa22d38842?w=500&auto=format&fit=crop',_binary '','Phá»Ÿ GĂ ',65000.00,2),(8,'Khai vá»‹','Quáº©y giĂ²n Äƒn kĂ¨m phá»Ÿ','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop',_binary '','Quáº©y NĂ³ng',10000.00,2),(9,'Pizza','Pizza Ä‘áº¿ má»ng giĂ²n vá»›i tĂ´m, má»±c, phĂ´ mai bĂ©o ngáº­y','https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop',_binary '','Pizza Háº£i Sáº£n',185000.00,3),(10,'Pizza','Pizza salami, xĂºc xĂ­ch Ă, á»›t chuĂ´ng','https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop',_binary '','Pizza Thá»‹t Nguá»™i',165000.00,3),(11,'Burger','Burger bĂ² Ăc nÆ°á»›ng than, phĂ´ mai cheddar, rau tÆ°Æ¡i','https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop',_binary '','Burger BĂ² PhĂ´ Mai',95000.00,3),(12,'Burger','Burger gĂ  chiĂªn giĂ²n sá»‘t mayo tá»i','https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop',_binary '','Burger GĂ  GiĂ²n',75000.00,3),(13,'Äá»“ Äƒn phá»¥','Khoai tĂ¢y chiĂªn giĂ²n phá»§ phĂ´ mai','https://images.unsplash.com/photo-1576867757603-05b134ebc379?w=500&auto=format&fit=crop',_binary '','Khoai TĂ¢y ChiĂªn',35000.00,3),(14,'Äá»“ uá»‘ng','NÆ°á»›c ngá»t Coca Cola lon 330ml','https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop',_binary '','Coca Cola',20000.00,3);
/*!40000 ALTER TABLE `dishes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurants` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `average_rating` double DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `owner_id` bigint NOT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `status` enum('CLOSED','MAINTENANCE','OPEN') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurants`
--

LOCK TABLES `restaurants` WRITE;
/*!40000 ALTER TABLE `restaurants` DISABLE KEYS */;
INSERT INTO `restaurants` VALUES (1,'123 LĂª Lá»£i, Q1, TP.HCM',4.8,'BĂºn bĂ² Huáº¿ truyá»n thá»‘ng, Ä‘áº­m Ä‘Ă  hÆ°Æ¡ng vá»‹ miá»n Trung','BĂºn BĂ² Huáº¿ Sá»‘ 1',1,'0901234567','OPEN'),(2,'45 Nguyá»…n Huá»‡, Q1, TP.HCM',4.6,'Phá»Ÿ bĂ² chuáº©n vá»‹ HĂ  Ná»™i, nÆ°á»›c dĂ¹ng ninh xÆ°Æ¡ng 12 tiáº¿ng','Phá»Ÿ HĂ  Ná»™i Ngon',1,'0907654321','OPEN'),(3,'789 Äiá»‡n BiĂªn Phá»§, Q3, TP.HCM',4.5,'Pizza Ă vĂ  Burger Má»¹ chĂ­nh hiá»‡u, giao hĂ ng nhanh','Pizza & Burger Fast',1,'0912345678','OPEN'),(4,'an thanh quá»³nh phá»¥ thĂ¡i bĂ¬nh',0,'chuyĂªn vá» bĂºn gĂ  phá»Ÿ vĂ  cĂ¡c loáº¡i Ä‘á»“ Äƒn vá» gĂ  ','bĂºn gĂ  thĂ¡i bĂ¬nh ',1,'0231432875','OPEN');
/*!40000 ALTER TABLE `restaurants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `order_service`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `order_service` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `order_service`;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dish_id` bigint DEFAULT NULL,
  `dish_name` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `unit_price` decimal(38,2) DEFAULT NULL,
  `order_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbioxgbv59vetrxe0ejfubep1w` (`order_id`),
  CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,2,'BĂºn BĂ² ThÆ°á»ng',1,45000.00,1),(2,1,'BĂºn BĂ² Huáº¿ Äáº·c Biá»‡t',1,65000.00,1),(3,2,'BĂºn BĂ² ThÆ°á»ng',1,45000.00,2),(4,3,'Nem Lá»¥i Huáº¿',1,35000.00,2),(5,5,'Phá»Ÿ BĂ² TĂ¡i ChĂ­n',1,70000.00,3),(6,3,'Nem Lá»¥i Huáº¿',1,35000.00,4);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `customer_id` bigint NOT NULL,
  `delivery_address` varchar(255) NOT NULL,
  `delivery_id` bigint DEFAULT NULL,
  `payment_id` bigint DEFAULT NULL,
  `restaurant_id` bigint NOT NULL,
  `status` enum('CANCELLED','COMPLETED','CONFIRMED','CREATED','DELIVERING','PAID','PENDING','PREPARING','READY_FOR_PICKUP') DEFAULT NULL,
  `total_amount` decimal(38,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'2026-05-20 17:23:33.429000',3,'HĂ  Ná»™i',NULL,NULL,1,'CANCELLED',110000.00),(2,'2026-05-20 18:05:09.740000',2,'dao xuan do - 06787658 | 654456, 46545, 546456, HĂ  Ná»™i (Ghi chĂº: 46546)',NULL,NULL,1,'PENDING',80000.00),(3,'2026-05-20 18:05:34.505000',2,'dao xuan do - 032582753 | Æ°erwer, ewrsewrew, rewe, HĂ  Ná»™i (Ghi chĂº: rwer)',NULL,NULL,2,'COMPLETED',70000.00),(4,'2026-05-20 18:07:06.559000',2,'dao xuan do - 0324234432 | an thanh, an bĂ i, an thanh, HĂ  Ná»™i (Ghi chĂº: láº¥y thĂªm tÆ°Æ¡ng)',NULL,NULL,1,'COMPLETED',35000.00);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `payment_service`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `payment_service` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `payment_service`;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` bigint DEFAULT NULL,
  `order_info` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `vnp_txn_ref` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,110000,'Order 1','PENDING','1779272613625'),(2,70000,'Order 3','PENDING','1779275134532'),(3,35000,'Order 4','PENDING','1779275226581');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `delivery_service`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `delivery_service` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `delivery_service`;

--
-- Table structure for table `deliveries`
--

DROP TABLE IF EXISTS `deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliveries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `delivery_address` varchar(255) DEFAULT NULL,
  `driver_id` varchar(255) DEFAULT NULL,
  `driver_name` varchar(255) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `order_id` varchar(255) NOT NULL,
  `recipient_name` varchar(255) DEFAULT NULL,
  `recipient_phone` varchar(255) DEFAULT NULL,
  `shipping_cost` double DEFAULT NULL,
  `status` enum('CANCELLED','COMPLETED','CONFIRMED','DELIVERED','DELIVERING','FAILED','PENDING') DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `vehicle_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKk36n9p5v7dd96hpgkwybvbogt` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliveries`
--

LOCK TABLES `deliveries` WRITE;
/*!40000 ALTER TABLE `deliveries` DISABLE KEYS */;
INSERT INTO `deliveries` VALUES (1,'2026-05-20 18:19:18.758000',NULL,'DR004','Pháº¡m VÄƒn D',NULL,'3',NULL,NULL,NULL,'DELIVERING','2026-05-20 18:21:11.941000','29H1-555.55'),(2,'2026-05-20 18:20:09.769000',NULL,'DR003','LĂª VÄƒn C',NULL,'4',NULL,NULL,NULL,'COMPLETED','2026-05-20 18:21:47.568000','29H1-999.99');
/*!40000 ALTER TABLE `deliveries` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-20 22:01:33
