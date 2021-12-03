const mysql = require('mysql');

// Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'dimzsql',
    database: 'dbdesign',
    port: 3306,
    multipleStatements: true
});

db.connect((err) => {
    if (err) {
        return console.error(`error:  ${err.message}`);
    }
    console.log('Connected to mysql server');
});

module.exports = { db };