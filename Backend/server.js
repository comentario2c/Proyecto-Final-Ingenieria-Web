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
  ssl:{
    rejectUnauthorized: false
  }
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
// 📌 ENDPOINTS MEJORADOS (RUTAS ESPECÍFICAS PRIMERO)
// ==========================================

// Endpoint para mover equipos (DEBE IR PRIMERO)
app.put("/api/salas/mover-equipos-mejorado", async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { salaOrigen, salaDestino } = req.body;

    console.log(" Moviendo equipos:", { salaOrigen, salaDestino });

    // Validaciones básicas
    if (!salaOrigen || !salaDestino) {
      return res.status(400).json({
        success: false,
        message: 'salaOrigen y salaDestino son requeridos'
      });
    }

    const salaOrigenClean = salaOrigen.trim();
    const salaDestinoClean = salaDestino.trim();

    if (salaOrigenClean === salaDestinoClean) {
      return res.status(400).json({
        success: false,
        message: 'salaOrigen y salaDestino deben ser diferentes'
      });
    }

    await connection.beginTransaction();

    // 1. Verificar que ambas salas existan
    const [salas] = await connection.execute(
      'SELECT nombreSala, activo FROM sala WHERE nombreSala IN (?, ?)',
      [salaOrigenClean, salaDestinoClean]
    );

    console.log("🔍 Salas encontradas:", salas);

    const salaOrigenData = salas.find(s => s.nombreSala === salaOrigenClean);
    const salaDestinoData = salas.find(s => s.nombreSala === salaDestinoClean);

    if (!salaOrigenData || salaOrigenData.activo === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: `La sala origen "${salaOrigenClean}" no existe o no está activa`
      });
    }

    if (!salaDestinoData || salaDestinoData.activo === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: `La sala destino "${salaDestinoClean}" no existe o no está activa`
      });
    }

    // 2. Verificar que no haya equipos con préstamos activos en la sala origen
    const [equiposConPrestamos] = await connection.execute(
      `SELECT COUNT(*) as total 
       FROM equipos e 
       INNER JOIN prestamos p ON e.ID_Equipo = p.ID_Equipo 
       WHERE e.nombreSala = ? 
       AND e.activo = 1 
       AND p.estado = 'activo'`,
      [salaOrigenClean]
    );

    console.log("🔍 Equipos con préstamos activos:", equiposConPrestamos[0].total);

    if (equiposConPrestamos[0].total > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `No se pueden mover equipos: existen ${equiposConPrestamos[0].total} equipos con préstamos activos en la sala origen`
      });
    }

    // 3. Contar equipos en sala origen antes de mover
    const [equiposCount] = await connection.execute(
      'SELECT COUNT(*) as total FROM equipos WHERE nombreSala = ? AND activo = 1',
      [salaOrigenClean]
    );

    const totalEquipos = equiposCount[0].total;
    console.log("🔍 Total equipos a mover:", totalEquipos);

    if (totalEquipos === 0) {
      await connection.rollback();
      return res.status(200).json({
        success: true,
        message: `No hay equipos para mover en la sala ${salaOrigenClean}`,
        equiposMovidos: 0
      });
    }

    // 4. Mover los equipos
    const [result] = await connection.execute(
      'UPDATE equipos SET nombreSala = ? WHERE nombreSala = ? AND activo = 1',
      [salaDestinoClean, salaOrigenClean]
    );

    console.log("✅ Equipos movidos:", result.affectedRows);

    await connection.commit();

    res.json({
      success: true,
      message: `Se movieron ${result.affectedRows} equipos de ${salaOrigenClean} a ${salaDestinoClean}`,
      equiposMovidos: result.affectedRows,
      salaOrigen: salaOrigenClean,
      salaDestino: salaDestinoClean
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error moviendo equipos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al mover equipos',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Endpoint para obtener salas disponibles - ACTUALIZADO
app.get("/api/salas-disponibles", async (req, res) => {
  try {
    const excluirSala = req.query.excluir;
    
    console.log("🔍 Obteniendo salas disponibles, excluyendo:", excluirSala);

    let query = `
      SELECT 
        s.nombreSala,
        s.stockEquipos as stockSugerido,
        COUNT(e.ID_Equipo) as stockReal
      FROM sala s
      LEFT JOIN equipos e ON s.nombreSala = e.nombreSala AND e.activo = 1
      WHERE s.activo = 1
    `;
    
    let params = [];

    if (excluirSala) {
      query += " AND s.nombreSala != ?";
      params.push(excluirSala);
    }

    query += " GROUP BY s.nombreSala, s.stockEquipos ORDER BY s.nombreSala";

    const [salas] = await pool.execute(query, params);
    
    console.log("✅ Salas disponibles encontradas:", salas.length);
    
    res.json({
      success: true,
      data: salas
    });

  } catch (error) {
    console.error('❌ Error obteniendo salas disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
  });
  }
});

// ==========================================
// 📌 ENDPOINTS PARA MOVER CANTIDAD ESPECÍFICA
// ==========================================

// Obtener cantidad de equipos por sala
app.get("/api/equipos-por-sala/:nombreSala", async (req, res) => {
  try {
    const nombreSala = req.params.nombreSala;
    
    const [result] = await pool.execute(
      'SELECT COUNT(*) as total FROM equipos WHERE nombreSala = ? AND activo = 1',
      [nombreSala]
    );
    
    res.json({
      success: true,
      total: result[0].total
    });
    
  } catch (error) {
    console.error('Error contando equipos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Mover cantidad específica de equipos - SOLUCIÓN DEFINITIVA
app.put("/api/salas/mover-equipos-cantidad", async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { salaOrigen, salaDestino, cantidad } = req.body;

    console.log("📦 Moviendo equipos (cantidad específica):", { salaOrigen, salaDestino, cantidad });

    // Validaciones
    if (!salaOrigen || !salaDestino || !cantidad) {
      return res.status(400).json({
        success: false,
        message: 'salaOrigen, salaDestino y cantidad son requeridos'
      });
    }

    // Convertir cantidad a número
    const cantidadNumero = parseInt(cantidad);
    
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser un número mayor a 0'
      });
    }

    const salaOrigenClean = salaOrigen.trim();
    const salaDestinoClean = salaDestino.trim();

    if (salaOrigenClean === salaDestinoClean) {
      return res.status(400).json({
        success: false,
        message: 'salaOrigen y salaDestino deben ser diferentes'
      });
    }

    await connection.beginTransaction();

    // 1. Verificar salas
    const [salas] = await connection.execute(
      'SELECT nombreSala, activo FROM sala WHERE nombreSala IN (?, ?)',
      [salaOrigenClean, salaDestinoClean]
    );

    const salaOrigenData = salas.find(s => s.nombreSala === salaOrigenClean);
    const salaDestinoData = salas.find(s => s.nombreSala === salaDestinoClean);

    if (!salaOrigenData || salaOrigenData.activo === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: `La sala origen "${salaOrigenClean}" no existe o no está activa`
      });
    }

    if (!salaDestinoData || salaDestinoData.activo === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: `La sala destino "${salaDestinoClean}" no existe o no está activa`
      });
    }

    // 2. Verificar equipos disponibles en sala origen
    const [equiposCount] = await connection.execute(
      'SELECT COUNT(*) as total FROM equipos WHERE nombreSala = ? AND activo = 1',
      [salaOrigenClean]
    );

    const totalEquipos = equiposCount[0].total;

    if (totalEquipos === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `No hay equipos para mover en la sala ${salaOrigenClean}`
      });
    }

    if (cantidadNumero > totalEquipos) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Solo hay ${totalEquipos} equipos disponibles, no se pueden mover ${cantidadNumero}`
      });
    }

    // 3. Verificar que no haya equipos con préstamos activos
    const [equiposConPrestamos] = await connection.execute(
      `SELECT COUNT(*) as total 
       FROM equipos e 
       INNER JOIN prestamos p ON e.ID_Equipo = p.ID_Equipo 
       WHERE e.nombreSala = ? 
       AND e.activo = 1 
       AND p.estado = 'activo'`,
      [salaOrigenClean]
    );

    if (equiposConPrestamos[0].total > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `No se pueden mover equipos: existen ${equiposConPrestamos[0].total} equipos con préstamos activos`
      });
    }

    // 4. SOLUCIÓN DEFINITIVA: Usar consulta directa sin prepared statements para LIMIT
    // Primero obtener los IDs de los equipos a mover usando consulta directa
    const [equiposAMover] = await connection.query(
      `SELECT ID_Equipo FROM equipos WHERE nombreSala = '${salaOrigenClean}' AND activo = 1 LIMIT ${cantidadNumero}`
    );

    if (equiposAMover.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'No se encontraron equipos para mover'
      });
    }

    const idsEquipos = equiposAMover.map(equipo => equipo.ID_Equipo);
    const placeholders = idsEquipos.map(() => '?').join(',');

    // 5. Mover los equipos específicos por sus IDs (usando prepared statement seguro)
    const [result] = await connection.execute(
      `UPDATE equipos 
       SET nombreSala = ? 
       WHERE ID_Equipo IN (${placeholders}) 
       AND activo = 1`,
      [salaDestinoClean, ...idsEquipos]
    );

    console.log("✅ Equipos movidos (cantidad específica):", result.affectedRows);

    await connection.commit();

    res.json({
      success: true,
      message: `Se movieron ${result.affectedRows} equipos de ${salaOrigenClean} a ${salaDestinoClean}`,
      equiposMovidos: result.affectedRows,
      salaOrigen: salaOrigenClean,
      salaDestino: salaDestinoClean,
      cantidadSolicitada: cantidadNumero
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error moviendo equipos (cantidad):', error);
    
    // Mostrar el error completo para debug
    console.error('Error detallado:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al mover equipos',
      error: error.message
    });
  } finally {
    connection.release();
  }
});


// ==========================================
// 📌 CRUD SALAS
// ==========================================

// Listar salas - ACTUALIZADO con stockReal
app.get("/api/salas", async (req, res) => {
  try {
    const [salas] = await pool.execute(`
      SELECT 
        s.nombreSala,
        s.stockEquipos as stockSugerido,
        s.descripcion,
        s.activo,
        COUNT(e.ID_Equipo) as stockReal
      FROM sala s
      LEFT JOIN equipos e ON s.nombreSala = e.nombreSala AND e.activo = 1
      GROUP BY s.nombreSala, s.stockEquipos, s.descripcion, s.activo
    `);
    res.json(salas);
  } catch (error) {
    console.error('Error listando salas:', error);
    res.status(500).json({ error: "Error listando salas", detail: error.message });
  }
});

// Crear sala - SOLO stockSugerido
app.post("/api/salas", async (req, res) => {
  try {
    const { nombreSala, stockSugerido, descripcion, activo } = req.body;
    const activoFinal = activo !== undefined ? activo : 1;

    await pool.query(
      "INSERT INTO sala (nombreSala, stockEquipos, descripcion, activo) VALUES (?, ?, ?, ?)",
      [nombreSala, stockSugerido, descripcion, activoFinal]
    );

    res.json({ message: "Sala creada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error creando sala", detail: err.message });
  }
});

// Actualizar sala - SOLO stockSugerido
app.put("/api/salas/:nombreSala", async (req, res) => {
  try {
    const id = req.params.nombreSala;
    const { stockSugerido, descripcion, activo } = req.body;

    const [result] = await pool.query(
      "UPDATE sala SET stockEquipos=?, descripcion=?, activo=? WHERE nombreSala=?",
      [stockSugerido, descripcion, activo, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Sala no encontrada" });

    res.json({ message: "Sala actualizada" });
  } catch (err) {
    res.status(500).json({ error: "Error actualizando sala", detail: err.message });
  }
});

// Endpoint para verificar estado de eliminación (DEBE IR ANTES de las rutas generales)
app.get("/api/salas/:nombreSala/estado-eliminacion", async (req, res) => {
  try {
    const nombreSala = req.params.nombreSala;
    
    console.log("🔍 Verificando estado eliminación para:", nombreSala);

    // CORREGIDO: Quitar filtro activo para encontrar todas las salas
    const [sala] = await pool.execute(
      `SELECT 
          s.nombreSala,
          s.stockEquipos,
          s.activo,
          COUNT(e.ID_Equipo) as equipos_totales,
          COUNT(p.ID_Prestamo) as prestamos_activos
      FROM sala s
      LEFT JOIN equipos e ON s.nombreSala = e.nombreSala AND e.activo = 1
      LEFT JOIN prestamos p ON e.ID_Equipo = p.ID_Equipo AND p.estado = 'activo'
      WHERE s.nombreSala = ?
      GROUP BY s.nombreSala, s.stockEquipos, s.activo`,
      [nombreSala]
    );

    console.log("🔍 Resultado consulta estado:", sala);

    if (sala.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sala no encontrada en la base de datos'
      });
    }

    const estado = sala[0];
    
    // Verificar si la sala está activa
    if (estado.activo === 0) {
      return res.json({
        success: true,
        data: {
          nombreSala: estado.nombreSala,
          stockEquipos: estado.stockEquipos,
          equiposTotales: estado.equipos_totales,
          prestamosActivos: estado.prestamos_activos,
          activo: false,
          puedeEliminar: false,
          mensaje: 'La sala ya está eliminada (inactiva)'
        }
      });
    }

    const puedeEliminar = estado.stockEquipos === 0 && estado.prestamos_activos === 0;

    console.log("✅ Estado eliminación:", { 
      nombreSala: estado.nombreSala,
      stockEquipos: estado.stockEquipos,
      prestamosActivos: estado.prestamos_activos,
      puedeEliminar 
    });

    res.json({
      success: true,
      data: {
        nombreSala: estado.nombreSala,
        stockEquipos: estado.stockEquipos,
        equiposTotales: estado.equipos_totales,
        prestamosActivos: estado.prestamos_activos,
        activo: true,
        puedeEliminar: puedeEliminar,
        mensaje: puedeEliminar 
          ? 'La sala puede ser eliminada' 
          : `No se puede eliminar: ${estado.stockEquipos} equipos y ${estado.prestamos_activos} préstamos activos`
      }
    });

  } catch (error) {
    console.error('❌ Error verificando estado de sala:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
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
// 📌 ENDPOINTS DE DEBUG
// ==========================================

// Endpoint temporal para debug de equipos
app.get("/api/debug-equipos/:sala", async (req, res) => {
  try {
    const sala = req.params.sala;
    
    const [equipos] = await pool.execute(
      'SELECT ID_Equipo, modelo, estado, nombreSala FROM equipos WHERE nombreSala = ? AND activo = 1',
      [sala]
    );
    
    const [count] = await pool.execute(
      'SELECT COUNT(*) as total FROM equipos WHERE nombreSala = ? AND activo = 1',
      [sala]
    );
    
    res.json({
      success: true,
      sala: sala,
      totalEquipos: count[0].total,
      equipos: equipos
    });
    
  } catch (error) {
    console.error('Error en debug:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/api/debug-rutas", async (req, res) => {
  try {
    // Verificar conexión a BD
    const [salas] = await pool.execute("SELECT nombreSala FROM sala LIMIT 5");
    const [equipos] = await pool.execute("SELECT COUNT(*) as total FROM equipos");
    
    res.json({
      success: true,
      database: {
        salas: salas.length,
        equipos: equipos[0].total,
        salasSample: salas.map(s => s.nombreSala)
      },
      endpoints: {
        "mover-equipos": "PUT /api/salas/mover-equipos-mejorado",
        "mover-cantidad": "PUT /api/salas/mover-equipos-cantidad",
        "estado-eliminacion": "GET /api/salas/:nombreSala/estado-eliminacion", 
        "salas-disponibles": "GET /api/salas-disponibles",
        "debug-equipos": "GET /api/debug-equipos/:sala"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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
app.listen(PORT, () => console.log(`Servidor backend corriendo en puerto ${PORT}`));