// order.js
const API_ORDER = API.ORDER; // http://localhost:8080/api/v1/orders
let allOrders = [];
let currentFilter = 'ALL';
let currentOrderId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});

// 1. LOAD DATA
async function loadOrders() {
    const tbody = document.getElementById('orderTableBody');
    tbody.innerHTML = `<tr><td colspan="6" class="loading-text">⏳ Đang đồng bộ dữ liệu...</td></tr>`;

    try {
        // Gọi API GET /orders
        const data = await apiRequest(API_ORDER);
        
        allOrders = Array.isArray(data) ? data : [];
        // Sort mới nhất lên đầu
        allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        updateStats();
        renderOrders();

    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Lỗi kết nối: ${error.message}</td></tr>`;
    }
}

// 2. RENDER BẢNG
function renderOrders() {
    const tbody = document.getElementById('orderTableBody');
    let displayData = allOrders;

    // Lọc theo Tab
    if (currentFilter !== 'ALL') {
        displayData = allOrders.filter(o => o.status === currentFilter);
    }

    // Lọc theo Tìm kiếm
    const keyword = document.getElementById('orderSearch').value.toLowerCase();
    if (keyword) {
        displayData = displayData.filter(o => o.id.toString().includes(keyword));
    }

    if (displayData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state" style="text-align:center; padding:30px; color:#999;">Không có dữ liệu.</td></tr>`;
        return;
    }

    tbody.innerHTML = displayData.map(o => `
        <tr>
            <td><strong>#${o.id}</strong></td>
            <td>User ${o.userId}</td>
            <td>${new Date(o.createdAt).toLocaleString('vi-VN')}</td>
            <td style="color: var(--primary); font-weight: bold;">${formatMoney(o.totalAmount)}</td>
            <td>${getBadgeHtml(o.status)}</td>
            <td>
                <button class="btn-secondary" style="padding: 5px 10px; font-size: 0.85rem;" onclick="viewDetail(${o.id})">👁️ Chi tiết</button>
            </td>
        </tr>
    `).join('');
}

// 3. MODAL DETAIL
function viewDetail(id) {
    currentOrderId = id;
    const order = allOrders.find(o => o.id === id);
    if (!order) return;

    document.getElementById('detailId').innerText = order.id;
    document.getElementById('detailUserId').innerText = order.userId;
    document.getElementById('detailDate').innerText = new Date(order.createdAt).toLocaleString('vi-VN');
    document.getElementById('detailAddress').innerHTML = `
        <span id="currentAddress">${order.deliveryAddress}</span>
        <button onclick="editAddress(${order.id})" style="margin-left:10px; font-size:0.8rem; cursor:pointer;">✏️ Sửa</button>
    `;
    document.getElementById('detailStatus').innerHTML = getBadgeHtml(order.status);
    document.getElementById('detailTotal').innerText = formatMoney(order.totalAmount);

    // Render Items
    const itemsBody = document.getElementById('detailItemsBody');
    itemsBody.innerHTML = order.items.map(item => `
        <tr>
            <td>
                <div style="font-weight:600; color:#333;">${item.dishName}</div>
                <small style="color:#999;">ID: ${item.dishId}</small>
            </td>
            <td>${formatMoney(item.unitPrice)}</td>
            <td>${item.quantity}</td>
            <td style="text-align:right;">${formatMoney(item.subTotal)}</td>
        </tr>
    `).join('');

    renderActionButtons(order.status);

    document.getElementById('orderModal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

// 4. RENDER ACTION BUTTONS (Logic mới: Phải thanh toán mới được duyệt)
function renderActionButtons(status) {
    const container = document.getElementById('modalActions');
    let html = '';

    // TRƯỜNG HỢP 1: Đơn mới tạo, CHƯA THANH TOÁN (PENDING)
    if (status === 'PENDING') {
        html = `
            <div style="display:flex; flex-direction:column; gap:10px; align-items:center;">
                <span style="color:red; font-weight:bold; font-style:italic; border: 1px solid red; padding: 5px 10px; border-radius: 5px;">
                    ⚠️ Đơn COD / Chưa thanh toán
                </span>
                <div style="display:flex; gap:10px;">
                    <button class="btn-cancel" onclick="updateStatus('CANCELLED')">Hủy đơn</button>
                    <button class="btn-approve" onclick="updateStatus('CONFIRMED')">✅ Duyệt đơn & Nấu</button>
                </div>
            </div>
        `;
    } 
    // TRƯỜNG HỢP 2: ĐÃ THANH TOÁN (PAID) -> ADMIN ĐƯỢC PHÉP DUYỆT
    else if (status === 'PAID') {
        html = `
            <div style="display:flex; flex-direction:column; gap:10px; align-items:center;">
                <span style="color:green; font-weight:bold;">
                    ✅ Đã thanh toán thành công
                </span>
                <div style="display:flex; gap:10px;">
                    <button class="btn-cancel" onclick="updateStatus('CANCELLED')">Hủy đơn</button>
                    <button class="btn-approve" onclick="updateStatus('CONFIRMED')">✅ Duyệt đơn & Nấu</button>
                </div>
            </div>
        `;
    } 
    // TRƯỜNG HỢP 3: ĐÃ DUYỆT (CONFIRMED) -> CHỜ GIAO
    else if (status === 'CONFIRMED') {
        html = `
            <button class="btn-ship" onclick="updateStatus('DELIVERING')">🚚 Giao cho Shipper</button>
        `;
    } 
    // TRƯỜNG HỢP 4: ĐANG GIAO (DELIVERING) -> CHỜ DELIVERY SERVICE
    else if (status === 'DELIVERING') {
        html = `
            <div style="display:flex; flex-direction:column; gap:10px; align-items:center;">
                <span style="color:#eab308; font-weight:bold; font-style:italic; display:flex; align-items:center; gap:5px;">
                    <i class="fa-solid fa-truck-fast"></i> Đang giao hàng... (Chờ Shipper xác nhận)
                </span>
                <button class="btn-approve" style="background:#28a745;" onclick="updateStatus('COMPLETED')">✅ Đánh dấu Đã Giao Thành Công</button>
            </div>
        `;
    } 
    // TRƯỜNG HỢP 5: HOÀN THÀNH
    else if (status === 'COMPLETED') {
        html = `<span style="color:green; font-weight:bold;">✅ Đơn hàng đã hoàn thành</span>`;
    } 
    // TRƯỜNG HỢP KHÁC
    else {
        html = `<span style="color:#999; font-style:italic;">Không có thao tác khả dụng</span>`;
    }
    
    container.innerHTML = html;
}
// 5. UPDATE STATUS
async function updateStatus(newStatus) {
    if(!confirm(`Xác nhận chuyển trạng thái sang ${newStatus}?`)) return;

    try {
        // PUT /api/v1/orders/{id}/status?status=...
        await apiRequest(`${API_ORDER}/${currentOrderId}/status?status=${newStatus}`, "PUT");
        alert("Thành công!");
        closeOrderModal();
        loadOrders(); // Reload list
    } catch (e) {
        alert("Lỗi: " + e.message);
    }
}

async function editAddress(id) {
    const newAddress = prompt("Nhập địa chỉ nhận hàng mới:");
    if (!newAddress || newAddress.trim() === "") return;

    try {
        // Đã thêm route /api/v1/orders/{id}/address bên Backend
        await apiRequest(`${API_ORDER}/${id}/address`, "PUT", newAddress.trim());
        alert("Cập nhật địa chỉ thành công!");
        loadOrders();
        // Cập nhật lại Modal Detail nếu backend không lỗi
        document.getElementById('currentAddress').innerText = newAddress;
    } catch (e) {
        alert("Lỗi cập nhật địa chỉ: " + e.message);
    }
}

// 6. FILTER & STATS
function filterOrders(status) {
    currentFilter = status;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderOrders();
}

function searchOrder() { renderOrders(); }

function updateStats() {
    const pending = allOrders.filter(o => o.status === 'PENDING').length;
    const shipping = allOrders.filter(o => o.status === 'DELIVERING').length;
    const today = new Date().toDateString();
    const revenue = allOrders
        .filter(o => (o.status === 'COMPLETED' || o.status === 'PAID') && new Date(o.createdAt).toDateString() === today)
        .reduce((sum, o) => sum + o.totalAmount, 0);

    document.getElementById('countPending').innerText = pending;
    document.getElementById('countShipping').innerText = shipping;
    document.getElementById('todayRevenue').innerText = formatMoney(revenue);
}

// Helper
function getBadgeHtml(status) {
    const map = {
        'PENDING': 'badge badge-PENDING',
        'CONFIRMED': 'badge badge-CONFIRMED',
        'DELIVERING': 'badge badge-DELIVERING',
        'COMPLETED': 'badge badge-COMPLETED',
        'PAID': 'badge badge-PAID',
        'CANCELLED': 'badge badge-CANCELLED'
    };
    return `<span class="${map[status] || 'badge'}">${status}</span>`;
}