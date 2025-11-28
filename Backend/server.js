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

// ==========================================
// 📌 CRUD SALAS
// ==========================================

// Listar salas
app.get("/api/salas", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM sala");
  res.json(rows);
});

// Crear sala
app.post("/api/salas", async (req, res) => {
  try {
    const { nombreSala, stockEquipos, descripcion, activo } = req.body;
    const activoFinal = activo !== undefined ? activo : 1;

    await pool.query(
      "INSERT INTO sala (nombreSala, stockEquipos, descripcion, activo) VALUES (?, ?, ?, ?)",
      [nombreSala, stockEquipos, descripcion, activo]
    );

    res.json({ message: "Sala creada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error creando sala", detail: err.message });
  }
});

// Actualizar sala
app.put("/api/salas/:nombreSala", async (req, res) => {
  try {
    const id = req.params.nombreSala;
    const { stockEquipos, descripcion, activo } = req.body;

    const [result] = await pool.query(
      "UPDATE sala SET stockEquipos=?, descripcion=?, activo=? WHERE nombreSala=?",
      [stockEquipos, descripcion, activo, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Sala no encontrada" });

    res.json({ message: "Sala actualizada" });
  } catch (err) {
    res.status(500).json({ error: "Error actualizando sala", detail: err.message });
  }
});

// ELIMINAR sala + equipos asociados (robusto)
app.delete("/api/salas/:nombreSala", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const nombreSala = decodeURIComponent(req.params.nombreSala).trim();

    await connection.beginTransaction();

    // 1) Obtener los equipos de esa sala
    const [equipos] = await connection.query(
      "SELECT ID_Equipo FROM equipos WHERE TRIM(nombreSala) = ?",
      [nombreSala]
    );

    // 2) Eliminar préstamos asociados a esos equipos
    if (equipos.length > 0) {
      const ids = equipos.map(e => e.ID_Equipo);

      await connection.query(
        `DELETE FROM prestamos WHERE ID_Equipo IN (${ids.map(() => "?").join(",")})`,
        ids
      );
    }

    // 3) Eliminar los equipos de la sala
    await connection.query(
      "DELETE FROM equipos WHERE TRIM(nombreSala) = ?",
      [nombreSala]
    );

    // 4) Eliminar la sala
    const [result] = await connection.query(
      "DELETE FROM sala WHERE TRIM(nombreSala) = ?",
      [nombreSala]
    );

    await connection.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Sala no encontrada" });
    }

    res.json({
      message: `Sala '${nombreSala}' eliminada junto con sus equipos y préstamos asociados.`
    });

  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: "Error eliminando sala", detail: err.message });
  } finally {
    connection.release();
  }
});


// ==========================================
// 📌 CRUD EQUIPOS
// ==========================================

// Listar equipos
app.get("/api/equipos", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM equipos");
  res.json(rows);
});

// Crear equipo
app.post("/api/equipos", async (req, res) => {
  try {
    const { ID_Equipo, modelo, numeroSerie, estado, nombreSala, activo } = req.body;

    await pool.query(
      "INSERT INTO equipos (ID_Equipo, modelo, numeroSerie, estado, nombreSala, activo) VALUES (?, ?, ?, ?, ?, ?)",
      [ID_Equipo, modelo, numeroSerie, estado, nombreSala, activo]
    );

    res.json({ message: "Equipo creado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error creando equipo", detail: err.message });
  }
});

// Actualizar equipo
app.put("/api/equipos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { modelo, numeroSerie, estado, nombreSala, activo } = req.body;

    const [result] = await pool.query(
      "UPDATE equipos SET modelo=?, numeroSerie=?, estado=?, nombreSala=?, activo=? WHERE ID_Equipo=?",
      [modelo, numeroSerie, estado, nombreSala, activo, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Equipo no encontrado" });

    res.json({ message: "Equipo actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error actualizando equipo", detail: err.message });
  }
});

// ELIMINAR equipo
app.delete("/api/equipos/:id", async (req, res) => {
  const connection = await pool.getConnection();
  const id = req.params.id;

  try {
    await connection.beginTransaction();

    // 1) Verificar si tiene préstamos ACTIVOS
    const [[prestamoActivo]] = await connection.query(
      "SELECT COUNT(*) AS total FROM prestamos WHERE ID_Equipo = ? AND estado = 'activo'",
      [id]
    );

    if (prestamoActivo.total > 0) {
      await connection.rollback();
      return res.status(400).json({
        error: "Este equipo tiene un préstamo ACTIVO",
        message: "No se puede eliminar un equipo que está en uso."
      });
    }

    // 2) Eliminar préstamos finalizados/asociados
    await connection.query(
      "DELETE FROM prestamos WHERE ID_Equipo = ?",
      [id]
    );

    // 3) Eliminar el equipo
    const [result] = await connection.query(
      "DELETE FROM equipos WHERE ID_Equipo = ?",
      [id]
    );

    await connection.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    res.json({
      message: `Equipo ${id} eliminado correctamente (no tenía préstamos activos).`,
    });

  } catch (err) {
    await connection.rollback();
    res.status(500).json({
      error: "Error eliminando equipo",
      detail: err.message
    });
  } finally {
    connection.release();
  }
});

// ==========================================
// 📌 CRUD PRESTAMOS
// ==========================================

app.get("/api/prestamos", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM prestamos");
  res.json(rows);
});


// ==========================================
// 📌 DASHBOARD
// ==========================================

// Total equipos registrados
app.get("/dashboard/equipos-registrados", async (req, res) => {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM equipos");
  res.json(rows[0]);
});

// Total salas registradas
app.get("/dashboard/salas-registradas", async (req, res) => {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM sala");
  res.json(rows[0]);
});

// Prestamos activos
app.get("/dashboard/prestamos-activos", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM prestamos WHERE estado = 'activo'"
  );
  res.json(rows[0]);
});

// Prestamos atrasados
app.get("/dashboard/prestamos-atrasados", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT COUNT(*) AS total
    FROM prestamos p
    JOIN equipos e ON p.ID_Equipo = e.ID_Equipo
    WHERE p.estado = 'activo'
      AND e.estado = 'En uso'
      AND p.fechaEntrega < NOW()
  `);

  res.json(rows[0]);
});

// Equipos por estado
app.get("/dashboard/equipos-estado", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT estado, COUNT(*) AS cantidad
    FROM equipos
    GROUP BY estado
  `);

  res.json(rows);
});

// ==========================================
// 📌 DASHBOARD GENERAL (la que usa tu frontend)
// ==========================================
app.get("/api/dashboard", async (req, res) => {
  try {
    const [[totalEquipos]] = await pool.query(
      "SELECT COUNT(*) AS total FROM equipos"
    );

    const [[totalSalas]] = await pool.query(
      "SELECT COUNT(*) AS total FROM sala"
    );

    const [[prestamosActivos]] = await pool.query(
      "SELECT COUNT(*) AS total FROM prestamos WHERE estado = 'activo'"
    );

    const [[prestamosAtrasados]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM prestamos p
      JOIN equipos e ON p.ID_Equipo = e.ID_Equipo
      WHERE p.estado = 'activo'
        AND e.estado = 'En uso'
        AND p.fechaEntrega < NOW()
    `);

    res.json({
      totalEquipos: totalEquipos.total,
      totalSalas: totalSalas.total,
      prestamosActivos: prestamosActivos.total,
      prestamosAtrasados: prestamosAtrasados.total
    });

  } catch (err) {
    res.status(500).json({
      error: "Error cargando datos del dashboard",
      detail: err.message
    });
  }
});




// ==========================================
// 📌 ALERTAS DEL DASHBOARD
// ==========================================
app.get("/api/dashboard/alertas", async (req, res) => {
  try {

    // Equipos en mantenimiento
    const [[maint]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM equipos
      WHERE estado = 'En mantenimiento'
    `);

    // Salas sin equipos
    const [[salasVacias]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM sala s
      LEFT JOIN equipos e ON s.nombreSala = e.nombreSala
      WHERE e.ID_Equipo IS NULL
    `);

    res.json({
      equiposMantenimiento: maint.total,
      salasSinEquipos: salasVacias.total
    });

  } catch (err) {
    res.status(500).json({
      error: "Error obteniendo alertas",
      detail: err.message
    });
  }
});



// ==========================================
// 🚀 INICIAR SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor backend corriendo en puerto ${PORT}`));