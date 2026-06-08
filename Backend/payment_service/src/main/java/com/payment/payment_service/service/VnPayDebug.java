// package com.payment.payment_service.service;
// import java.net.URLEncoder;
// import java.nio.charset.StandardCharsets;
// import java.text.SimpleDateFormat;
// import java.util.ArrayList;
// import java.util.Calendar;
// import java.util.Iterator;
// import java.util.List;
// import java.util.Map;
// import java.util.TimeZone;
// import java.util.TreeMap;

// import javax.crypto.Mac;
// import javax.crypto.spec.SecretKeySpec;
// public class VnPayDebug {
//     public static void main(String[] args) {
//         try {
//             // ==========================================
//             // 1. DÁN KEY CỦA BẠN VÀO ĐÂY (CẨN THẬN DẤU CÁCH)
//             // ==========================================
//             String vnp_TmnCode = "HFH0EW8X";  
//             String vnp_HashSecret = "5P56F0FIWJVCRBST3WQH4EW6T2TKXT0M"; // <-- Thay Chuỗi bí mật dài ngoằng của bạn
//             // ==========================================

//             String vnp_TxnRef = String.valueOf(System.currentTimeMillis());
//             String vnp_IpAddr = "127.0.0.1";
//             String vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

//             Map<String, String> vnp_Params = new TreeMap<>(); // Dùng TreeMap để tự sắp xếp
//             vnp_Params.put("vnp_Version", "2.1.0");
//             vnp_Params.put("vnp_Command", "pay");
//             vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
//             vnp_Params.put("vnp_Amount", "10000000"); // 100,000 VND
//             vnp_Params.put("vnp_CurrCode", "VND");
//             vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
//             vnp_Params.put("vnp_OrderInfo", "Test truc tiep Java");
//             vnp_Params.put("vnp_OrderType", "other");
//             vnp_Params.put("vnp_Locale", "vn");
//             vnp_Params.put("vnp_ReturnUrl", "http://localhost:8080/return");
//             vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

//             // Timezone Việt Nam
//             Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
//             SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
//             String vnp_CreateDate = formatter.format(cld.getTime());
//             vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

//             cld.add(Calendar.MINUTE, 15);
//             String vnp_ExpireDate = formatter.format(cld.getTime());
//             vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

//             // Tạo chuỗi Hash
//             List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
//             StringBuilder hashData = new StringBuilder();
//             StringBuilder query = new StringBuilder();
//             Iterator<String> itr = fieldNames.iterator();
//             while (itr.hasNext()) {
//                 String fieldName = itr.next();
//                 String fieldValue = vnp_Params.get(fieldName);
//                 if ((fieldValue != null) && (fieldValue.length() > 0)) {
//                     hashData.append(fieldName);
//                     hashData.append('=');
//                     hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
//                     query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
//                     query.append('=');
//                     query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
//                     if (itr.hasNext()) {
//                         query.append('&');
//                         hashData.append('&');
//                     }
//                 }
//             }

//             // Ký dữ liệu
//             String queryUrl = query.toString();
//             String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashData.toString());
//             queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
//             String paymentUrl = vnp_Url + "?" + queryUrl;

//             System.out.println("\n✅ LINK THANH TOÁN (Copy link này dán vào trình duyệt):");
//             System.out.println(paymentUrl);

//         } catch (Exception e) {
//             e.printStackTrace();
//         }
//     }

//     public static String hmacSHA512(final String key, final String data) {
//         try {
//             if (key == null || data == null) throw new NullPointerException();
//             final Mac hmac512 = Mac.getInstance("HmacSHA512");
//             byte[] hmacKeyBytes = key.getBytes();
//             final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
//             hmac512.init(secretKey);
//             byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
//             byte[] result = hmac512.doFinal(dataBytes);
//             StringBuilder sb = new StringBuilder(2 * result.length);
//             for (byte b : result) {
//                 sb.append(String.format("%02x", b));
//             }
//             return sb.toString();
//         } catch (Exception ex) {
//             return "";
//         }
//     }
// }
