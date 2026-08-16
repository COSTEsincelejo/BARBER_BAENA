const pool = require("../db");

function tieneHora(valor) {
  return valor != null && String(valor).trim() !== "";
}

// Listar bloqueos, opcionalmente filtrados por rango desde/hasta
async function listar(req, res) {
  const { desde, hasta } = req.query;
  try {
    let query = "SELECT * FROM bloqueos WHERE 1=1";
    const params = [];
    if (desde) {
      params.push(desde);
      query += ` AND fecha >= $${params.length}`;
    }
    if (hasta) {
      params.push(hasta);
      query += ` AND fecha <= $${params.length}`;
    }
    query += " ORDER BY fecha, hora_inicio NULLS FIRST, id";
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar bloqueos" });
  }
}

// Crear bloqueo de día completo (horas null) o parcial (ambas horas)
async function crear(req, res) {
  const { fecha, hora_inicio, hora_fin, motivo } = req.body;
  if (!fecha) {
    return res.status(400).json({ error: "fecha es requerida" });
  }

  const inicio = tieneHora(hora_inicio);
  const fin = tieneHora(hora_fin);
  if (inicio !== fin) {
    return res.status(400).json({
      error: "hora_inicio y hora_fin deben enviarse juntas o ambas vacías (día completo)",
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO bloqueos (fecha, hora_inicio, hora_fin, motivo)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        fecha,
        inicio ? hora_inicio : null,
        fin ? hora_fin : null,
        motivo || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear bloqueo" });
  }
}

async function eliminar(req, res) {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM bloqueos WHERE id = $1", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Bloqueo no encontrado" });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar bloqueo" });
  }
}

module.exports = { listar, crear, eliminar };
