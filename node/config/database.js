const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path : path.join(__dirname, '../../.env') });
console.log("체크 - DB_USER:", process.env.DB_USER);

const conn = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});



module.exports = conn;