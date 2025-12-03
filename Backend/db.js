// Busca un archivo llamado '.env' en la raíz y carga sus valores.
require('dotenv').config();
const mysql = require("mysql2/promise")
const fs = require("fs")

const pool = mysql.createPool ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false,
    }
})

pool.getConnection().then(conn => {
    pool.releaseConnection(conn)
    console.log("conexion establecida")
}).catch(err => {
    console.log("erorr de conexion: " + err)
})

module.exports = pool;