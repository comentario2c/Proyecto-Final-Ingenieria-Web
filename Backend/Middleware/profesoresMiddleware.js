const db = require("../db"); 

const profesoresMiddleware = async (req, res, next) => {
    const rutUsuario = req.body.rutUsuario;
    const idEquipo = req.body.idEquipo;

    const [rowsUsuario] = await db.query("SELECT * FROM Usuario WHERE rut = ?", [rutUsuario]);
    const [rowsEquipo] = await db.query("SELECT * FROM Equipos WHERE ID_Equipo = ?", [idEquipo]);

    // Validaciones para el usuario
    if (rowsUsuario.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado"});
    }

    if (rowsUsuario.length > 1) {
        return res.status(400).json({ error: "Usuario duplicado"});
    }

    // Validaciones para el equipo
    if (rowsEquipo.length === 0) {
        return res.status(404).json({ error: "Equipo no encontrado"});
    }

    if (rowsEquipo.length > 1) {
        return res.status(400).json({ error: "Equipo duplicado"});
    }

    next();
}

module.exports = profesoresMiddleware;
