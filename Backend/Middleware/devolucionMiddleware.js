const db = require("../db");

const devolucionMiddleware = async (req, res, next) => {
    try {
        const { idDevolucion } = req.body;

        if (idDevolucion === null || idDevolucion === undefined){
            return res.status(400).json({error: "Faltan datos requeridos"})
        }

        // se podría validar el idDevolución si cumple el formato segun una expresion regular
        
        const equipoDevuelto = "SELECT ID_Prestamo FROM Prestamos WHERE ID_Equipo = ? AND fechaEntrega IS NULL";
        const [rows] = await db.query(equipoDevuelto, [idDevolucion]);
        if (rows.length === 0){
            return res.status(400).json({error: "No se encontro el prestamo o el equipo ya fue devuelto"})
        }

        next();
    } catch (error){
        console.error("Error en middleware:", error);
        return res.status(500).json({error: "Error al validar datos"})
    }
}

module.exports = devolucionMiddleware;