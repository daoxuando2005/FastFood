const fs = require('fs'); 
let sql = 'SET NAMES utf8mb4;\n'; 

const statuses = ['COMPLETED', 'DELIVERING', 'PENDING', 'CONFIRMED', 'CANCELLED']; 
const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ']; 
const middleNames = ['Văn', 'Thị', 'Thanh', 'Minh', 'Hồng', 'Ngọc', 'Hải', 'Thùy']; 
const lastNames = ['Hùng', 'Hương', 'Hà', 'Nam', 'Nữ', 'Linh', 'Anh', 'Mạnh', 'Sơn', 'Tùng', 'Đức', 'Trang']; 
const addresses = ['Cầu Giấy, HN', 'Đống Đa, HN', 'Hai Bà Trưng, HN', 'Láng Hạ, HN', 'Thái Hà, HN', 'Chùa Bộc, HN', 'Tây Sơn, HN', 'Thanh Xuân, HN', 'Hà Đông, HN', 'Ba Đình, HN']; 

sql += 'INSERT INTO auth_service.users (created_at, email, password, role, updated_at) VALUES\n'; 
let userVals = []; 
for(let i=10; i<=50; i++) { 
    userVals.push(`(NOW(), 'kh${i}@gmail.com', '$2a$10$Q7wE6y.Jm7Vz/mE3iT/.7OEqz9zI8L9k2uQz5x0y6/tZ7z4l5.6Kq', 'CUSTOMER', NOW())`); 
} 
sql += userVals.join(',\n') + ';\n\n'; 

sql += 'INSERT INTO customer_service.customers (email, fullname, phone_number, user_id) VALUES\n'; 
let custVals = []; 
for(let i=10; i<=50; i++) { 
    const fn = firstNames[Math.floor(Math.random()*firstNames.length)]; 
    const mn = middleNames[Math.floor(Math.random()*middleNames.length)]; 
    const ln = lastNames[Math.floor(Math.random()*lastNames.length)]; 
    const phone = '09' + Math.floor(10000000+Math.random()*90000000);
    // user_id in customers table should ideally link to users table. 
    // We assume the new users will get IDs starting from some number. 
    // But since it's just dummy data, we just map it to the loop index
    custVals.push(`('kh${i}@gmail.com', '${fn} ${mn} ${ln}', '${phone}', ${i + 5})`); 
} 
sql += custVals.join(',\n') + ';\n\n'; 

sql += 'INSERT INTO order_service.orders (created_at, customer_id, delivery_address, restaurant_id, status, total_amount) VALUES\n'; 
let orderVals = []; 
for(let i=1; i<=250; i++) { 
    const addr = Math.floor(Math.random()*200) + ' ' + addresses[Math.floor(Math.random()*addresses.length)]; 
    const res = Math.floor(Math.random()*3)+1; 
    const st = statuses[Math.floor(Math.random()*statuses.length)]; 
    const total = Math.floor(5+Math.random()*45)*10000; 
    const dayAgo = Math.floor(Math.random()*30); 
    const custId = Math.floor(Math.random()*40) + 3; // From 3 to 42
    orderVals.push(`(DATE_SUB(NOW(), INTERVAL ${dayAgo} DAY), ${custId}, '${addr}', ${res}, '${st}', ${total})`); 
} 
sql += orderVals.join(',\n') + ';\n\n'; 

fs.writeFileSync('D:/study/KTPM/project/Service-Oriented-Programing-Development-main/massive_seed.sql', sql, 'utf8');
console.log('Generated massive_seed.sql successfully');
