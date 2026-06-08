// customer.js (phiên bản: hiển thị ALL + tìm kiếm theo ID/Tên, giữ nguyên cấu trúc)

const API_CUSTOMER = `${GATEWAY_URL}/api/v1/customers`;
let currentCustomerId = null;

// Cache để giữ danh sách khi backend trả về GET all
let cacheCustomers = null;
// Cờ backend không hỗ trợ GET all
let backendNoGetAll = false;

// 1. KHỞI TẠO
document.addEventListener("DOMContentLoaded", () => {
    // Bắt phím Enter cho ô search (nếu bạn chưa gán ở HTML)
    const searchInput = document.getElementById('customerSearch');
    if (searchInput) searchInput.addEventListener('keypress', handleSearchKey);

    // Cố gắng tải tất cả khách hàng khi trang load (nếu backend hỗ trợ)
    loadAllCustomers();
});

// ----------------------
// LOAD ALL CUSTOMERS
// ----------------------
async function loadAllCustomers() {
    const tbody = document.getElementById('customerTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" class="loading-text">⏳ Đang tải danh sách khách hàng...</td></tr>`;

    try {
        // Gọi API GET /api/v1/customers  (nếu backend có)
        const res = await apiRequest(API_CUSTOMER, "GET");

        // Chuẩn hoá kết quả về mảng customers
        let customers = [];
        if (Array.isArray(res)) {
            customers = res;
        } else if (res && Array.isArray(res.data)) {
            customers = res.data;
        } else if (res && res.id) {
            customers = [res];
        } else {
            customers = [];
        }

        cacheCustomers = customers; // lưu cache
        backendNoGetAll = false;

        if (!customers || customers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Chưa có khách hàng nào.</td></tr>`;
            return;
        }

        renderTable(customers);
    } catch (error) {
        console.warn("Không thể tải danh sách khách hàng (có thể backend không hỗ trợ GET all):", error);
        backendNoGetAll = true;
        cacheCustomers = null;
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    👋 Backend chưa hỗ trợ hiển thị toàn bộ khách hàng. Vui lòng tìm theo ID (ví dụ: nhập ID rồi bấm Tìm kiếm).
                </td>
            </tr>`;
    }
}

// 2. TÌM KIẾM KHÁCH HÀNG (ID hoặc Tên)
async function searchCustomer() {
    const keyword = document.getElementById('customerSearch').value.trim();
    const tbody = document.getElementById('customerTableBody');

    // Nếu ô tìm kiếm trống => hiển thị toàn bộ (nếu có)
    if (!keyword) {
        if (!backendNoGetAll) {
            // nếu chưa load cache thì loadAllCustomers sẽ tải
            if (cacheCustomers) {
                renderTable(cacheCustomers);
            } else {
                await loadAllCustomers();
            }
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="empty-state">👋 Không có dữ liệu toàn bộ. Vui lòng nhập ID để tìm.</td></tr>`;
        }
        return;
    }

    tbody.innerHTML = `<tr><td colspan="6" class="loading-text">⏳ Đang tìm kiếm...</td></tr>`;

    // Kiểm tra keyword là số (có thể là userId) hay chuỗi (tìm theo tên)
    const isNumeric = /^[0-9]+$/.test(keyword);

    try {
        if (isNumeric) {
            // Gọi API GET /api/v1/customers/{id}
            const customer = await apiRequest(`${API_CUSTOMER}/${keyword}`);
            if (customer) {
                renderTable([customer]);
            } else {
                tbody.innerHTML = `<tr><td colspan="6" class="empty-state">❌ Không tìm thấy khách hàng với ID: ${keyword}</td></tr>`;
            }
        } else {
            // Tìm theo tên: nếu đã có cache thì lọc client-side
            if (cacheCustomers) {
                const filtered = cacheCustomers.filter(c => {
                    const fullname = (c.fullname || "").toLowerCase();
                    return fullname.includes(keyword.toLowerCase());
                });
                if (filtered.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">❌ Không tìm thấy khách hàng với tên: ${keyword}</td></tr>`;
                } else {
                    renderTable(filtered);
                }
            } else if (!backendNoGetAll) {
                // Nếu chưa có cache nhưng backend có thể hỗ trợ -> tải rồi lọc
                await loadAllCustomers();
                if (cacheCustomers) {
                    const filtered = cacheCustomers.filter(c => {
                        const fullname = (c.fullname || "").toLowerCase();
                        return fullname.includes(keyword.toLowerCase());
                    });
                    if (filtered.length === 0) {
                        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">❌ Không tìm thấy khách hàng với tên: ${keyword}</td></tr>`;
                    } else {
                        renderTable(filtered);
                    }
                }
            } else {
                // Backend không hỗ trợ GET all -> không thể tìm theo tên
                tbody.innerHTML = `<tr><td colspan="6" class="empty-state">⚠️ Backend không hỗ trợ tìm kiếm theo tên. Vui lòng tìm theo ID.</td></tr>`;
            }
        }
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">❌ Lỗi khi tìm kiếm: ${escapeHtml(error.message || error)}</td></tr>`;
    }
}

function handleSearchKey(event) {
    if (event.key === "Enter") searchCustomer();
}

// 3. RENDER BẢNG (giữ nguyên logic, thêm escapeHtml)
function renderTable(customers) {
    const tbody = document.getElementById('customerTableBody');

    if (!customers || customers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Không có dữ liệu</td></tr>`;
        return;
    }

    tbody.innerHTML = customers.map(c => {
        const addrCount = c.addresses ? c.addresses.length : 0;
        const mainAddr = c.addresses && c.addresses.length > 0 
            ? `${escapeHtml(c.addresses[0].street)}, ${escapeHtml(c.addresses[0].city)}` 
            : '<span style="color:#999">Chưa cập nhật</span>';

        const fullname = c.fullname ? escapeHtml(c.fullname) : 'Chưa cập nhật';
        const email = c.email ? escapeHtml(c.email) : '-';
        const phone = c.phoneNumber ? escapeHtml(c.phoneNumber) : '-';
        const userId = c.userId !== undefined ? escapeHtml(String(c.userId)) : '-';

        return `
            <tr>
                <td><strong>#${userId}</strong></td>
                <td>${fullname}</td>
                <td>${email}</td>
                <td>${phone}</td>
                <td>
                    <div>${mainAddr}</div>
                    ${addrCount > 1 ? `<small style="color:#4f46e5">+${addrCount - 1} địa chỉ khác</small>` : ''}
                </td>
                <td>
                    <button class="btn-icon" onclick="openDetailModal(${userId})">✏️</button>
                </td>
            </tr>
        `;
    }).join('');
}

// 4. MODAL CHI TIẾT (giữ nguyên)
async function openDetailModal(userId) {
    try {
        const customer = await apiRequest(`${API_CUSTOMER}/${userId}`);
        currentCustomerId = userId;

        document.getElementById('modalCustomerId').innerText = customer.userId;
        document.getElementById('custName').value = customer.fullname || '';
        document.getElementById('custEmail').value = customer.email || '';
        document.getElementById('custPhone').value = customer.phoneNumber || '';

        renderAddressList(customer.addresses);

        document.getElementById('customerModal').classList.add('active');
        document.getElementById('overlay').classList.add('active');

    } catch (e) {
        alert("Lỗi tải chi tiết: " + (e.message || e));
    }
}

function closeCustomerModal() {
    document.getElementById('customerModal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    currentCustomerId = null;
}

// 5. LƯU THÔNG TIN CÁ NHÂN (giữ nguyên nhưng reload cach/table)
async function saveCustomerInfo() {
    if(!currentCustomerId) return;

    const body = {
        fullname: document.getElementById('custName').value,
        phoneNumber: document.getElementById('custPhone').value
    };

    try {
        await apiRequest(`${API_CUSTOMER}/${currentCustomerId}`, "PUT", body);
        alert("Cập nhật thành công!");

        // Cập nhật cache nếu có
        if (cacheCustomers) {
            const idx = cacheCustomers.findIndex(c => String(c.userId) === String(currentCustomerId));
            if (idx !== -1) {
                cacheCustomers[idx].fullname = body.fullname;
                cacheCustomers[idx].phoneNumber = body.phoneNumber;
            }
            // render lại toàn bộ bảng từ cache để phản ánh thay đổi
            renderTable(cacheCustomers);
        } else {
            // Nếu không có cache thì cố gắng reload tất cả
            if (!backendNoGetAll) await loadAllCustomers();
        }

        // reload modal data
        openDetailModal(currentCustomerId);
    } catch (e) {
        alert("Lỗi cập nhật: " + (e.message || e));
    }
}

// 6. QUẢN LÝ ĐỊA CHỈ (giữ nguyên, thêm update cache + reload table khi cần)
function renderAddressList(addresses) {
    const list = document.getElementById('addressList');
    if (!addresses || addresses.length === 0) {
        list.innerHTML = `<li style="text-align:center; padding:10px; color:#999;">Trống</li>`;
        return;
    }

    list.innerHTML = addresses.map(addr => `
        <li class="address-item">
            <div class="addr-text">
                <strong>${escapeHtml(addr.street)}</strong>
                <span>${escapeHtml(addr.city)}</span>
            </div>
            <button class="btn-icon btn-delete" onclick="deleteAddress(${addr.id})">🗑️</button>
        </li>
    `).join('');
}

async function addNewAddress() {
    const street = document.getElementById('newStreet').value;
    const city = document.getElementById('newCity').value;

    if (!street || !city) { alert("Vui lòng nhập đủ thông tin!"); return; }

    try {
        await apiRequest(`${API_CUSTOMER}/${currentCustomerId}/addresses`, "POST", { street, city });

        document.getElementById('newStreet').value = "";
        document.getElementById('newCity').value = "";

        // reload modal and refresh cache/table if có
        openDetailModal(currentCustomerId);
        if (cacheCustomers) await loadAllCustomers();
    } catch (e) {
        alert("Lỗi thêm địa chỉ: " + (e.message || e));
    }
}

async function deleteAddress(addrId) {
    if(!confirm("Xóa địa chỉ này?")) return;
    try {
        await apiRequest(`${API_CUSTOMER}/addresses/${addrId}`, "DELETE");
        openDetailModal(currentCustomerId);
        if (cacheCustomers) await loadAllCustomers();
    } catch (e) {
        alert("Lỗi xóa: " + (e.message || e));
    }
}

// ----------------------
// HỖ TRỢ: escape HTML
// ----------------------
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
