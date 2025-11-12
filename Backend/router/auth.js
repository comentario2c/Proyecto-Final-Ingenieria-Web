// 'express' es el framework del servidor.
const express = require('express');
// 'express.Router()' es un "mini-servidor" especial de Express
// que nos permite organizar nuestras rutas en archivos separados.
const router = express.Router();
// 'mysql2/promise' es el "conductor" (driver) que nos permite hablar con la base de datos MySQL
// usando 'async/await' (la versión moderna).
const mysql = require('mysql2/promise');

// Flujo General del Codigo
// Este archivo es el "controlador de pasaportes" de nuestra API.
// Maneja todo lo relacionado con la autenticación: registrar nuevos usuarios
// e iniciar sesión de usuarios existentes.
// 1. El 'server.js' recibe una petición (ej. 'POST /api/auth/register').
// 2. 'server.js' la redirige a este archivo ('auth.js') porque registramos la ruta '/api/auth'.
// 3. Este archivo busca el endpoint correspondiente (ej. router.post('/register', ...)).
// 4. El endpoint se conecta a la base de datos MySQL (tabla 'Usuario').
// 5. Realiza la lógica de negocio:
//    - '/register': Valida el correo, y si es de la U, inserta un nuevo usuario en la tabla.
//    - '/login': Busca un usuario existente por su UID.
// 6. Devuelve una respuesta JSON (los datos del usuario o un error) al frontend (Vue).

// Configuración de la BD 
// Estas son las "llaves" para entrar a la base de datos.
// Se usan en cada endpoint para crear una nueva conexión.
const dbConfig = {
    host: 'localhost',
    user: 'root', 
    password: '212833967', 
    database: 'prestamos'
};

// Endpoints (Rutas de Autenticación)

/**
 * @route   POST /api/auth/register
 * @desc    Registra un nuevo usuario en la base de datos
 * @access  Public
 */
router.post('/register', async (req, res) => {
    // Flujo de Registro:
    // 1. Intenta (try) ejecutar toda la lógica de registro.
    // 2. Obtiene los datos (uid, correo, nombre, rut) que envió el frontend (register.vue)
    //    desde el 'body' de la petición (req.body).
    // 3. Valida el correo (revisa el dominio @alu.unach.cl o @unach.cl).
    // 4. Si el correo no es válido, devuelve un error 400 y se detiene.
    // 5. Se conecta a la BD.
    // 6. Inserta el nuevo usuario en la tabla 'Usuario' (con el UID de Firebase como ID_Usuario).
    // 7. Vuelve a seleccionar al usuario de la BD para obtener el objeto completo.
    // 8. Cierra la conexión y devuelve el objeto de usuario con un código 201 (Creado).
    // 9. Si algo falla (catch), maneja el error (ej. usuario ya existe).
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

        // Conectarse a MySQL.
        const connection = await mysql.createConnection(dbConfig);
        // Preparar y ejecutar la consulta SQL para insertar.
        const insertQuery = `
            INSERT INTO Usuario (ID_Usuario, rut, nombre, correo, rol)
            VALUES (?, ?, ?, ?, ?);
        `;
        // Los '?' se reemplazan de forma segura por los valores del array, evitando inyección SQL.
        await connection.execute(insertQuery, [uid, rut, nombre, correo, rol]);
        
        // Seleccionar el usuario que acabamos de crear (para devolverlo).
        const [rows] = await connection.execute('SELECT * FROM Usuario WHERE ID_Usuario = ?', [uid]);
        // Cerrar la conexión (importante para no saturar la BD).
        await connection.end();
        
        // Devolver el usuario recién creado al frontend.
        // 'rows[0]' es el primer (y único) usuario encontrado.
        res.status(201).json(rows[0]);

    } catch (error) {
        // Manejo de errores.
        console.error("Error en POST /api/auth/register:", error.message);
        // 'ER_DUP_ENTRY' es el código de error de MySQL para "llave duplicada"
        // (ej. el ID_Usuario o el RUT ya existen).
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(400).json({ error: 'Usuario ya existe' });
        }
        // Si es cualquier otro error, devuelve un 500 (Error interno del servidor).
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


/**
 * @route   POST /api/auth/login
 * @desc    Verifica si un usuario existe y devuelve sus datos
 * @access  Public
 */
router.post('/login', async (req, res) => {
    // Flujo de Login:
    // 1. Intenta (try) ejecutar la lógica.
    // 2. Obtiene el 'uid' (ID de Firebase) que envió el frontend (login.vue).
    // 3. Se conecta a la BD.
    // 4. Busca en la tabla 'Usuario' donde el 'ID_Usuario' coincida con el 'uid'.
    // 5. Cierra la conexión.
    // 6. Verifica si se encontró al usuario (rows.length).
    //    6.1 Si NO se encontró (length === 0), devuelve el error 404 "Usuario no encontrado".
    //    6.2 Si SÍ se encontró, devuelve el objeto de usuario con código 200 (OK).
    // 7. Si algo falla (catch), devuelve un error 500.
    try {
        // Obtener el 'uid' del 'body'.
        const { uid } = req.body;
        // Conectarse a MySQL.
        const connection = await mysql.createConnection(dbConfig);

        // Buscar al usuario por su ID_Usuario (que es el uid de Firebase).
        const query = `SELECT * FROM Usuario WHERE ID_Usuario = ?`;
        // 'execute' es seguro contra inyección SQL.
        const [rows] = await connection.execute(query, [uid]);
        // Cerrar la conexión.
        await connection.end();

        // Verificar si se encontró.
        if (rows.length === 0) {
            // 6.1 No se encontró: Este es el error 404 que le decimos al frontend.
            // El frontend (login.vue) está programado para entender este error.
            return res.status(404).json({
                error: 'Usuario no encontrado',
                message: 'No se encontró un usuario con ese ID. Por favor, regístrate.'
            });
        }

        // Sí se encontró: Devolver los datos del usuario (ej. { nombre, rol, ... }).
        const usuario = rows[0];
        res.json(usuario);

    } catch (error) {
        // Manejo de errores.
        console.error("Error en POST /api/auth/login:", error.message);
        res.status(500).json({ 
            error: 'Error interno del servidor', 
            message: error.message 
        });
    }
});


// Exportación 
// 'module.exports' es la forma en que Node.js "publica" este router
// para que 'server.js' pueda importarlo y usarlo (con 'require').
module.exports = router;