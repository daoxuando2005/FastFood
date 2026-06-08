
document.addEventListener("DOMContentLoaded", checkLoginStatus);

// --- 6. TÌM KIẾM ---
function handleSearch() {
    const query = document.getElementById("globalSearch").value.trim().toLowerCase();
    
    if (!query) {
        // Trả về danh sách cũ
        applyFilters();
        return;
    }
    
    let filtered = allDishes;

    if (currentCategory !== 'all') {
        filtered = filtered.filter(d => d.category === currentCategory);
    }
    if (currentRestaurant !== 'all') {
        filtered = filtered.filter(d => d.restaurantId.toString() === currentRestaurant);
    }

    filtered = filtered.filter(d => 
        (d.name && d.name.toLowerCase().includes(query)) || 
        (d.restaurantName && d.restaurantName.toLowerCase().includes(query))
    );
    
    renderMenu(filtered);
}

// --- 7. CAROUSEL BANNER ---
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

// --- 8. VÒNG QUAY NGẪU NHIÊN ---
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

    // Reset UI
    spinnerResult.style.display = 'none';
    btnCancel.style.display = 'none';
    btnAddToCart.style.display = 'none';
    btnSpin.disabled = true;
    
    wheel.classList.add("spinning");

    let ticks = 0;
    // Quay liên tục trong 1.5s
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
        cancelSpin(); // Đặt lại vòng quay
    }
}
