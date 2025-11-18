

// Busca un archivo llamado '.env' en la raíz y carga sus valores.
require('dotenv').config(); 


const dbConfig = {
    // La dirección del servidor de BD
    host: process.env.DB_HOST,
    
    // El usuario de MySQL
    user: process.env.DB_USER, 
    
    password: process.env.DB_PASSWORD, 
    
    // El nombre de la base de datos
    database: process.env.DB_NAME,
};


module.exports = dbConfig;