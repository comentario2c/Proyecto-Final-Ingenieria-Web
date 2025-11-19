// 1. Importar las Librerías
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
// Importa tu configuración (db.js)
const dbConfig = require('./db.js'); 

// --- 2. Configuración Inicial y de Conexión ---
const app = express();
const port = process.env.PORT || 3000; 

// --- 3. Configuración del Pool ---
const pool = mysql.createPool({
    ...dbConfig, // Usa la configuración importada de db.js
    waitForConnections: true, 
    connectionLimit: 10,      
    queueLimit: 0            
});
// Exportamos la instancia de Express (app) y el Pool.
module.exports = { app, pool }; 

// --- Importaciones de Rutas y Middlewares ---
// Necesitamos importar 'app' de vuelta (es un truco de Node.js)
const { app: serverApp } = require('./server'); 

// Middlewares
app.use(cors()); 
app.use(express.json());

// --- 4. Importación de Rutas (¡AQUÍ ESTÁ LA CORRECCIÓN!) ---
// CORREGIDO: Apuntamos a la carpeta router/
const prestamosRoutes = require('./router/prestamos'); 
const authRoutes = require('./router/auth'); 

// --- 5. Uso de Rutas ---
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/auth', authRoutes);

// --- 6. Ruta de Prueba ---
app.get('/', (req, res) => {
    res.json({ message: '¡El servidor API está funcionando!' });
});

// --- 7. Iniciar el Servidor ---
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    
    // Prueba de Conexión del Pool al iniciar
    pool.getConnection()
        .then(connection => {
            console.log('Conectado exitosamente a la base de datos "prestamos" (Pool OK)');
            connection.release();
        })
        .catch(error => {
            console.error('Error FATAL: La conexión al Pool falló:', error.message);
        });
});