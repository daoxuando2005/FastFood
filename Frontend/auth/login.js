// auth/login.js

// Chuyển đổi giữa Form Đăng nhập và Đăng ký
function switchMode(mode) {
    const loginForm = document.getElementById('loginForm');
    const regForm = document.getElementById('registerForm');
    
    if (mode === 'register') {
        loginForm.style.display = 'none';
        regForm.style.display = 'block';
        // Animation nhẹ
        regForm.style.animation = 'fadeIn 0.3s';
    } else {
        loginForm.style.display = 'block';
        regForm.style.display = 'none';
        loginForm.style.animation = 'fadeIn 0.3s';
    }
}

// Xử lý ĐĂNG NHẬP
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    const originalText = btn.innerText;
    btn.innerText = "Đang xử lý...";
    btn.disabled = true;

    const email = document.getElementById("loginEmail").value;
    const pass = document.getElementById("loginPassword").value;

    try {
        const user = await login(email, pass); // Gọi hàm từ ../js/auth.js
        
        alert("Đăng nhập thành công!");
        
        // Điều hướng dựa trên quyền
        if (user.role === 'ADMIN') {
            window.location.href = "../admin/admin.html";
        } else {
            window.location.href = "../index.html";
        }

    } catch (err) {
        alert("Đăng nhập thất bại: " + err.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

// Xử lý ĐĂNG KÝ
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    const originalText = btn.innerText;
    btn.innerText = "Đang tạo tài khoản...";
    btn.disabled = true;

    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const phone = document.getElementById("regPhone").value;
    const pass = document.getElementById("regPassword").value;

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
        alert("Số điện thoại không hợp lệ! Phải bắt đầu bằng số 0 và có đúng 10 chữ số.");
        btn.innerText = originalText;
        btn.disabled = false;
        return;
    }

    try {
        await register(email, pass, name, phone); // Gọi hàm từ ../js/auth.js
        
        alert("Đăng ký thành công! Đang chuyển về trang chủ...");
        window.location.href = "../index.html";

    } catch (err) {
        alert("Lỗi đăng ký: " + err.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

// CSS Animation
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);