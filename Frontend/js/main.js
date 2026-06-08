// js/main.js

let cart = JSON.parse(localStorage.getItem("foodhub_cart")) || [];
let allDishes = [];

document.addEventListener("DOMContentLoaded", async () => {
    if (window.checkAuth) {
        window.checkAuth();
    }
    updateCartUI();
    await loadMenu();
});

async function loadMenu() {
    const grid = document.getElementById("menuGrid");
    try {
        const restaurants = await apiRequest(API.RESTAURANT);
        allDishes = [];
        
        await Promise.all(restaurants.map(async (res) => {
            try {
                const menu = await apiRequest(`${API.RESTAURANT}/${res.id}/menu`);
                if (menu) {
                    const dishesWithInfo = menu.map(d => ({
                        ...d,
                        restaurantId: res.id,
                        restaurantName: res.name
                    }));
                    allDishes = allDishes.concat(dishesWithInfo);
                }
            } catch (err) {
                console.warn(`Lỗi tải menu nhà hàng ${res.id}`);
            }
        }));

        renderCategoryBar(allDishes);
        renderMenu(allDishes);

    } catch (error) {
        console.error(error);
        if(grid) {
            grid.innerHTML = `<div style="text-align:center; grid-column:1/-1; color:red;">
                <h3>⚠️ Lỗi kết nối</h3>
                <p>Không thể tải dữ liệu từ Gateway (8080).<br>${error.message}</p>
            </div>`;
        }
    }
}

function renderMenu(dishes) {
    const grid = document.getElementById("menuGrid");
    if (!grid) return;

    if (dishes.length === 0) {
        grid.innerHTML = `<p style="text-align:center; grid-column:1/-1;">Chưa có món ăn nào.</p>`;
        return;
    }

    grid.innerHTML = dishes.map(item => `
        <div class="menu-card">
            <a href="detail.html?resId=${item.restaurantId}&dishId=${item.id}" style="text-decoration: none; color: inherit;">
                <img src="${item.imageUrl || 'https://via.placeholder.com/300x200?text=Food'}" alt="${item.name}">
            </a>
            <div class="menu-card-content">
                <div class="menu-card-header">
                    <a href="detail.html?resId=${item.restaurantId}&dishId=${item.id}" style="text-decoration: none; color: inherit;">
                        <h3 class="menu-card-title hover-underline">${item.name}</h3>
                    </a>
                    <span class="menu-card-price">${formatMoney(item.price)}</span>
                </div>
                <div class="menu-card-restaurant">🏪 ${item.restaurantName}</div>
                <p class="menu-card-desc">${item.description || 'Món ngon hấp dẫn'}</p>
                <button class="add-to-cart" onclick='addToCart(${JSON.stringify(item)})'>
                    + Thêm vào giỏ
                </button>
            </div>
        </div>
    `).join("");
}

let currentCategory = 'all';
let currentRestaurant = 'all';

function renderCategoryBar(dishes) {
    const categorySidebar = document.getElementById("categorySidebar");
    const restaurantSidebar = document.getElementById("restaurantSidebar");
    if (!categorySidebar || !restaurantSidebar) return;

    const categories = new Set();
    const restaurants = new Map();

    dishes.forEach(d => {
        if (d.category && d.category.trim() !== '') {
            categories.add(d.category.trim());
        }
        if (d.restaurantId && d.restaurantName) {
            restaurants.set(d.restaurantId, d.restaurantName);
        }
    });

    let catHtml = `<button class="category-btn active" onclick="filterByCategory('all')" style="text-align: left; padding: 8px 12px; border-radius: 5px; border: 1px solid #10b981; background: #fff; cursor: pointer; color: #10b981; font-weight: bold;">Tất cả</button>`;
    categories.forEach(cat => {
        const safeCat = cat.replace(/'/g, "\\'");
        catHtml += `<button class="category-btn" onclick="filterByCategory('${safeCat}')" style="text-align: left; padding: 8px 12px; border-radius: 5px; border: 1px solid #ddd; background: #fff; cursor: pointer; color: #333;">${cat}</button>`;
    });
    categorySidebar.innerHTML = catHtml;

    let resHtml = `<button class="restaurant-btn active" onclick="filterByRestaurant('all')" style="text-align: left; padding: 8px 12px; border-radius: 5px; border: 1px solid #10b981; background: #fff; cursor: pointer; color: #10b981; font-weight: bold;">Tất cả</button>`;
    restaurants.forEach((name, id) => {
        const safeName = name.replace(/'/g, "\\'");
        resHtml += `<button class="restaurant-btn" onclick="filterByRestaurant('${id}')" style="text-align: left; padding: 8px 12px; border-radius: 5px; border: 1px solid #ddd; background: #fff; cursor: pointer; color: #333;">${safeName}</button>`;
    });
    restaurantSidebar.innerHTML = resHtml;
}

function filterByCategory(category) {
    currentCategory = category;
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.borderColor = '#ddd';
        btn.style.color = '#333';
        btn.style.fontWeight = 'normal';
        if ((category === 'all' && btn.innerText === 'Tất cả') || btn.innerText === category) {
            btn.classList.add('active');
            btn.style.borderColor = '#10b981';
            btn.style.color = '#10b981';
            btn.style.fontWeight = 'bold';
        }
    });
    applyFilters();
}

function filterByRestaurant(restaurantId) {
    currentRestaurant = restaurantId.toString();
    const buttons = document.querySelectorAll('.restaurant-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.borderColor = '#ddd';
        btn.style.color = '#333';
        btn.style.fontWeight = 'normal';
        if ((restaurantId === 'all' && btn.innerText === 'Tất cả') || btn.getAttribute('onclick').includes(restaurantId)) {
            btn.classList.add('active');
            btn.style.borderColor = '#10b981';
            btn.style.color = '#10b981';
            btn.style.fontWeight = 'bold';
        }
    });
    applyFilters();
}

function applyFilters() {
    let filtered = allDishes;
    if (currentCategory !== 'all') {
        filtered = filtered.filter(d => d.category === currentCategory);
    }
    if (currentRestaurant !== 'all') {
        filtered = filtered.filter(d => d.restaurantId.toString() === currentRestaurant);
    }
    const query = document.getElementById("globalSearch") ? document.getElementById("globalSearch").value.trim().toLowerCase() : "";
    if (query) {
        filtered = filtered.filter(d => 
            (d.name && d.name.toLowerCase().includes(query)) || 
            (d.restaurantName && d.restaurantName.toLowerCase().includes(query))
        );
    }
    renderMenu(filtered);
}

function handleSearch() {
    applyFilters();
}

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function toggleCart() {
    const sidebar = document.getElementById("cartSidebar");
    const overlay = document.getElementById("overlay");
    if (sidebar) {
        sidebar.classList.toggle("active");
    }
    if (overlay) {
        overlay.classList.toggle("active");
    }
}

function closePanels() {
    document.getElementById("cartSidebar")?.classList.remove("active");
    document.getElementById("overlay")?.classList.remove("active");
}

function addToCart(dish) {
    const authData = JSON.parse(localStorage.getItem("foodhub_auth"));
    if (!authData || !authData.token) {
        alert("Vui lòng đăng nhập để thêm món ăn vào giỏ hàng!");
        window.location.href = "auth/login.html";
        return;
    }

    const existing = cart.find(item => item.id === dish.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...dish, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    
    // Animation
    const cartIcon = document.querySelector('.cart-btn');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
    }
}

function saveCart() {
    localStorage.setItem("foodhub_cart", JSON.stringify(cart));
}

function updateCartUI() {
    const cartCount = document.getElementById("cartCount");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.innerText = totalItems;
    }

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p style='text-align:center; padding: 20px 0;'>Giỏ hàng trống</p>";
        if(cartTotal) cartTotal.innerText = "0 đ";
        return;
    }

    let total = 0;
    cartItems.innerHTML = cart.map((item, index) => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.imageUrl || 'https://via.placeholder.com/70'}" alt="${item.name}">
                <div class="cart-info">
                    <h4>${item.name}</h4>
                    <p>${formatMoney(item.price)}</p>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="changeQuantity(${index}, -1)">-</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeItem(${index})">Xóa</button>
            </div>
        `;
    }).join("");

    if(cartTotal) cartTotal.innerText = formatMoney(total);
}

function changeQuantity(index, delta) {
    if (cart[index]) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        updateCartUI();
    }
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function checkout() {
    if (cart.length === 0) {
        alert("Giỏ hàng đang trống!");
        return;
    }
    
    const authData = JSON.parse(localStorage.getItem("foodhub_auth"));
    if (!authData || !authData.token) {
        alert("Vui lòng đăng nhập để tiếp tục thanh toán!");
        window.location.href = "auth/login.html";
        return;
    }
    
    window.location.href = "order/checkout.html";
}

function checkLoginStatus() {
    const authBtn = document.getElementById("authBtn");
    if (!authBtn) return;

    const authData = JSON.parse(localStorage.getItem("foodhub_auth"));

    if (authData && authData.email) {
        authBtn.innerHTML = `
            <div class="user-dropdown" id="userDropdownContainer">
                <span onclick="toggleDropdown(event)" style="cursor: pointer; font-weight: bold;">
                    👤 ${authData.email} ▾
                </span>
                <div id="myDropdown" class="dropdown-content">
                    <a href="customer/profile.html">📝 Thông tin khách hàng</a>
                    <a href="#" onclick="handleLogout(event)">🚪 Đăng xuất</a>
                </div>
            </div>
        `;
        authBtn.classList.remove("login-btn");
        authBtn.removeAttribute("onclick"); 
    } else {
        authBtn.innerHTML = "🔑 Đăng nhập";
        authBtn.classList.add("login-btn");
        authBtn.setAttribute("onclick", "handleAuthClick()");
    }
}

function handleAuthClick() {
    window.location.href = "auth/login.html";
}

function toggleDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById("myDropdown");
    if(dropdown) dropdown.classList.toggle("show-dropdown");
}

function handleLogout(event) {
    event.preventDefault();
    localStorage.removeItem("foodhub_auth");
    alert("Đăng xuất thành công!");
    window.location.href = "index.html"; 
}

window.onclick = function(event) {
    if (!event.target.matches('.user-dropdown span')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show-dropdown')) {
                openDropdown.classList.remove('show-dropdown');
            }
        }
    }
}

function checkLoginAndRedirect() {
    const authData = JSON.parse(localStorage.getItem("foodhub_auth"));
    if (authData && authData.token) {
        if (authData.role === "ADMIN") {
            window.location.href = "order/admin-order.html";
        } else {
            window.location.href = "order/customer-order.html";
        }
    } else {
        alert("Vui lòng đăng nhập để xem đơn hàng của bạn!");
        window.location.href = "auth/login.html";
    }
}

window.checkLoginAndRedirect = checkLoginAndRedirect;
document.addEventListener("DOMContentLoaded", checkLoginStatus);

// --- CAROUSEL BANNER ---
let slideIndex = 0;
let carouselTimer;

function showSlides(n) {
    let slides = document.getElementsByClassName("carousel-slide");
    if (slides.length === 0) return;

    if (n >= slides.length) {slideIndex = 0}
    if (n < 0) {slideIndex = slides.length - 1}
    
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove("active");
    }
    slides[slideIndex].classList.add("active");
}

function startCarousel() {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => {
        slideIndex++;
        showSlides(slideIndex);
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    showSlides(0);
    startCarousel();
});

// --- VÒNG QUAY NGẪU NHIÊN ---
let spinnerInterval;
let randomDish = null;

function spinRandomFood() {
    if (allDishes.length === 0) {
        alert("Chưa có dữ liệu món ăn để quay!");
        return;
    }

    const wheel = document.getElementById("spinnerWheel");
    const spinnerImage = document.getElementById("spinnerImage");
    const spinnerResult = document.getElementById("spinnerResult");
    const btnSpin = document.getElementById("btnSpin");
    const btnCancel = document.getElementById("btnCancelSpin");
    const btnAddToCart = document.getElementById("btnAddSpinToCart");

    spinnerResult.style.display = 'none';
    btnCancel.style.display = 'none';
    btnAddToCart.style.display = 'none';
    btnSpin.disabled = true;
    
    wheel.classList.add("spinning");

    let ticks = 0;
    spinnerInterval = setInterval(() => {
        let rand = Math.floor(Math.random() * allDishes.length);
        let tempDish = allDishes[rand];
        spinnerImage.src = tempDish.imageUrl || 'https://via.placeholder.com/150';
        ticks++;
        if (ticks > 15) {
            clearInterval(spinnerInterval);
            finishSpin();
        }
    }, 100);
}

function finishSpin() {
    const wheel = document.getElementById("spinnerWheel");
    wheel.classList.remove("spinning");
    
    let rand = Math.floor(Math.random() * allDishes.length);
    randomDish = allDishes[rand];
    
    document.getElementById("spinnerImage").src = randomDish.imageUrl || 'https://via.placeholder.com/150';
    document.getElementById("spinnerFoodName").innerText = randomDish.name;
    document.getElementById("spinnerFoodPrice").innerText = formatMoney(randomDish.price);
    
    document.getElementById("spinnerResult").style.display = 'block';
    document.getElementById("btnSpin").style.display = 'none';
    document.getElementById("btnCancelSpin").style.display = 'block';
    document.getElementById("btnAddSpinToCart").style.display = 'block';
    document.getElementById("btnSpin").disabled = false;
}

function cancelSpin() {
    document.getElementById("spinnerResult").style.display = 'none';
    document.getElementById("btnSpin").style.display = 'block';
    document.getElementById("btnCancelSpin").style.display = 'none';
    document.getElementById("btnAddSpinToCart").style.display = 'none';
    
    document.getElementById("spinnerImage").src = 'images/products/snacks.jpg';
    randomDish = null;
}

function addSpinnerToCart() {
    if (randomDish) {
        addToCart(randomDish);
        cancelSpin();
    }
}
