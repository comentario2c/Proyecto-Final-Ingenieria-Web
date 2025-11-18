// 'express' es el framework para crear el servidor web (nuestro backend)
const express = require('express');
// 'cors' es un middleware (un "guardia") que permite que nuestro frontend (en localhost:5173)
// se comunique con nuestro backend (en localhost:3000) sin ser bloqueado por el navegador.
const cors = require('cors');
// 'mysql2/promise' es el "conductor" (driver) que nos permite hablar con la base de datos MySQL
// usando 'async/await' (la versión moderna).
const mysql = require('mysql2/promise');

// Flujo General del Codigo
// Este archivo es el "cerebro" principal de todo el Backend.
// Es el punto de entrada que 'npm run dev' (nodemon) ejecuta.
// 1. El servidor se inicia.
// 2. Carga todas las librerías necesarias (Express, Cors, MySQL).
// 3. Aplica los 'Middlewares' (son "capas" que se aplican a TODAS las peticiones):
//    - 'cors()' para permitir la conexión con el frontend (Vue).
//    - 'express.json()' para poder entender los datos JSON que envía el frontend (ej. en el login).
// 4. Define las "grandes rutas" o "secciones" de la API (ej. /api/prestamos, /api/auth).
//    - Le dice a Express: "Si llega una petición a /api/prestamos,
//      búscala en el archivo 'router/prestamos.js' para que la maneje".
//    - "Si llega una petición a /api/auth, búscala en 'router/auth.js'".
// 5. El servidor se pone a "escuchar" en el puerto 3000 (app.listen).
// 6. Como prueba, intenta conectarse a la base de datos MySQL una vez
//    para verificar que la contraseña y el nombre de la DB estén correctos.

// Configuración Inicial
// 'app' es la instancia principal de nuestro servidor Express.
const app = express();
// Define el puerto donde "escuchará" el servidor. Usará 3000 por defecto.
const port = process.env.PORT || 3000; 

// 3. Middlewares
// 'app.use' se usa para aplicar estas "capas" a todas las peticiones que lleguen.
// Habilita CORS para permitir que Vue (frontend) hable con este servidor (backend).
app.use(cors()); 
// Permite que Express entienda el formato JSON en el cuerpo (body) de las peticiones POST y PUT.
app.use(express.json()); // (Nota: Solo necesitas esta línea una vez)

// Configuración de la Conexión a la Base de Datos
// 'dbConfig' es un objeto que guarda las "llaves" de nuestra base de datos.
// Los archivos de rutas (auth.js, prestamos.js) importarán esta misma configuración.
const dbConfig = {
    host: 'localhost',
    user: 'root', 
    password: '212833967',   
    database: 'prestamos' 
};

// Importación y Uso de Rutas (El "Índice" de la API) 
// Este es el "índice" que le dice a Express qué hacer con cada URL.

// Importa el archivo que maneja la lógica de los préstamos.
const prestamosRoutes = require('./router/prestamos');
// Le dice a Express: "Cualquier petición que empiece con '/api/prestamos',
// re-dirígela al archivo 'prestamosRoutes' para que él la maneje".
app.use('/api/prestamos', prestamosRoutes);

// Importa el archivo que maneja la lógica de autenticación (login/register).
const authRoutes = require('./router/auth');
// Le dice a Express: "Cualquier petición que empiece con '/api/auth',
// re-dirígela al archivo 'authRoutes'".
app.use('/api/auth', authRoutes);

// Ruta de Prueba 
// Esta es una ruta simple para verificar que el servidor está vivo.
// Si visitas 'http://localhost:3000/' en tu navegador, verás este JSON.
app.get('/', (req, res) => {
    res.json({ message: '¡El servidor API está funcionando!' });
});

// Iniciar el Servidor 
// 'app.listen' enciende el servidor y lo pone a "escuchar"
// peticiones en el puerto que definimos (3000).
app.listen(port, () => {
    // Esto se muestra en tu terminal (Nodemon) cuando el servidor arranca.
    console.log(`Servidor corriendo en http://localhost:${port}`);
    
    // Prueba de Conexión a la BD
    // Intenta conectarse a MySQL solo una vez al arrancar.
    mysql.createConnection(dbConfig)
        .then(connection => {
            // Si tiene éxito, lo muestra en la consola.
            console.log('Conectado exitosamente a la base de datos "prestamos"');
            // Cierra esta conexión de prueba (no la mantiene abierta).
            connection.end(); 
        })
        .catch(error => {
            // Si falla (ej. contraseña incorrecta), muestra el error.
            console.error('Error al conectar a la base de datos:', error.message);
        });
});