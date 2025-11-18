
// 'express' es el framework del servidor.
const express = require('express');
// 'express.Router()' es un "mini-servidor" especial de Express
// que nos permite organizar nuestras rutas en archivos separados.
const router = express.Router();
// 'mysql2/promise' es el "conductor" (driver) que nos permite hablar con la base de datos MySQL
// usando 'async/await' (la versión moderna).
const mysql = require('mysql2/promise');

// Flujo General del Codigo
// Este archivo maneja toda la lógica de negocio relacionada con los "Préstamos" y "Equipos".
// Es el "controlador de inventario" de nuestra API.
// 1. El 'server.js' recibe una petición (ej. 'GET /api/prestamos/usuario/123').
// 2. 'server.js' la redirige a este archivo ('prestamos.js') porque registramos la ruta '/api/prestamos'.
// 3. Este archivo busca el endpoint correspondiente (ej. router.get('/usuario/:id_usuario', ...)).
// 4. El endpoint se conecta a la base de datos MySQL (tablas 'Prestamos' y 'Equipos').
// 5. Realiza la consulta SQL necesaria.
// 6. Devuelve una respuesta JSON (los datos) al frontend (Vue).
//
// (Nota: ¡Este archivo ahora está completo! Contiene las dos rutas
// que necesita el frontend: '/usuario/:id_usuario' y '/equipos-disponibles')

// Configuración de la BD 
// Estas son las "llaves" para entrar a la base de datos.
// Se usan en cada endpoint para crear una nueva conexión.
const dbConfig = {
    host: 'localhost',
    user: 'root', 
    password: '212833967',   
    database: 'prestamos'
};

// Endpoints (Rutas de Préstamos)

/**
 * @route   GET /api/prestamos/usuario/:id_usuario
 * @desc    Obtiene todos los préstamos de UN usuario específico
 * @access  Privado (Solo el alumno logueado debe ver esto)
 */
router.get('/usuario/:id_usuario', async (req, res) => {
    // Flujo de "Mis Préstamos":
    // 1. Intenta (try) ejecutar la lógica.
    // 2. Obtiene el 'id_usuario' de los parámetros de la URL (ej. /usuario/fKhb00r8...).
    // 3. Se conecta a la BD.
    // 4. Define la consulta SQL (CON UN JOIN):
    //    - Selecciona datos de la tabla 'Prestamos' (p).
    //    - Los une (JOIN) con la tabla 'Equipos' (e) (para obtener el nombre del modelo).
    //    - Donde el ID del usuario coincida (WHERE p.ID_Usuario = ?).
    // 5. Ejecuta la consulta.
    // 6. Cierra la conexión.
    // 7. Devuelve la lista de préstamos (el array 'rows') como JSON.
    // 8. Si algo falla (catch), devuelve un error 500.
    try {
        // Obtener el ID del usuario desde los parámetros de la URL
        const { id_usuario } = req.params;

        // Crear una conexión a la BD
        const connection = await mysql.createConnection(dbConfig);

        // Definir la consulta SQL (CON EL JOIN)
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
        
        // Ejecutar la consulta (pasando el id_usuario de forma segura)
        const [rows] = await connection.execute(query, [id_usuario]);
        
        // Cerrar la conexión
        await connection.end();

        // Enviar los resultados como JSON
        // (Alumnos.vue recibirá esta lista)
        res.json(rows);

    } catch (error) {
        // Manejo de errores
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
 * @access  Public (Cualquiera puede ver qué equipos hay)
 */
router.get('/equipos-disponibles', async (req, res) => {
    // Flujo de equipos-disponibles:
    // 1. Intenta (try) ejecutar la lógica.
    // 2. Se conecta a la BD.
    // 3. Define la consulta SQL: seleccionar los equipos 'disponibles'.
    // 4. Ejecuta la consulta.
    // 5. Cierra la conexión.
    // 6. Devuelve la lista de equipos (el array 'rows') como JSON.
    // 7. Si algo falla (catch), devuelve un error 500.
    try {
        // Creamos la conexión a MySQL.
        const connection = await mysql.createConnection(dbConfig);

        // Definimos la consulta SQL (basada en tu tabla Equipos)
        const query = `
            SELECT ID_Equipo, modelo, numeroSerie 
            FROM Equipos 
            WHERE estado = 'disponible'
            ORDER BY modelo ASC;
        `;
        
        // Ejecutamos la consulta.
        // 'rows' es el array de resultados (los equipos encontrados).
        const [rows] = await connection.execute(query);
        
        // Cerramos la conexión (importante para no saturar la BD).
        await connection.end();
        
        // Devolver la lista al frontend (Vue).
        // Si no se encuentra nada, 'rows' será un array vacío [].
        res.json(rows);

    } catch (error) {
        // Manejo de errores.
        console.error("Error en GET /api/prestamos/equipos-disponibles:", error.message);
        // Devuelve un error 500 (Error Interno del Servidor) al frontend.
        res.status(500).json({ 
            error: 'Error interno del servidor', 
            message: error.message 
        });
    }
});

// Exportación
// 'module.exports' es la forma en que Node.js "publica" este router
// para que 'server.js' pueda importarlo y usarlo (con 'require').
// ¡Asegúrate de que esta línea esté al final del archivo!
module.exports = router;