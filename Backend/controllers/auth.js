const admin = require('firebase-admin');
const db = require("../db")

const serviceAccount = require("../sdkFirebase.json"); // deberia de manejarse con variables de entorno

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

const userInfo = {
    usuario: "",
    email: "",
    uid: "",
    token: "",
    rol: "" || null
}

const db_rol = {
    alu: "alumno",
    pro: "profesor",
    adm: "admin"
}

const msg_auth = {
    authTrue: "Autenticado",
    authFalse: "No autenticado",
    authError: "Error al autenticar",
    authFirst: "Primer inicio de sesion",
}

// Consultas
const userQuery = "SELECT * FROM Usuario WHERE ID_Usuario = ?"
const insertarUsuario = "INSERT INTO Usuario (ID_Usuario, nombre, correo, estado, rol) VALUES (?, ?, ?, ?, ?)"

// Funciones auxiliares
function consultarUsuario(uid){
    const rowsUsuario = db.query(userQuery, [uid]);

    if(rowsUsuario === 0){
        res.json({
            message: msg_auth.authFirst
        })
        return true;
    }

    if (rowsUsuario > 1) {
        res.json({
            message: msg_auth.authError
        })
        return false;
    }
    return true;
}

async function insertarUsuarioDB(rol){
    const result = await db.query(insertarUsuario, [userInfo.uid, userInfo.usuario, userInfo.email, true, rol]); 
    if (result === 0){
        res.json({
            message: msg_auth.authError
        })
        return;
    }
}

async function enviarRespuesta(rol, res) {
    res.json({
        message: msg_auth.authTrue,
        usuario: userInfo.usuario,
        rol: rol,
        uid: userInfo.uid,
        token: userInfo.token,
    })
}

// Funcion principal
const loginGoogle = (req, res) => {

    const token = req.body.token;

    try{
        admin.auth().verifyIdToken(token)
        .then((decodedToken) => {
            userInfo.usuario = decodedToken.name;
            userInfo.email = decodedToken.email;
            userInfo.uid = decodedToken.uid;
            userInfo.token = token;

            const dominio = userInfo.email.split("@")[1];

            switch (true){
                case dominio === dominios.alu:
                    userInfo.rol = db_rol.alu;
                    if (!consultarUsuario(userInfo.uid)) {
                        enviarRespuesta(userInfo.rol, res);
                    }
                    enviarRespuesta(userInfo.rol, res);
                    insertarUsuarioDB(userInfo.rol);
                    break;
                case dominio === dominios.profesor:
                    userInfo.rol = db_rol.pro;
                    if (!consultarUsuario(userInfo.uid)) {
                        enviarRespuesta(userInfo.rol, res);
                    }
                    enviarRespuesta(userInfo.rol, res);
                    insertarUsuarioDB(userInfo.rol);
                    break;
                case dominio === dominios.admin:
                    userInfo.rol = db_rol.adm;
                    if (!consultarUsuario(userInfo.uid)) {
                        enviarRespuesta(userInfo.rol, res);
                    }
                    enviarRespuesta(userInfo.rol, res);
                    insertarUsuarioDB(userInfo.rol);
                    break;
                default:
                    userInfo.rol = "";
                    break;
            }

            
        })
        .catch((error) => {
            console.log(error);
            res.json({
                message: "No autenticado",
                user: "",
                rol: "",
                uid: "",
                token: "",
                usuario: ""
            })
        })
    }catch(error){
        console.log(error);
    }
}

module.exports = { loginGoogle }