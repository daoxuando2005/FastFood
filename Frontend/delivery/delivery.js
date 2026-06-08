// delivery.js

// API_DELIVERY lấy từ ../js/api.js (http://localhost:8080/api/v1/deliveries)
const API_DELIVERY = API.DELIVERY || "http://localhost:8080/api/v1/deliveries"; // Fallback nếu API chưa load
let allDeliveries = [];
let currentFilter = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
    loadDeliveries();
});

// 1. TẢI DỮ LIỆU
async function loadDeliveries() {
    const tbody = document.getElementById('deliveryTableBody');
    if(tbody) tbody.innerHTML = `<tr><td colspan="6" class="loading-text">⏳ Đang tải dữ liệu...</td></tr>`;

    try {
        // Gọi API Gateway
        const data = await apiRequest(API_DELIVERY);
        allDeliveries = Array.isArray(data) ? data : [];
        
        // Sắp xếp mới nhất (Dựa vào id hoặc createdAt)
        allDeliveries.sort((a, b) => (b.id || 0) - (a.id || 0));
        
        renderDeliveries();
    } catch (error) {
        console.error(error);
        if(tbody) tbody.innerHTML = `<tr><td colspan="6" class="empty-state" style="color:red">Lỗi kết nối: ${error.message}</td></tr>`;
    }
}

// 2. RENDER BẢNG
function renderDeliveries() {
    const tbody = document.getElementById('deliveryTableBody');
    if(!tbody) return;

    let displayData = allDeliveries;

    // Lọc theo Tab
    if (currentFilter !== 'ALL') {
        displayData = allDeliveries.filter(d => d.status === currentFilter);
    }

    // Lọc theo Tìm kiếm
    const searchInput = document.getElementById('deliverySearch');
    if (searchInput) {
        const keyword = searchInput.value.toLowerCase();
        if (keyword) {
            displayData = displayData.filter(d => 
                (d.orderId && d.orderId.toLowerCase().includes(keyword)) || 
                (d.driverName && d.driverName.toLowerCase().includes(keyword))
            );
        }
    }

    if (displayData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Không tìm thấy vận đơn nào.</td></tr>`;
        return;
    }

    tbody.innerHTML = displayData.map(d => `
        <tr>
            <td>#${d.id}</td>
            <td><strong>${d.orderId}</strong></td>
            <td>
                <div class="recipient-info">
                    <div class="recipient-name">${d.recipientName || 'Khách lẻ'} <small>(${d.recipientPhone || '---'})</small></div>
                    <div class="recipient-addr">${d.deliveryAddress || '---'}</div>
                </div>
            </td>
            <td>
                ${d.driverName ? `
                    <div class="driver-info">
                        <span class="driver-name">🛵 ${d.driverName}</span>
                        <span class="driver-plate">${d.vehicleNumber || ''}</span>
                    </div>
                ` : '<span style="color:#999; font-style:italic;">Chưa gán</span>'}
            </td>
            <td>${getBadgeHtml(d.status)}</td>
            <td>
                <div class="action-buttons">
                    ${getActionButtons(d)}
                </div>
            </td>
        </tr>
    `).join('');
}

// 3. LỌC TRẠNG THÁI
function filterDelivery(status) {
    currentFilter = status;
    // Active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    // Tìm button được click (cách an toàn hơn event.target)
    const btn = Array.from(document.querySelectorAll('.filter-btn')).find(b => b.textContent.includes(status === 'ALL' ? 'Tất cả' : status));
    if(btn) btn.classList.add('active');
    
    renderDeliveries();
}

function searchDelivery() {
    renderDeliveries();
}

// 5. CẬP NHẬT TRẠNG THÁI (Flow Giao hàng)
async function updateStatus(id, status) {
    let msg = "";
    if(status === 'DELIVERING') msg = "Xác nhận bắt đầu đi giao hàng?";
    if(status === 'COMPLETED') msg = "Xác nhận đã giao thành công?";

    if(!confirm(msg)) return;

    try {
        // --- SỬA LỖI TẠI ĐÂY ---
        // Sai: await apiRequest(..., "PUT", { status: status }); -> Gửi Body
        // Đúng: Gửi Query Param ?status=...
        
        await apiRequest(`${API_DELIVERY}/${id}/status?status=${status}`, "PUT");
        
        alert("Cập nhật thành công!");
        loadDeliveries(); // Tải lại bảng
    } catch (err) {
        console.error(err);
        alert("Lỗi cập nhật: " + err.message);
    }
}

// Helpers
function getBadgeHtml(status) {
    // Mapping trạng thái
    const map = {
        'PENDING': 'badge-PENDING',
        'CONFIRMED': 'badge-CONFIRMED',
        'DELIVERING': 'badge-IN_TRANSIT', // Backend là DELIVERING
        'COMPLETED': 'badge-DELIVERED',   // Backend là COMPLETED
        'FAILED': 'badge-FAILED'
    };

    let label = status;
    if(status === 'PENDING') label = '⏳ Chờ tài xế';
    if(status === 'CONFIRMED') label = '🛵 Đã có tài xế';
    if(status === 'DELIVERING') label = '🚚 Đang giao';
    if(status === 'COMPLETED') label = '✅ Thành công';
    if(status === 'FAILED') label = '❌ Thất bại';
    
    return `<span class="${map[status] || ''}">${label}</span>`;
}

function getActionButtons(delivery) {
    // SỬA: Đổi IN_TRANSIT thành DELIVERING để khớp với Java Enum
    // SỬA: Đổi DELIVERED thành COMPLETED để khớp với Java Enum

    if (delivery.status === 'CONFIRMED') {
        // Nút bấm chuyển sang DELIVERING
        return `<button class="btn btn-sm btn-secondary" style="color:#b45309; border-color:#b45309;" onclick="updateStatus(${delivery.id}, 'DELIVERING')">🚀 Đi giao</button>`;
    
    } else if (delivery.status === 'DELIVERING') {
        // Nút bấm chuyển sang COMPLETED
        return `<button class="btn btn-sm btn-primary" style="background:#10b981;" onclick="updateStatus(${delivery.id}, 'COMPLETED')">🏁 Hoàn thành</button>`;
    }
    
    return `<span style="color:#ccc;">--</span>`;
}