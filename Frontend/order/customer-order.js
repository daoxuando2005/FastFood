// order/customer-order.js

document.addEventListener("DOMContentLoaded", async () => {
    const authData = JSON.parse(localStorage.getItem("foodhub_auth"));
    if (!authData || !authData.token) {
        alert("Vui lòng đăng nhập!");
        window.location.href = "../auth/login.html";
        return;
    }

    try {
        // Fetch orders cho userId hiện tại
        const orders = await apiRequest(`${API.ORDER}/user/${authData.userId}`, "GET");
        renderOrders(orders);
    } catch (err) {
        console.error(err);
        document.getElementById("ordersList").innerHTML = `
            <div style="text-align:center; color:red;">
                <h3>Lỗi tải đơn hàng</h3>
                <p>${err.message}</p>
            </div>
        `;
    }
});

function renderOrders(orders) {
    const listEl = document.getElementById("ordersList");
    
    if (!orders || orders.length === 0) {
        listEl.innerHTML = `
            <div style="text-align:center; padding: 40px; background: #fff; border-radius: 8px;">
                <p>Bạn chưa có đơn hàng nào.</p>
                <a href="../index.html" style="color: #ee4d2d; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 10px;">Tiếp tục mua sắm</a>
            </div>
        `;
        return;
    }

    // Sắp xếp đơn hàng mới nhất lên đầu
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    listEl.innerHTML = orders.map(order => {
        const date = new Date(order.createdAt).toLocaleString('vi-VN');
        
        let statusText = order.status;
        if (order.status === 'PENDING') statusText = 'CHỜ DUYỆT / CHƯA THANH TOÁN (COD)';
        if (order.status === 'PAID') statusText = 'ĐÃ THANH TOÁN (VNPAY) - CHỜ DUYỆT';

        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <strong>Mã đơn: #${order.id}</strong>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">${date}</div>
                    </div>
                    <div>
                        <span class="order-status status-${order.status}">${statusText}</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong>Địa chỉ giao hàng:</strong> ${order.deliveryAddress}
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Món ăn</th>
                            <th style="text-align: center;">Số lượng</th>
                            <th style="text-align: right;">Đơn giá</th>
                            <th style="text-align: right;">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.dishName || 'Món #' + item.dishId}</td>
                                <td style="text-align: center;">${item.quantity}</td>
                                <td style="text-align: right;">${formatMoney(item.unitPrice)}</td>
                                <td style="text-align: right; color: #ee4d2d;">${formatMoney(item.subTotal)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div style="text-align: right; margin-top: 15px; font-size: 1.1rem;">
                    Tổng tiền: <strong style="color: #ee4d2d; font-size: 1.3rem;">${formatMoney(order.totalAmount)}</strong>
                </div>
                
                <div style="text-align: right; margin-top: 10px;">
                    <a href="invoice.html?orderId=${order.id}" style="color: #007bff; text-decoration: none; font-size: 0.9rem;">Xem chi tiết hóa đơn</a>
                </div>
            </div>
        `;
    }).join('');
}
