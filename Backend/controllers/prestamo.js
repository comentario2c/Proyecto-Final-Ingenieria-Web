const db = require("../db");
// query para insertar prestamo
const insertarPrestamo = "INSERT INTO Prestamos (ID_Usuario, ID_Equipo, fechaPrestamo) VALUES (?, ?, NOW())";
const traerIdUsuario = "SELECT ID_Usuario FROM usuario WHERE rut = ?";

const registrarPrestamo = async (req, res) => {
    let { rutUsuario, idEquipo } = req.body;
    idEquipo = String(idEquipo);
    const [rows] = await db.query(traerIdUsuario, [rutUsuario]);
    const idUsuario = rows[0].ID_Usuario;

    try {
        const [result] = await db.query(insertarPrestamo, [idUsuario, idEquipo]);
        res.json({ message: 'Prestamo registrado correctamente' });
    } catch (error) {
        console.error('Error al registrar prestamo:', error);
        res.status(500).json({ error: 'Error al registrar prestamo' });
    }
};
module.exports = { registrarPrestamo };