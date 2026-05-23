const mysql = require('mysql2');

// Konfiguracja połączenia z bazą danych
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fashion_beauty'
});

// Eksportuj połączenie
const db = pool.promise();

module.exports = db;