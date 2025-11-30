const admin = require('firebase-admin');
const db = require("../db");

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT); // Credenciales de firebase por variables de entorno

// Inicializar firebase
if (!admin.apps.length){
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })
}

// Objetos para evitar magic strings
const dominios = {
    alu: "alu.unach.cl",
    profesor: "unach.cl",
    admin: "unach.cl"
}

const db_rol = {
    alu: "alumno",
    pro: "profesor",
    adm: "admin"
}

// Mensajes de autenticación y errores
const msg_auth = {
    authTrue: "Autenticado",
    authFalse: "No autenticado",
    authError: "Error al autenticar",
    authFirst: "Primer inicio de sesion",
}

// Consultas
// Obtener un usuario de la base de datos
const userQuery = "SELECT * FROM Usuario WHERE ID_Usuario = ?"; 
// Insertar un usuario en la base de datos aun sin rut
const insertarUsuarioSQL = "INSERT INTO Usuario (ID_Usuario, nombre, correo, estado, rol) VALUES (?, ?, ?, ?, ?)"; 

// con userQuery obtener un usuario de la base de datos
async function obtenerUsuarioDeBD(uid){
    const [rows] = await db.query(userQuery, [uid]);

    if(!rows || rows.length === 0) {
        return null; 
    }
    return rows[0];
}

// con insertarUsuarioSQL insertar un usuario en la base de datos aun sin rut
async function insertarUsuarioDB(userInfo, rol){
    await db.query(insertarUsuarioSQL, [userInfo.uid, userInfo.usuario, userInfo.email, true, rol]);
}

// enviarRespuesta enviar una respuesta al cliente
function enviarRespuesta(userInfo, rol, msg, res) {
    res.json({
        message: msg,
        usuario: userInfo.usuario,
        rol: rol,
        uid: userInfo.uid,
        token: userInfo.token,
    })
}

// con rolPorDominio obtener el rol de un usuario por su dominio de su correo
function rolPorDominio(email) {
    const dominio = email.split("@")[1];
    
    if(dominio === dominios.alu) return db_rol.alu;
    if(dominio === dominios.profesor) return db_rol.pro;
    // No se considera el rol admin, por seguridad debe ser asignado manualmente
    
    return null;
}

// Funcion principal
const loginGoogle = (req, res) => {
    const token = req.body.token;

    admin.auth().verifyIdToken(token)
    .then(async(decodedToken) => {

        // No está a nivel global para evitar que se mezcle con otro usuario si ambos iniciarion sesion al mismo tiempo
        let userInfo = {
            usuario: decodedToken.name,
            email: decodedToken.email,
            uid: decodedToken.uid,
            token: token,
            rol: null
        };

        const usuarioDB = await obtenerUsuarioDeBD(userInfo.uid);

        // si el usuario existe en la base de datos
        if(usuarioDB){
            userInfo.rol = usuarioDB.rol;        

            // si el usuario no tiene rol
            if (!userInfo.rol) {
                return res.status(403).json({ message: "Usuario registrado pero sin rol asignado." });
            }

            // si el usuario no tiene rut
            if (!usuarioDB.rut) {
                // el mensaje de primera vez para que el front envie al usuario al registro
                return enviarRespuesta(userInfo, userInfo.rol, msg_auth.authFirst, res); 
            }

            // si existe y tiene rut
            return enviarRespuesta(userInfo, userInfo.rol, msg_auth.authTrue, res);
        } 
        
        // si el usuario no existe en la base de datos
        else {
            // se deduce el rol segun el dominio del correo
            const rolInicial = rolPorDominio(userInfo.email);

            // si el correo no tiene dominio permitido alu.unach.cl o unach.cl
            if (!rolInicial) {
                return res.status(403).json({ message: "Dominio de correo no permitido para registro." });
            }

            // se asigna el rol al usuario
            userInfo.rol = rolInicial;

            // se inserta el usuario en la base de datos y se envia el mensaje de primera vez
            await insertarUsuarioDB(userInfo, userInfo.rol);
            return enviarRespuesta(userInfo, userInfo.rol, msg_auth.authFirst, res);
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(401).json({
            message: "No autenticado",
            error: error.message
        });
    });
}

module.exports = { loginGoogle }