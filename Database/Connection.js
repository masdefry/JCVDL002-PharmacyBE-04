const mysql = require('mysql');
require('dotenv').config();

// Connection
const db = mysql.createConnection({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
});

db.connect((err) => {
    if (err) {
        return console.error(`error:  ${err.message}`);
    }
    console.log('Connected to mysql server');
});

module.exports = { db };