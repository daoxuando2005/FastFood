// js/invoice.js

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId') || urlParams.get('vnp_TxnRef'); 
    
    // Nếu từ VNPAY trả về, orderId có thể nằm trong vnp_TxnRef
    const vnpResponseCode = urlParams.get('vnp_ResponseCode');
    const isCOD = urlParams.get('cod') === 'true';

    if (!orderId) {
        document.getElementById("invoiceContent").innerHTML = `
            <div class="invoice-box">
                <div class="success-icon" style="color:red;">❌</div>
                <h2>Không tìm thấy mã đơn hàng!</h2>
                <a href="../index.html" class="btn-checkout" style="display:inline-block; width:auto; text-decoration:none;">Về trang chủ</a>
            </div>
        `;
        return;
    }

    // Nếu từ VNPAY về mà lỗi
    if (vnpResponseCode && vnpResponseCode !== '00') {
        document.getElementById("invoiceContent").innerHTML = `
            <div class="invoice-box">
                <div class="success-icon" style="color:red;">❌</div>
                <h2>Thanh toán thất bại hoặc đã bị hủy!</h2>
                <p>Mã lỗi VNPAY: ${vnpResponseCode}</p>
                <a href="../index.html" class="btn-checkout" style="display:inline-block; width:auto; text-decoration:none;">Về trang chủ</a>
            </div>
        `;
        return;
    }

    try {
        // Lấy chi tiết đơn hàng từ Order Service
        const order = await apiRequest(`${API.ORDER}/${orderId}`, "GET");
        renderInvoice(order, isCOD || vnpResponseCode === '00');
    } catch (err) {
        console.error(err);
        document.getElementById("invoiceContent").innerHTML = `
            <div class="invoice-box">
                <div class="success-icon" style="color:red;">❌</div>
                <h2>Lỗi khi tải hóa đơn</h2>
                <p>${err.message}</p>
            </div>
        `;
    }
});

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function renderInvoice(order, isSuccess) {
    const container = document.getElementById("invoiceContent");
    
    const date = new Date(order.createdAt).toLocaleString('vi-VN');
    
    // Xác định trạng thái thanh toán hiển thị
    let paymentStatus = order.status;
    let paymentMethodStr = order.status === 'PAID' ? 'VNPAY' : 'Thanh toán khi nhận hàng (COD)';

    if (order.status === 'PAID') {
        paymentStatus = '<span style="color:#28a745; font-weight:bold;">Đã thanh toán (VNPAY)</span>';
    } else {
        paymentStatus = '<span style="color:#ffc107; font-weight:bold;">Chưa thanh toán (COD)</span>';
    }

    container.innerHTML = `
        <div class="invoice-header">
            <div class="success-icon">✅</div>
            <h1>Đặt Hàng Thành Công!</h1>
            <p>Cảm ơn bạn đã đặt món tại FastFood. Đơn hàng của bạn đang được xử lý.</p>
        </div>

        <div class="invoice-details">
            <div>
                <p><strong>Mã đơn hàng:</strong> #${order.id}</p>
                <p><strong>Thời gian đặt:</strong> ${date}</p>
                <p><strong>Trạng thái thanh toán:</strong> ${paymentStatus}</p>
            </div>
            <div>
                <p><strong>Thông tin nhận hàng:</strong></p>
                <p>${order.deliveryAddress}</p>
            </div>
        </div>

        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Món ăn (Mã ID)</th>
                    <th style="text-align:center;">Số lượng</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => `
                    <tr>
                        <td>Món số #${item.dishId}</td>
                        <td style="text-align:center;">${item.quantity}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>

        <div class="invoice-total">
            <p style="font-size:1rem; color:#555; font-weight:normal;">(Đã bao gồm 15.000đ phí vận chuyển)</p>
            Tổng cộng: <span style="color:#ee4d2d; font-size:1.5rem;">${formatMoney(order.totalAmount)}</span>
        </div>
        
        <div style="text-align:center; margin-top: 40px;">
            <a href="../index.html" class="btn-checkout" style="display:inline-block; width:auto; text-decoration:none; padding:10px 30px;">Tiếp tục mua sắm</a>
        </div>
    `;
}
