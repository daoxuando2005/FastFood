// customer/profile.js

let authUser = null;

document.addEventListener("DOMContentLoaded", async () => {
    authUser = JSON.parse(localStorage.getItem("foodhub_auth"));
    if (!authUser || !authUser.token) {
        alert("Vui lòng đăng nhập!");
        window.location.href = "../auth/login.html";
        return;
    }

    document.getElementById("email").value = authUser.email;
    await loadProfile();
});

function switchTab(tabId) {
    // Ẩn tất cả tab
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.profile-menu li').forEach(el => el.classList.remove('active'));
    
    // Hiện tab được chọn
    document.getElementById('tab-' + tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

async function loadProfile() {
    try {
        const profile = await apiRequest(`${API.CUSTOMER}/${authUser.userId}`, "GET");
        document.getElementById("fullname").value = profile.fullname || "";
        document.getElementById("phone").value = profile.phoneNumber || "";
    } catch (err) {
        console.warn("Chưa có profile, sẽ tạo mới khi lưu.");
    }
}

async function saveProfile() {
    const fullname = document.getElementById("fullname").value.trim();
    const phone = document.getElementById("phone").value.trim();
    
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
        showMessage("profileMessage", "Số điện thoại không hợp lệ! Phải bắt đầu bằng số 0 và có đúng 10 chữ số.", "error");
        return;
    }
    
    if (!fullname) {
        showMessage("profileMessage", "Vui lòng nhập đầy đủ họ tên.", "error");
        return;
    }

    const btn = document.getElementById("btnSaveProfile");
    btn.disabled = true;
    btn.innerText = "Đang lưu...";

    const payload = {
        userId: authUser.userId,
        email: authUser.email,
        fullname: fullname,
        phoneNumber: phone
    };

    try {
        await apiRequest(`${API.CUSTOMER}/${authUser.userId}`, "PUT", payload);
        showMessage("profileMessage", "Cập nhật thông tin thành công!", "success");
    } catch (err) {
        try {
            await apiRequest(API.CUSTOMER, "POST", payload);
            showMessage("profileMessage", "Tạo mới hồ sơ thành công!", "success");
        } catch (createErr) {
            console.error(createErr);
            showMessage("profileMessage", "Lỗi lưu hồ sơ: " + createErr.message, "error");
        }
    }

    btn.disabled = false;
    btn.innerText = "Lưu Thay Đổi";
}

async function changePassword() {
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    
    if (!oldPassword || !newPassword || !confirmPassword) {
        showMessage("passwordMessage", "Vui lòng điền đầy đủ các trường mật khẩu.", "error");
        return;
    }
    if (newPassword !== confirmPassword) {
        showMessage("passwordMessage", "Mật khẩu xác nhận không khớp với mật khẩu mới.", "error");
        return;
    }
    if (newPassword.length < 6) {
        showMessage("passwordMessage", "Mật khẩu mới phải có ít nhất 6 ký tự.", "error");
        return;
    }

    const btn = document.getElementById("btnSavePassword");
    btn.disabled = true;
    btn.innerText = "Đang xử lý...";

    try {
        const payload = {
            email: authUser.email,
            oldPassword: oldPassword,
            newPassword: newPassword
        };
        const res = await apiRequest(`${API.AUTH}/change-password`, "POST", payload);
        showMessage("passwordMessage", res.message || "Đổi mật khẩu thành công!", "success");
        document.getElementById("passwordForm").reset();
    } catch (err) {
        showMessage("passwordMessage", err.message || "Lỗi khi đổi mật khẩu.", "error");
    }

    btn.disabled = false;
    btn.innerText = "Xác Nhận";
}

function showMessage(elementId, msg, type) {
    const msgEl = document.getElementById(elementId);
    msgEl.innerText = msg;
    msgEl.className = "message-box " + (type === "error" ? "message-error" : "message-success");
    msgEl.style.display = "block";
    setTimeout(() => { msgEl.style.display = "none"; }, 4000);
}
