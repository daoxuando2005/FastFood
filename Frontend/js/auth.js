// js/auth.js

// 1. ĐĂNG NHẬP
async function login(email, password) {
    try {
        // Gọi API Gateway: POST /api/auth/login
        const data = await apiRequest(`${API.AUTH}/login`, "POST", { email, password });
        
        // Lưu thông tin vào LocalStorage
        const authData = {
            token: data.token,
            userId: data.userId,
            role: data.role,
            email: email
        };
        localStorage.setItem("foodhub_auth", JSON.stringify(authData));
        return authData;
    } catch (error) {
        console.error("Login error:", error);
        throw error; // Ném lỗi để giao diện hiển thị thông báo
    }
}

// 2. ĐĂNG KÝ (Quy trình 2 bước: Tạo TK -> Tạo Profile)
async function register(email, password, fullname, phone) {
    try {
        // Bước 1: Gọi Auth Service tạo tài khoản (Lưu email/pass)
        await apiRequest(`${API.AUTH}/register`, "POST", { 
            email, 
            password, 
            role: "CUSTOMER" 
        });

        // Bước 2: Tự động đăng nhập để lấy Token (cần token để gọi Customer Service)
        const authData = await login(email, password);

        // Bước 3: Gọi Customer Service tạo hồ sơ (Lưu tên/sđt)
        // Cần truyền Header Authorization (hàm apiRequest đã tự xử lý việc này nếu có token trong localStorage)
        await apiRequest(API.CUSTOMER, "POST", {
            userId: authData.userId,
            fullname: fullname,
            email: email,
            phoneNumber: phone
        });

        return authData;
    } catch (error) {
        console.error("Register error:", error);
        throw error;
    }
}

// 3. ĐĂNG XUẤT
function logout() {
    localStorage.removeItem("foodhub_auth");
    localStorage.removeItem("foodhub_cart"); // Xóa giỏ hàng nếu muốn bảo mật
    window.location.href = "/index.html"; // Quay về trang chủ
}

// 4. KIỂM TRA TRẠNG THÁI (Dùng cho Header trang chủ)
function checkAuth() {
    const user = JSON.parse(localStorage.getItem("foodhub_auth"));
    const authBtn = document.getElementById("authBtn");
    
    if (authBtn) {
        if (user && user.token) {
            // Nếu đã đăng nhập
            authBtn.innerHTML = `👤 ${user.email.split('@')[0]}`;
            authBtn.onclick = (e) => {
                e.preventDefault();
                if(confirm("Bạn muốn đăng xuất?")) logout();
            };
            // Hiển thị nút Đơn hàng
            const orderBtn = document.querySelector('.orders-btn');
            if(orderBtn) orderBtn.style.display = 'flex';
        } else {
            // Chưa đăng nhập
            authBtn.innerHTML = `🔐 Đăng nhập`;
            authBtn.onclick = () => window.location.href = "auth/login.html";
            
            // Ẩn nút Đơn hàng
            const orderBtn = document.querySelector('.orders-btn');
            if(orderBtn) orderBtn.style.display = 'none';
        }
    }
    return user;
}

// Export ra global
window.login = login;
window.register = register;
window.logout = logout;
window.checkAuth = checkAuth;