const admin = require("firebase-admin");

const registerMiddleware = (req, res, next) => {
    const { uid, token } = req.body;
    let rut = req.body.rut;
    
    const rutRegular = /^[0-9]{7,8}[0-9k]$/;
    rut = rut.toUpperCase();

    try {
        admin.auth().verifyIdToken(token).then((decodedToken) => {
            const uidToken = decodedToken.uid;
            if (uidToken !== uid) {
                return res.status(401).json({ message: "No has iniciado sesion correctamente" });
            }
            if (!rutRegular.test(rut)) {
                return res.status(400).json({ message: "El rut debe tener entre 7 y 8 digitos y un digito verificador, ejemplo: 123456789" });
            }
            next();
        }).catch((error) => {
            console.error(error);
            res.status(401).json({ message: "No has iniciado sesion correctamente" });
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "No has iniciado sesion correctamente" });
    }
};

module.exports = registerMiddleware;