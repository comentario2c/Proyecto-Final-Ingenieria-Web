const db = require("../db");

const updateRegister = "UPDATE Usuario SET rut = ? WHERE ID_Usuario = ?";
// recordar hacer validacion de uid contra la decodificación del token
const completarRegistro = async (req, res) => {
    try {
        const { rut, uid } = req.body;
        const [result] = await db.query(updateRegister, [rut, uid]);

        if (result.affectedRows === 0) {
            return res.json({ success: false, error: "Usuario no encontrado" });
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false, error });
    }
};

module.exports = { completarRegistro };