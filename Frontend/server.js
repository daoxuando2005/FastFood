// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Danh sách các định dạng file hỗ trợ
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Chỉ định file mặc định là index.html
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Loại bỏ query string (ví dụ: detail.html?resId=123 -> detail.html)
    filePath = filePath.split('?')[0];

    // Lấy phần mở rộng của file
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // Đọc file từ ổ đĩa
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File không tồn tại
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 Not Found - Không tìm thấy trang</h1>', 'utf-8');
            } else {
                // Lỗi server khác
                res.writeHead(500);
                res.end(`Lỗi Server: ${error.code}`);
            }
        } else {
            // Trả về nội dung file thành công
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('===================================================');
    console.log(`🚀 FastFood Frontend đang chạy tại: http://localhost:${PORT}`);
    console.log('===================================================');
    console.log('Nhấn Ctrl + C để tắt máy chủ.');
});
