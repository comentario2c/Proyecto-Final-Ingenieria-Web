const admin = require("firebase-admin");

// middleware para verificar el token y el uid
const registerMiddleware = async (req, res, next) => {
    const { uid, token } = req.body;
    let { rut } = req.body; // no es constante porque debe de pasar por una expresión regular mas adelante

    if (!rut) {
        return res.status(400).json({ message: "El campo RUT es obligatorio" });
    }

    // suponiendo que los ruts que contienen K fueron escritos en mayusculas en la credencial
    // pasa por la expresión regular haciendo la K mayuscula
    const rutLimpio = rut.replace(/[\.\-]/g, "").toUpperCase();
    const rutRegular = /^[0-9]{7,8}[0-9K]$/;

    // si el rut no cumple con la expresión regular
    if (!rutRegular.test(rutLimpio)) {
        return res.status(400).json({ 
            message: "Formato de RUT inválido. Ejemplo aceptado: 123456789" 
        });
    }
    
    // si el rut cumple con la expresión regular se actualiza el rut
    req.body.rut = rutLimpio;

    try {
        // se decodifica el token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // si el uid del token no coincide con el uid del body
        if (decodedToken.uid !== uid) {
            return res.status(403).json({ message: "Discrepancia de identidad (UID mismatch)" });
        }

        next(); // si todo esta bien avanza al controlador
    } catch (error) {
        console.error("Error en middleware de auth:", error.code || error.message);
        return res.status(401).json({ message: "Sesión inválida o expirada" });
    }
};

module.exports = registerMiddleware;