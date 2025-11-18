const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
// Importa db.js (está al lado)
const dbConfig = require('./db'); 

// --- Configuración del Pool ---
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true, 
    connectionLimit: 10,
    queueLimit: 0            
});

module.exports = { app, pool }; 

// --- Inicialización ---
const { app } = require('./server'); 
const port = process.env.PORT || 3000; 

app.use(cors()); 
app.use(express.json());

// --- RUTAS (Usando la carpeta 'router' de tu imagen) ---
// Aquí está la diferencia: apuntamos a la carpeta router
const prestamosRoutes = require('./router/prestamos'); 
app.use('/api/prestamos', prestamosRoutes);

const authRoutes = require('./router/auth'); 
app.use('/api/auth', authRoutes);

// --- Ruta de Prueba ---
app.get('/', (req, res) => {
    res.json({ message: '¡El servidor API está funcionando!' });
});

// --- Iniciar Servidor ---
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    
    pool.getConnection()
        .then(connection => {
            console.log('Conectado exitosamente a la base de datos "prestamos" (Pool OK)');
            connection.release(); 
        })
        .catch(error => {
            console.error('Error FATAL: La conexión al Pool falló:', error.message);
        });
});