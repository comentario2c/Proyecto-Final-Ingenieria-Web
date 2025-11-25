const db = require("../db");

const profesoresMiddleware = async (req, res, next) => {
    const { rutUsuario, idEquipo } = req.body;

    // Validación de datos recibidos
    if (!rutUsuario || !idEquipo) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    try {
        const [rowsUsuario] = await db.query("SELECT * FROM Usuario WHERE rut = ?", [rutUsuario]);
        const [rowsEquipo] = await db.query("SELECT * FROM Equipos WHERE ID_Equipo = ?", [idEquipo]);
        const [rowsPrestamo] = await db.query("SELECT * FROM Prestamos WHERE ID_Equipo = ? AND fechaEntrega is NULL AND fechaPrestamo is not NULL", idEquipo)

        // Validaciones para el usuario
        if (rowsUsuario.length === 0) {
            return res.status(404).json({ error: "No se encontró el usuario con el rut proporcionado" });
        }

        // Validacion para verificar si el usuario se encuentra duplicado
        // (No deberia porque al crear el usuario el ID_Usuario es clave primaria)
        if (rowsUsuario.length > 1) {
            return res.status(400).json({ error: "Existen 2 o mas usuarios con el mismo ID_Usuario" });
        }

        // Validaciones para el equipo
        if (rowsEquipo.length === 0) {
            return res.status(404).json({ error: "No se encontró el equipo con el ID_Equipo proporcionado" });
        }

        // Validacion para verificar si el equipo se encuentra duplicado
        // (No deberia porque al crear el equipo el ID_Equipo es clave primaria)
        if (rowsEquipo.length > 1) {
            return res.status(400).json({ error: "Existen 2 o mas equipos con el mismo ID_Equipo" });
        }

        // Validacion para verificar si el equipo se encuentra prestado
        if (rowsPrestamo.length > 0) {
            return res.status(400).json({ error: "Este equipo ya se encuentra prestado" });
        }

        next();
    } catch (error) {
        console.error("Error en middleware:", error);
        return res.status(500).json({ error: "Error al validar datos" });
    }
};

module.exports = profesoresMiddleware;