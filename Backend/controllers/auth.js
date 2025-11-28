const admin = require('firebase-admin');

const serviceAccount = require("../sdkFirebase.json"); // deberia de manejarse con variables de entorno

if (!admin.apps.length){
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })
}

const userInfo = {
    nombre: "",
    email: "",
    uid: "",
    token: "" 
}

const db_rol = {
    alu: "alumno",
    pro: "profesor",
    adm: "admin"
}

const loginGoogle = (req, res) => {

    const token = req.body.token;

    try{
        admin.auth().verifyIdToken(token)
        .then((decodedToken) => {
            userInfo.nombre = decodedToken.displayName;
            userInfo.email = decodedToken.email;
            userInfo.uid = decodedToken.uid;
            userInfo.token = token;

            res.json({
                message: "Autenticado",
                user: userInfo.nombre,
                rol: db_rol.alu,
                uid: userInfo.uid,
                token: userInfo.token,
                usuario: userInfo.usuario
            })
        })
        .catch((error) => {
            console.log(error);
            res.json({
                message: "No autenticado",
                user: "",
                rol: ""
            })
        })
    }catch(error){
        console.log(error);
    }
}

module.exports = { loginGoogle }