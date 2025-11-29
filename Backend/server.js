// server.js (completo con CRUD Salas añadido)
// Manteniendo todo tu código existente intacto

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("=== INICIANDO BACKEND ===");
console.log("ENV DB_HOST:", process.env.DB_HOST);
console.log("ENV DB_USER:", process.env.DB_USER);
console.log("ENV DB_NAME:", process.env.DB_NAME);
console.log("ENV DB_PORT:", process.env.DB_PORT || 3306);

// ---------------------------------------------------
// Conexión (pool)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "prestamos",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Probar conexión una vez al inicio
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Conexión MySQL OK. ThreadId:", conn.threadId);
    conn.release();
  } catch (err) {
    console.error("❌ Error al conectar MySQL (detallado):", err && err.message ? err.message : err);
  }
})();

// ---------------------------------------------------
// Rutas Equipos (ya existentes, sin cambios)

// GET /api/equipos
app.get("/api/equipos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT ID_Equipo, modelo, numeroSerie, estado, nombreSala FROM Equipos");
    return res.json(rows);
  } catch (err) {
    console.error("Error SQL GET /api/equipos:", err);
    return res.status(500).json({ error: "Error obteniendo equipos", detail: err.message });
  }
});

// POST /api/equipos
app.post("/api/equipos", async (req, res) => {
  try {
    const { ID_Equipo, modelo, numeroSerie, estado, nombreSala } = req.body;
    if (!ID_Equipo || !modelo) {
      return res.status(400).json({ error: "Faltan campos obligatorios: ID_Equipo o modelo" });
    }
    const sql = `INSERT INTO Equipos (ID_Equipo, modelo, numeroSerie, estado, nombreSala) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [ID_Equipo, modelo, numeroSerie || null, estado || null, nombreSala || null]);
    return res.json({ message: "Equipo creado correctamente", affected: result.affectedRows });
  } catch (err) {
    console.error("Error SQL POST /api/equipos:", err);
    return res.status(500).json({ error: "Error creando equipo", detail: err.message });
  }
});

// PUT /api/equipos/:id
app.put("/api/equipos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { modelo, numeroSerie, estado, nombreSala } = req.body;
    const sql = `UPDATE Equipos SET modelo=?, numeroSerie=?, estado=?, nombreSala=? WHERE ID_Equipo=?`;
    const [result] = await pool.query(sql, [modelo, numeroSerie, estado, nombreSala, id]);
    return res.json({ message: "Equipo actualizado", affected: result.affectedRows });
  } catch (err) {
    console.error("Error SQL PUT /api/equipos/:id:", err);
    return res.status(500).json({ error: "Error actualizando equipo", detail: err.message });
  }
});

// DELETE /api/equipos/:id
app.delete("/api/equipos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const sql = `DELETE FROM Equipos WHERE ID_Equipo = ?`;
    const [result] = await pool.query(sql, [id]);
    return res.json({ message: "Equipo eliminado", affected: result.affectedRows });
  } catch (err) {
    console.error("Error SQL DELETE /api/equipos/:id:", err);
    return res.status(500).json({ error: "Error eliminando equipo", detail: err.message });
  }
});

// ---------------------------------------------------
// Rutas Salas (CRUD completo añadido)

// GET /api/salas
app.get("/api/salas", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT nombreSala, stockEquipos, descripcion FROM Sala");
    return res.json(rows);
  } catch (err) {
    console.error("Error SQL GET /api/salas:", err);
    return res.status(500).json({ error: "Error obteniendo salas", detail: err.message });
  }
});

// POST /api/salas
app.post("/api/salas", async (req, res) => {
  try {
    const { nombreSala, stockEquipos, descripcion } = req.body;
    const sql = `INSERT INTO Sala (nombreSala, stockEquipos, descripcion) VALUES (?, ?, ?)`;
    const [result] = await pool.query(sql, [nombreSala, stockEquipos || 0, descripcion || null]);
    return res.json({ message: "Sala creada", affected: result.affectedRows });
  } catch (err) {
    console.error("Error SQL POST /api/salas:", err);
    return res.status(500).json({ error: "Error creando sala", detail: err.message });
  }
});

// PUT /api/salas/:nombreSala
app.put("/api/salas/:nombreSala", async (req, res) => {
  try {
    const nombreSala = req.params.nombreSala;
    const { stockEquipos, descripcion } = req.body;
    const sql = `UPDATE Sala SET stockEquipos = ?, descripcion = ? WHERE nombreSala = ?`;
    const [result] = await pool.query(sql, [stockEquipos || 0, descripcion || null, nombreSala]);
    return res.json({ message: "Sala actualizada", affected: result.affectedRows });
  } catch (err) {
    console.error("Error SQL PUT /api/salas/:nombreSala:", err);
    return res.status(500).json({ error: "Error actualizando sala", detail: err.message });
  }
});

// DELETE /api/salas/:nombreSala
app.delete("/api/salas/:nombreSala", async (req, res) => {
  try {
    const nombreSala = req.params.nombreSala;
    const sql = `DELETE FROM Sala WHERE nombreSala = ?`;
    const [result] = await pool.query(sql, [nombreSala]);
    return res.json({ message: "Sala eliminada", affected: result.affectedRows });
  } catch (err) {
    console.error("Error SQL DELETE /api/salas/:nombreSala:", err);
    return res.status(500).json({ error: "Error eliminando sala", detail: err.message });
  }
});

// Luciano
const authRoutes = require("./router/authRoutes");
app.use("/api/auth", authRoutes);

const prestamosRoutes = require("./router/prestamosRoutes");
app.use("/api/prestamos", prestamosRoutes);

const devolucionRoutes = require("./router/devolucionRoutes");
app.use("/api/devolucion", devolucionRoutes);

const registerRoutes = require("./router/registerRoutes");
app.use("/api/register", registerRoutes);
//-------------------Pepe--------------------------------

const prestamoAlumnoRouter = require('./router/prestamoAlumnoRouter');
app.use("/api/prestamoAlumno", prestamoAlumnoRouter);

// ---------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Server listening http://localhost:${PORT}`));
