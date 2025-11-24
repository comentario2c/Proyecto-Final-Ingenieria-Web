const db = require("../db");

const fecha = new Date();

// query para insertar prestamo
const insertarPrestamo = "INSERT INTO Prestamos (rutUsuario, idEquipo, fechaPrestamo) VALUES (?, ?, ?)";

async function registrarPrestamo(req, res) {
    // recibir datos del frontend
    const rutUsuario = req.body.rutUsuario;
    const idEquipo = req.body.idEquipo;
    const fechaPrestamo = fecha.getFullYear() + "-" + fecha.getMonth() + "-" + fecha.getDate() + " " + fecha.getHours() + ":" + fecha.getMinutes() + ":" + fecha.getSeconds();

    // insertar prestamo
    const [rows] = await db.query(insertarPrestamo, [rutUsuario, idEquipo, fechaPrestamo]);

    // verificar si se inserto correctamente
    if (rows.affectedRows === 0) {
        return res.status(400).json({ error: "No se pudo registrar el prestamo" });
    }

    // retornar respuesta al frontend
    return res.status(200).json({ message: "Prestamo registrado correctamente" });
}

module.exports = { registrarPrestamo };