const admin = require('firebase-admin');

const dominios = {
    alu: "alu.unach.cl",
    profesor: "unach.cl",
    admin: "unach.cl"
}

function verificarDominio(email){
    const dominio = email.split("@")[1];
    
    switch (true){
        case dominio === dominios.alu:
            return true;
        case dominio === dominios.profesor:
            return true;
        case dominio === dominios.admin:
            return true;
        default:
            return false;
    }
}

const authMiddleware = (req, res, next) => {
    const token = req.body.token;

    if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" })
    }


    admin.auth().verifyIdToken(token)
    .then((decodedToken) => {
        const email = decodedToken.email;

        if (verificarDominio(email)) {
            next();
        }else{
            return res.status(401).json({ message: "Por favor, utilice su cuenta institucional para iniciar sesion"})
        }
    })
    .catch((error) => {
        res.status(401).json({ message: "Token invalido" });
    })
}

module.exports = { authMiddleware }