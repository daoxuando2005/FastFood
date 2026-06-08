// js/checkout.js

let cart = JSON.parse(localStorage.getItem("foodhub_cart")) || [];
let authUser = JSON.parse(localStorage.getItem("foodhub_auth"));
const SHIPPING_FEE = 15000;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Kiểm tra đăng nhập
    if (!authUser || !authUser.token) {
        alert("Vui lòng đăng nhập để tiến hành thanh toán!");
        window.location.href = "../auth/login.html";
        return;
    }
    
    // 2. Kiểm tra giỏ hàng
    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        window.location.href = "../index.html";
        return;
    }

    renderCartSummary();
});

function selectPayment(radioInput) {
    // Highlight UI
    document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('active'));
    radioInput.closest('.payment-method').classList.add('active');
}

function renderCartSummary() {
    const listEl = document.getElementById("cartItemsList");
    let subTotal = 0;
    
    listEl.innerHTML = cart.map(item => {
        subTotal += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.imageUrl || 'https://via.placeholder.com/50'}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <span style="font-size:0.85rem; color:#777;">SL: ${item.quantity}</span>
                </div>
                <div class="cart-item-price">${formatMoney(item.price * item.quantity)}</div>
            </div>
        `;
    }).join("");

    const finalTotal = subTotal + SHIPPING_FEE;
    
    document.getElementById("subTotal").innerText = formatMoney(subTotal);
    document.getElementById("finalTotal").innerText = formatMoney(finalTotal);
}

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

async function placeOrder() {
    // Validate form
    const form = document.getElementById("checkoutForm");
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Lấy thông tin
    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
        alert("Số điện thoại giao hàng không hợp lệ! Phải bắt đầu bằng số 0 và có đúng 10 chữ số.");
        return;
    }

    const province = document.getElementById("province").value;
    const district = document.getElementById("district").value.trim();
    const ward = document.getElementById("ward").value.trim();
    const addressDetail = document.getElementById("addressDetail").value.trim();
    const note = document.getElementById("note").value.trim();
    
    const paymentType = document.querySelector('input[name="paymentType"]:checked').value;

    const fullAddress = `${fullName} - ${phone} | ${addressDetail}, ${ward}, ${district}, ${province} ${note ? `(Ghi chú: ${note})` : ''}`;

    const orderReq = {
        userId: authUser.userId,
        restaurantId: cart[0].restaurantId,
        deliveryAddress: fullAddress,
        items: cart.map(i => ({ dishId: i.id, quantity: i.quantity }))
    };

    const btn = document.getElementById("btnPlaceOrder");
    btn.disabled = true;
    btn.innerText = "Đang xử lý...";

    try {
        // B0: Đảm bảo hồ sơ khách hàng tồn tại trong Customer Service
        try {
            await apiRequest(`${API.CUSTOMER}/${authUser.userId}`, "GET");
        } catch (err) {
            // Nếu lỗi (thường là 404 Not Found do mới đăng ký ở Auth mà chưa có hồ sơ), tiến hành tạo
            await apiRequest(API.CUSTOMER, "POST", {
                userId: authUser.userId,
                email: authUser.email || "unknown@email.com",
                fullname: fullName,
                phoneNumber: phone
            });
        }

        // B1: Tạo Order
        const order = await apiRequest(API.ORDER, "POST", orderReq);
        
        // B2: Xóa giỏ hàng
        localStorage.removeItem("foodhub_cart");

        // B3: Xử lý theo phương thức thanh toán
        if (paymentType === 'VNPAY') {
            btn.innerText = "Đang kết nối cổng thanh toán...";
            const paymentRes = await apiRequest(`${API.PAYMENT}/create?orderId=${order.id}&amount=${order.totalAmount}`, "POST");
            
            // Xử lý link VNPAY
            const linkThanhToan = paymentRes.url || paymentRes.paymentUrl || paymentRes.vnpUrl || paymentRes.data;
            if (linkThanhToan) {
                window.location.href = linkThanhToan;
            } else {
                alert("Lỗi không lấy được link VNPAY. Backend trả về: " + JSON.stringify(paymentRes));
                window.location.href = `invoice.html?orderId=${order.id}`;
            }
        } else {
            // Thanh toán COD -> Chuyển đến thẳng trang hóa đơn
            window.location.href = `invoice.html?orderId=${order.id}&cod=true`;
        }

    } catch (err) {
        console.error(err);
        alert("Lỗi đặt hàng: " + err.message);
        btn.disabled = false;
        btn.innerText = "ĐẶT HÀNG";
    }
}
