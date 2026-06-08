// payment.js

// --- 1. SỬA ĐƯỜNG DẪN API (Gọi qua Gateway 8080) ---
// Controller mới của bạn là: /api/v1/payments/all
const API_PAYMENT = "http://localhost:8080/api/v1/payments/all";

let allPayments = [];

document.addEventListener("DOMContentLoaded", () => {
  loadPayments();
});

// 2. TẢI DỮ LIỆU
async function loadPayments() {
  const tbody = document.getElementById("paymentTableBody");
  tbody.innerHTML = `<tr><td colspan="7" class="loading-text">⏳ Đang đồng bộ dữ liệu...</td></tr>`;

  try {
    // Dùng fetch trực tiếp để kiểm soát tốt hơn
    const response = await fetch(API_PAYMENT, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
            // Nếu có token admin thì thêm: 'Authorization': 'Bearer ...'
        }
    });

    if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Dữ liệu thanh toán:", data); // In ra để debug

    allPayments = Array.isArray(data) ? data : [];

    // Sắp xếp: Mới nhất lên đầu (Dựa vào id hoặc vnpTxnRef nếu createdAt null)
    allPayments.sort((a, b) => b.id - a.id);

    calculateStats();
    renderTable(allPayments);

  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state" style="color:red">
        Lỗi kết nối: ${error.message} <br>
        (Hãy chắc chắn Payment Service đang chạy và Gateway 8080 hoạt động)
    </td></tr>`;
  }
}

// 3. RENDER BẢNG
function renderTable(data) {
  const tbody = document.getElementById("paymentTableBody");

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">Chưa có giao dịch nào.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((p) => {
      // Xử lý ngày giờ
      let timeDisplay = "---";
      // Ưu tiên hiển thị createdAt nếu có, nếu không thì lấy từ vnpTxnRef
      if (p.paymentTime) { // Nếu backend trả về field paymentTime
          timeDisplay = new Date(p.paymentTime).toLocaleString("vi-VN");
      } else if (p.vnpTxnRef && p.vnpTxnRef.length > 10) {
          try {
             // VNPAY TxnRef thường bắt đầu bằng timestamp: 20251205...
             // Nhưng để đơn giản ta cứ hiện mã giao dịch
             timeDisplay = "Vừa xong"; 
          } catch(e) {}
      }

      return `
        <tr>
            <td>#${p.id}</td>
            <td><strong>${p.orderInfo || "Đơn hàng " + p.orderId}</strong></td>
            <td style="font-weight:bold; color: #1e293b;">${formatMoney(p.amount)}</td>
            <td>
                <span class="method-badge">
                   <img src="https://sandbox.vnpayment.vn/paymentv2/images/icons/vnpay.svg" width="16"> VNPAY
                </span>
            </td>
            <td>
                <span class="transaction-code">${p.vnpTxnRef || "---"}</span>
            </td>
            <td style="font-size:0.9rem; color:#64748b;">
                ${p.orderId}
            </td>
            <td>${getStatusBadge(p.status)}</td>
        </tr>
    `;
    })
    .join("");
}

// 4. TÍNH TOÁN THỐNG KÊ
function calculateStats() {
  // Backend trả về status là: "PAID" hoặc "00" tùy logic, ta check cả 2
  const successList = allPayments.filter((p) => p.status === "PAID" || p.status === "00");
  const failedList = allPayments.filter((p) => p.status !== "PAID" && p.status !== "00");

  const totalRevenue = successList.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Cập nhật giao diện (Kiểm tra xem element có tồn tại không trước khi gán)
  const elTotal = document.getElementById("totalRevenue");
  if(elTotal) elTotal.innerText = formatMoney(totalRevenue);

  const elSuccess = document.getElementById("countSuccess");
  if(elSuccess) elSuccess.innerText = successList.length;

  const elFailed = document.getElementById("countFailed");
  if(elFailed) elFailed.innerText = failedList.length;
}

// 5. BỘ LỌC
function filterPayments() {
  const status = document.getElementById("statusFilter").value;

  if (status === "ALL") {
    renderTable(allPayments);
  } else {
    const filtered = allPayments.filter((p) => {
      const isPaid = (p.status === "PAID" || p.status === "00");
      if (status === "SUCCESS") return isPaid;
      if (status === "FAILED") return !isPaid;
      return false;
    });
    renderTable(filtered);
  }
}

// 6. TÌM KIẾM
function searchPayment() {
  const keyword = document.getElementById("paymentSearch").value.toLowerCase();

  const filtered = allPayments.filter(
    (p) =>
      (p.orderId && p.orderId.toString().includes(keyword)) ||
      (p.vnpTxnRef && p.vnpTxnRef.toLowerCase().includes(keyword))
  );

  renderTable(filtered);
}

// Helper: Badge HTML
function getStatusBadge(status) {
  if (status === "PAID" || status === "00") {
    return `<span class="badge-SUCCESS" style="color:green; font-weight:bold; background:#e6fffa; padding:4px 8px; border-radius:4px;">✅ Thành công</span>`;
  } else {
    return `<span class="badge-FAILED" style="color:red; font-weight:bold; background:#fff5f5; padding:4px 8px; border-radius:4px;">❌ Thất bại</span>`;
  }
}

// Helper: Format tiền tệ VND
function formatMoney(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}