// --- 1. Importar Librerías y el Pool ---
// 'express' es el framework del servidor.
const express = require('express');
// 'express.Router()' es un "mini-servidor" especial de Express para organizar rutas.
const router = express.Router();
// 'mysql2/promise' es el conductor para la base de datos.
const mysql = require('mysql2/promise');

// Usamos './server' porque está al mismo nivel.
const { pool } = require('./server'); 



/**
 * @route   POST /api/auth/register
 * @desc    Registra un nuevo usuario en la base de datos
 * @access  Public
 */
router.post('/register', async (req, res) => {
    let connection; // Declaramos la conexión fuera del try para poder liberarla
    try {
        // Obtener datos del 'body' de la petición.
        const { uid, correo, nombre, rut } = req.body;
        // Validar el rol basado en el dominio del correo.
        const dominio = correo.split('@')[1];
        let rol;

        if (dominio === 'alu.unach.cl') {
            rol = 'alumno';
        } else if (dominio === 'unach.cl') {
            rol = 'profesor';
        } else {
            // Si el correo no es de la U, rechaza el registro.
            return res.status(400).json({ 
                error: 'Correo no institucional'
            });
        }

        // 1. Pedir prestada una conexión al Pool
        connection = await pool.getConnection();

        // 2. Insertar el nuevo usuario en la tabla 'Usuario'
        const insertQuery = `
            INSERT INTO Usuario (ID_Usuario, rut, nombre, correo, rol)
            VALUES (?, ?, ?, ?, ?);
        `;
        await connection.execute(insertQuery, [uid, rut, nombre, correo, rol]);
        
        // 3. Seleccionar el usuario que acabamos de crear (para devolverlo).
        const [rows] = await connection.execute('SELECT * FROM Usuario WHERE ID_Usuario = ?', [uid]);

        // 4. Devolver la conexión al Pool
        connection.release(); 
        
        // Devolver el usuario recién creado al frontend con status 201 (Creado).
        res.status(201).json(rows[0]);

    } catch (error) {
        // Asegurarse de liberar la conexión en caso de que falle
        if (connection) connection.release(); 
        
        // Manejo de errores.
        console.error("Error en POST /api/auth/register:", error.message);
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(400).json({ error: 'Usuario ya existe' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Verifica si un usuario existe y devuelve sus datos
 * @access  Public
 */
router.post('/login', async (req, res) => {
    let connection;
    try {
        // Obtener el 'uid' del 'body'.
        const { uid } = req.body;

        // 1. Pedir prestada una conexión al Pool
        connection = await pool.getConnection();

        // 2. Buscar al usuario por su ID_Usuario (que es el uid de Firebase).
        const query = `SELECT * FROM Usuario WHERE ID_Usuario = ?`;
        const [rows] = await connection.execute(query, [uid]);
        
        // 3. Devolver la conexión al Pool
        connection.release();

        // 4. Verificar si se encontró.
        if (rows.length === 0) {
            // No se encontró: Devolver un error 404 para que el frontend lo maneje.
            return res.status(404).json({
                error: 'Usuario no encontrado',
                message: 'No se encontró un usuario con ese ID. Por favor, regístrate.'
            });
        }

        // 5. Devolver los datos del usuario.
        const usuario = rows[0];
        res.json(usuario);

    } catch (error) {
        if (connection) connection.release(); 
        // Manejo de errores.
        console.error("Error en POST /api/auth/login:", error.message);
        res.status(500).json({ 
            error: 'Error interno del servidor', 
            message: error.message 
        });
    }
});


// Exportación 
module.exports = router;