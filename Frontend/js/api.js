// Cấu hình Cổng API Gateway
const GATEWAY_URL = "http://localhost:8080";

// Định nghĩa đường dẫn đến từng Service (Gateway sẽ định tuyến)
const API = {
    AUTH:       `${GATEWAY_URL}/api/auth`,
    RESTAURANT: `${GATEWAY_URL}/api/v1/restaurants`, // Gateway chuyển sang 8086
    ORDER:      `${GATEWAY_URL}/api/v1/orders`,      // Gateway chuyển sang 808
    CUSTOMER:   `${GATEWAY_URL}/api/v1/customers`,   // Gateway chuyển sang 808
    PAYMENT:    `${GATEWAY_URL}/api/v1/payments`,    // Gateway chuyển sang 808
    DELIVERY:   `${GATEWAY_URL}/api/deliveries`   // Gateway chuyển sang 808
};

// Hàm gọi API chung (Tự động gắn Token JWT)
async function apiRequest(url, method = "GET", body = null) {
    const headers = { "Content-Type": "application/json" };
    
    // Lấy token từ LocalStorage (nếu đã đăng nhập)
    const authData = JSON.parse(localStorage.getItem("foodhub_auth"));
    if (authData?.token) {
        headers["Authorization"] = `Bearer ${authData.token}`;
    }

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    try {
        const res = await fetch(url, config);
        
        // Xử lý lỗi 401 (Hết hạn token hoặc Sai mật khẩu)
        if (res.status === 401) {
            if (url.includes("/login")) {
                throw new Error("Sai email hoặc mật khẩu!");
            } else {
                alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                localStorage.removeItem("foodhub_auth");
                window.location.href = "/auth/login.html";
                return null;
            }
        }

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `Lỗi HTTP ${res.status}`);
        }

        if (res.status === 204) return null; // No Content
        return await res.json();

    } catch (err) {
        console.error("API Error:", err);
        throw err; // Ném lỗi để file JS con xử lý hiển thị
    }
}

// Hàm format tiền tệ VNĐ
function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Xuất các hàm ra global để dùng ở file khác
window.API = API;
window.apiRequest = apiRequest;
window.formatMoney = formatMoney;