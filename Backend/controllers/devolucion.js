const db = require("../db");

const equipoDevuelto = "SELECT ID_Prestamo FROM Prestamos WHERE ID_Equipo = ? AND fechaEntrega IS NULL";
const devolucionEquipo = "UPDATE prestamos SET fechaEntrega = NOW(), estado = 'finalizado' WHERE ID_Prestamo = ?";
const updateEquipo = "UPDATE equipos SET estado = 'Disponible' WHERE ID_Equipo = ?";


const devolverEquipo = async (req, res) => {
    try{
        const { idDevolucion } = req.body; // Hace referencia al id del equipo prestado
        
        // Pregunto a que id prestamo pertenece al equipo prestado
        const [rowsID_Prestamo] = await db.query(equipoDevuelto, [idDevolucion])
        const idPrestamo = rowsID_Prestamo[0].ID_Prestamo;
        
        // Actualizo el prestamo
        const [rowsUpdate] = await db.query(devolucionEquipo, [idPrestamo])
        
        // Manejar error si no se encontró el prestamo
        if (rowsUpdate.affectedRows === 0){
            return res.status(404).json({message: "No se encontro el prestamo"})
        }

        if (rowsUpdate.affectedRows === 1){
            return res.status(200).json({message: "Equipo devuelto correctamente"})
        }

        // Actualizar el estado a disponible luego de su devolución
        await db.query(updateEquipo, [idEquipo]);
        return res.status(500).json({message: "Error al devolver el equipo"})
        
    } catch (error) {
        res.json({ error: "Error al devolver el equipo" + error})
    }
}

module.exports = { devolverEquipo };