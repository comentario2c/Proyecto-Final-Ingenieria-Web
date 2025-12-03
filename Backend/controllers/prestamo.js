const db = require("../db");
// query para insertar prestamo
const insertarPrestamo = "INSERT INTO Prestamos (ID_Usuario, ID_Equipo, fechaPrestamo, estado) VALUES (?, ?, NOW(), 'activo')";
const traerIdUsuario = "SELECT ID_Usuario FROM usuario WHERE rut = ?";
const updateEquipo = "UPDATE equipos SET estado = 'En uso' WHERE ID_Equipo = ?";

const registrarPrestamo = async (req, res) => {
    let { rutUsuario, idEquipo } = req.body;
    idEquipo = String(idEquipo);
    const [rows] = await db.query(traerIdUsuario, [rutUsuario]);
    const idUsuario = rows[0].ID_Usuario;

    try {
        const [result] = await db.query(insertarPrestamo, [idUsuario, idEquipo]);
        if (result === 0){
            res.json({ message: 'Error al registrar prestamo' });
            return;
        }
        // marcar el estado del equipo a en uso
        await db.query(updateEquipo, [idEquipo]);
        res.json({ message: 'Prestamo registrado correctamente' });
    } catch (error) {
        console.error('Error al registrar prestamo:', error);
        res.status(500).json({ error: 'Error al registrar prestamo' });
    }
};
module.exports = { registrarPrestamo };