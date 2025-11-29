const db = require("../db");

// Así, aunque busquemos en prestamos, nos traemos los datos del equipo asociado.
const seleccionarPrestamos = `
    SELECT 
        Prestamos.ID_Prestamo,
        Prestamos.fechaPrestamo,
        Prestamos.estado,
        Equipos.modelo,
        Equipos.numeroSerie
    FROM Prestamos
    LEFT JOIN Equipos ON Prestamos.ID_Equipo = Equipos.ID_Equipo
    WHERE Prestamos.ID_Usuario = ?
`;

async function obtenerPrestamosPorUsuario(req, res) {
    const { id } = req.params; 

    try {
        console.log("Buscando préstamos extendidos para ID:", id);
        
        const [rows] = await db.query(seleccionarPrestamos, [id]);
        
        // Opcional: Imprimir en la consola del backend qué encontró para que tú lo veas
        console.log("Datos encontrados:", rows);

        res.json(rows);
    } catch (error) {
        console.error("Error al obtener préstamos del alumno:", error);
        res.status(500).json({ error: "Error al obtener los datos" });
    }
}

module.exports = { obtenerPrestamosPorUsuario };