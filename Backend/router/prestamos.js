// --- 1. Importar Librerías y el Pool ---
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
// Usamos '../server' para subir un nivel y encontrar el Pool
const { pool } = require('../server');

/**
 * @route   GET /api/prestamos/usuario/:id_usuario
 * @desc    Obtiene todos los préstamos de UN usuario específico (para Alumnos.vue)
 * @access  Privado
 */
router.get('/usuario/:id_usuario', async (req, res) => {
    let connection; // Declaramos la conexión fuera del try para poder liberarla
    try {
        const { id_usuario } = req.params;

        // 1. Pedir prestada una conexión al Pool
        connection = await pool.getConnection(); 

        const query = `
            SELECT
                p.ID_Prestamo,
                p.fechaPrestamo,
                p.fechaEntrega,
                p.estado,
                e.modelo,
                e.numeroSerie
            FROM Prestamos p
            JOIN Equipos e ON p.ID_Equipo = e.ID_Equipo
            WHERE p.ID_Usuario = ?
            ORDER BY p.fechaPrestamo DESC;
        `;
        
        const [rows] = await connection.execute(query, [id_usuario]);
        
        // 2. Devolver la conexión al Pool
        connection.release();

        res.json(rows);

    } catch (error) {
        // 3. Manejo de errores: Asegurarse de liberar la conexión si falló
        if (connection) connection.release(); 
        
        console.error("Error en GET /api/prestamos/usuario:", error.message);
        res.status(500).json({ 
            error: 'Error interno del servidor', 
            message: error.message 
        });
    }
});

/**
 * @route   GET /api/prestamos/equipos-disponibles
 * @desc    Obtiene todos los equipos con estado 'disponible'
 * @access  Público
 */
router.get('/equipos-disponibles', async (req, res) => {
    let connection;
    try {
        // 1. Pedir prestada una conexión al Pool
        connection = await pool.getConnection(); 

        const query = `
            SELECT ID_Equipo, modelo, numeroSerie 
            FROM Equipos 
            WHERE estado = 'disponible'
            ORDER BY modelo ASC;
        `;
        
        const [rows] = await connection.execute(query);
        
        // 2. Devolver la conexión al Pool
        connection.release();
        
        res.json(rows);

    } catch (error) {
        // 3. Manejo de errores: Asegurarse de liberar la conexión si falló
        if (connection) connection.release(); 
        console.error("Error en GET /api/prestamos/equipos-disponibles:", error.message);
        res.status(500).json({ 
            error: 'Error interno del servidor', 
            message: error.message 
        });
    }
});


// Exportación
module.exports = router;