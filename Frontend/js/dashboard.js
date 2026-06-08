// js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
});

async function loadDashboardStats() {
    try {
        // Sử dụng Promise.allSettled để gọi song song các API
        // Điều này giúp Dashboard vẫn hiện các phần khác nếu 1 service bị lỗi
        const [ordersRes, customersRes, restaurantsRes] = await Promise.allSettled([
            apiRequest(API.ORDER),      // GET /api/v1/orders
            apiRequest(API.CUSTOMER),   // GET /api/v1/customers
            apiRequest(API.RESTAURANT)  // GET /api/v1/restaurants
        ]);

        // --- 1. XỬ LÝ SỐ LIỆU ĐƠN HÀNG & DOANH THU ---
        let revenue = 0;
        let totalOrders = 0;
        let recentOrders = [];

        if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
            const orders = ordersRes.value;
            totalOrders = orders.length;
            
            // Tính tổng doanh thu (Chỉ tính đơn Đã thanh toán hoặc Hoàn thành)
            revenue = orders
                .filter(o => o.status === 'COMPLETED' || o.status === 'PAID')
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

            // Sắp xếp đơn mới nhất lên đầu
            recentOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        } else {
            console.warn("Không tải được Orders:", ordersRes.reason);
        }

        // --- 2. XỬ LÝ SỐ LIỆU KHÁCH HÀNG ---
        let countCustomers = 0;
        if (customersRes.status === 'fulfilled' && Array.isArray(customersRes.value)) {
            countCustomers = customersRes.value.length;
        }

        // --- 3. XỬ LÝ SỐ LIỆU NHÀ HÀNG ---
        let countRestaurants = 0;
        if (restaurantsRes.status === 'fulfilled' && Array.isArray(restaurantsRes.value)) {
            countRestaurants = restaurantsRes.value.length;
        }

        // --- 4. CẬP NHẬT GIAO DIỆN ---
        animateValue("totalRevenue", revenue, true);
        animateValue("totalOrders", totalOrders);
        animateValue("totalCustomers", countCustomers);
        animateValue("totalRestaurants", countRestaurants);

        renderRecentOrders(recentOrders);

    } catch (error) {
        console.error("Lỗi tổng hợp Dashboard:", error);
    }
}

// Render bảng đơn hàng gần đây
function renderRecentOrders(orders) {
    const tbody = document.getElementById('recentOrdersBody');
    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999; padding:20px;">Chưa có dữ liệu đơn hàng.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td><strong>#${o.id}</strong></td>
            <td>${new Date(o.createdAt).toLocaleDateString('vi-VN')} <small style="color:#888">${new Date(o.createdAt).toLocaleTimeString('vi-VN')}</small></td>
            <td>User ${o.userId}</td>
            <td style="font-weight:bold;">${formatMoney(o.totalAmount)}</td>
            <td>${getBadgeHtml(o.status)}</td>
        </tr>
    `).join('');
}

// Hiệu ứng chạy số (Animation)
function animateValue(id, endValue, isMoney = false) {
    const obj = document.getElementById(id);
    if(isMoney) {
        obj.innerText = formatMoney(endValue);
        return;
    }
    
    let startTimestamp = null;
    const duration = 1000; // 1 giây

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * endValue);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = endValue;
        }
    };
    window.requestAnimationFrame(step);
}

// Helper Badge HTML
function getBadgeHtml(status) {
    const map = {
        'PENDING': 'badge-PENDING',
        'CONFIRMED': 'badge-CONFIRMED',
        'DELIVERING': 'badge-DELIVERING',
        'COMPLETED': 'badge-COMPLETED',
        'PAID': 'badge-PAID',
        'CANCELLED': 'badge-CANCELLED'
    };
    
    let label = status;
    if(status === 'PENDING') label = '⏳ Chờ xử lý';
    if(status === 'CONFIRMED') label = '✅ Đã duyệt';
    if(status === 'DELIVERING') label = '🚚 Đang giao';
    if(status === 'COMPLETED') label = '🎉 Hoàn thành';
    if(status === 'PAID') label = '💰 Đã thanh toán';
    if(status === 'CANCELLED') label = '❌ Đã hủy';

    return `<span class="${map[status] || ''}">${label}</span>`;
}