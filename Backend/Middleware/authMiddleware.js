const admin = require('firebase-admin');

const serviceAccount = require("../sdkFirebase.json"); // deberia de manejarse con variables de entorno

if (!admin.apps.length){
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })
}

const verificarToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Solo se buscan aquellos token que empiecen con Bearer (declaracion de token de acceso OAuth2.0)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado. Token faltante o inválido.' });
    }
    
    const idToken = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token expirado o inválido' });
    }
}

module.exports = verificarToken;