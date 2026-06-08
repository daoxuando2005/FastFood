// js/detail.js

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const resId = urlParams.get('resId');
    const dishId = urlParams.get('dishId');

    if (!resId || !dishId) {
        document.getElementById('loading').innerHTML = "Không tìm thấy thông tin sản phẩm!";
        return;
    }

    try {
        const resList = await apiRequest(API.RESTAURANT);
        const currentRes = resList.find(r => r.id == resId);
        const restaurantName = currentRes ? currentRes.name : "Nhà hàng không xác định";

        const menu = await apiRequest(`${API.RESTAURANT}/${resId}/menu`);
        const dish = menu.find(d => d.id == dishId);

        if (!dish) {
            document.getElementById('loading').innerHTML = "Sản phẩm không tồn tại hoặc đã bị xóa!";
            return;
        }

        document.getElementById('loading').style.display = 'none';
        const content = document.getElementById('detailContent');
        content.style.display = 'block';

        const imageUrl = dish.imageUrl || 'https://via.placeholder.com/600x600?text=Food';
        const desc = dish.description && dish.description.trim() !== '' ? dish.description : 'Món ăn ngon và hấp dẫn, giao hàng tận nơi nhanh chóng!';
        
        document.title = `${dish.name} - FastFood`;

        // Render Shopee-like UI
        content.innerHTML = `
            <div class="product-page">
                <div class="product-left">
                    <div class="main-img-container">
                        <img src="${imageUrl}" alt="${dish.name}" class="main-img">
                    </div>
                    <div class="thumbnail-list">
                        <div class="thumb-item active"><img src="${imageUrl}" alt="thumb"></div>
                        <div class="thumb-item"><img src="${imageUrl}" alt="thumb"></div>
                        <div class="thumb-item"><img src="${imageUrl}" alt="thumb"></div>
                    </div>
                    <div class="social-share">
                        <span>Chia sẻ: 💙 💬 📌</span>
                        <span>|</span>
                        <span>❤️ Đã thích (239)</span>
                    </div>
                </div>
                
                <div class="product-right">
                    <h1 class="product-title">
                        <span class="badge-mall">Mall</span>${dish.name}
                    </h1>
                    
                    <div class="product-meta">
                        <span class="stars">★★★★★ 4.9</span>
                        <div class="meta-divider"></div>
                        <span>733 Đánh Giá</span>
                        <div class="meta-divider"></div>
                        <span>1.2k Đã Bán</span>
                    </div>
                    
                    <div class="product-price-box">
                        <span class="old-price">${formatMoney(dish.price * 1.2)}</span>
                        <span class="current-price">${formatMoney(dish.price)}</span>
                        <span class="discount-badge">Giảm 20%</span>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Vận Chuyển</div>
                        <div class="info-content" style="display:flex; align-items:center; gap:5px;">
                            🚚 Miễn phí vận chuyển <br>
                        </div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Cửa hàng</div>
                        <div class="info-content">
                            🏪 ${restaurantName}
                        </div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Kích Cỡ (Size)</div>
                        <div class="info-content">
                            <button class="variation-btn active" onclick="selectVariation(this)">Vừa</button>
                            <button class="variation-btn" onclick="selectVariation(this)">Lớn</button>
                            <button class="variation-btn" onclick="selectVariation(this)">Khổng Lồ</button>
                        </div>
                    </div>
                    
                    <div class="info-row" style="margin-top: 30px;">
                        <div class="info-label">Số Lượng</div>
                        <div class="info-content">
                            <div class="qty-wrapper">
                                <button class="qty-btn" onclick="updateDetailQty(-1)">-</button>
                                <input type="number" id="detailQty" class="qty-input" value="1" min="1">
                                <button class="qty-btn" onclick="updateDetailQty(1)">+</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn-add-cart" onclick='addDetailToCart(${JSON.stringify({...dish, restaurantId: resId, restaurantName: restaurantName})})'>
                            🛒 Thêm Vào Giỏ Hàng
                        </button>
                        <button class="btn-buy-now" onclick='buyNow(${JSON.stringify({...dish, restaurantId: resId, restaurantName: restaurantName})})'>
                            Mua Ngay
                        </button>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error(error);
        document.getElementById('loading').innerHTML = "Lỗi kết nối Server! Vui lòng thử lại sau.";
    }
});

// UI Functions
window.selectVariation = function(btn) {
    document.querySelectorAll('.variation-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

window.updateDetailQty = function(delta) {
    const input = document.getElementById('detailQty');
    let val = parseInt(input.value) + delta;
    if(val < 1) val = 1;
    input.value = val;
};

// Cart logic
window.addDetailToCart = function(dishData) {
    const authData = JSON.parse(localStorage.getItem("foodhub_auth"));
    if (!authData || !authData.token) {
        alert("Vui lòng đăng nhập để thêm món ăn vào giỏ hàng!");
        window.location.href = "auth/login.html";
        return;
    }

    const qtyInput = document.getElementById('detailQty');
    let qty = parseInt(qtyInput.value) || 1;

    const existing = cart.find(item => item.id === dishData.id);
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({ ...dishData, quantity: qty });
    }
    
    saveCart();
    updateCartUI();
    
    const cartSidebar = document.getElementById("cartSidebar");
    const overlay = document.getElementById("overlay");
    if (!cartSidebar.classList.contains("active")) {
        cartSidebar.classList.add("active");
        overlay.classList.add("active");
    }
};

window.buyNow = function(dishData) {
    const authData = JSON.parse(localStorage.getItem("foodhub_auth"));
    if (!authData || !authData.token) {
        alert("Vui lòng đăng nhập để mua hàng!");
        window.location.href = "auth/login.html";
        return;
    }

    const qtyInput = document.getElementById('detailQty');
    let qty = parseInt(qtyInput.value) || 1;

    const existing = cart.find(item => item.id === dishData.id);
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({ ...dishData, quantity: qty });
    }
    saveCart();
    
    checkout();
};
