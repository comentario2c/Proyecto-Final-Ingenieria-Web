// --- 1. Importar Librerías y el Pool ---
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
//  Usamos '../server' porque estamos dentro de la carpeta 'router'
const { pool } = require('../server'); 

// Funciones Auxiliares (Lógica de Rol)
// Esta lógica se usa internamente para determinar el rol en el registro/login.
const getRolFromEmail = (email) => {
    const dominio = email.split('@')[1];
    if (dominio === 'alu.unach.cl') {
        return 'alumno';
    } else if (dominio === 'unach.cl') {
        return 'profesor';
    } else {
        return null; 
    }
}


/**
 * @route   POST /api/auth/login-or-register
 * @desc    Busca al usuario por UID. Si no existe, lo registra y devuelve el objeto.
 * @access  Public
 */
router.post('/login-or-register', async (req, res) => {
    let connection;
    try {
        // 1. Obtener datos ENVIADOS por el Frontend (uid siempre existe)
        const { uid, email, nombre, rut } = req.body;

        // 2. Pedir prestada una conexión al Pool
        connection = await pool.getConnection();

        // 3. BUSCAR: Verificar si el usuario ya existe por su UID
        const [rows] = await connection.execute('SELECT * FROM Usuario WHERE ID_Usuario = ?', [uid]);

        if (rows.length > 0) {

            connection.release(); 
            return res.status(200).json(rows[0]);

        } else {

            const rol = getRolFromEmail(email);

            if (!rol) {
                // El correo no es institucional, devolvemos error 400.
                connection.release();
                return res.status(400).json({ error: 'Correo no institucional' });
            }


            const insertQuery = `
                INSERT INTO Usuario (ID_Usuario, rut, nombre, correo, rol)
                VALUES (?, ?, ?, ?, ?);
            `;
            // El RUT es opcional/nulo si el usuario se salta el formulario.
            await connection.execute(insertQuery, [uid, rut || null, nombre, correo, rol]);
            
            // 4.3 Obtener y devolver el usuario recién creado
            const [newRows] = await connection.execute('SELECT * FROM Usuario WHERE ID_Usuario = ?', [uid]);
            
            connection.release(); 
            res.status(201).json(newRows[0]); // 201: Creado con éxito.
        }

    } catch (error) {
        if (connection) connection.release(); 
        
        console.error("Error en POST /api/auth/login-or-register:", error.message);
        
        // Manejo específico para el caso de llave duplicada
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(400).json({ error: 'Usuario ya existe' });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor', 
            message: error.message 
        });
    }
});


// Exportación 
module.exports = router;