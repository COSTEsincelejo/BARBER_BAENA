const pool = require("../db");

// Listar todos los servicios activos (usados para armar la cotización)
async function listar(req, res) {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM servicios WHERE activo = TRUE ORDER BY nombre"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar servicios" });
  }
}

// Crear un nuevo servicio
async function crear(req, res) {
  const { nombre, precio, duracion_min } = req.body;
  if (!nombre || precio == null) {
    return res.status(400).json({ error: "nombre y precio son requeridos" });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO servicios (nombre, precio, duracion_min) VALUES ($1, $2, $3) RETURNING *`,
      [nombre, precio, duracion_min || 30]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear servicio" });
  }
}

/** @deprecated Preferir POST /api/cotizaciones/preview o POST /api/cotizaciones */
async function cotizar(req, res) {
  const { servicio_ids } = req.body;
  if (!Array.isArray(servicio_ids) || servicio_ids.length === 0) {
    return res.status(400).json({ error: "servicio_ids debe ser un arreglo no vacío" });
  }
  try {
    const { rows } = await pool.query(
      `SELECT * FROM servicios WHERE id = ANY($1::int[]) AND activo = TRUE`,
      [servicio_ids]
    );
    const total = rows.reduce((acc, s) => acc + Number(s.precio), 0);
    const duracion_total = rows.reduce((acc, s) => acc + Number(s.duracion_min), 0);
    res.json({ servicios: rows, total, duracion_total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al calcular la cotización" });
  }
}

async function eliminar(req, res) {
  const { id } = req.params;
  try {
    await pool.query("UPDATE servicios SET activo = FALSE WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar servicio" });
  }
}

module.exports = { listar, crear, cotizar, eliminar };
