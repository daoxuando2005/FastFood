const fs = require('fs');
let buf = fs.readFileSync('D:/study/KTPM/project/Service-Oriented-Programing-Development-main/database_backup.sql');
let str;
if (buf[0] === 0xFF && buf[1] === 0xFE) {
    console.log("Detected UTF-16LE BOM");
    str = buf.toString('utf16le');
} else {
    console.log("Detected other encoding, assuming UTF-8");
    str = buf.toString('utf8');
}
str = str.replace(/\0/g, '');
fs.writeFileSync('D:/study/KTPM/project/Service-Oriented-Programing-Development-main/database_backup_clean.sql', str, 'utf8');
console.log("Cleaned SQL file created successfully.");
