const pool = require("../db");

function normalizarTelefono(tel) {
  return String(tel || "").replace(/\D/g, "");
}

/** Crea o actualiza cliente por teléfono (si hay) o por nombre suelto */
async function upsertCliente({ nombre, telefono, client = pool }) {
  const tel = normalizarTelefono(telefono);
  const nom = String(nombre || "").trim();
  if (!nom) return null;

  if (tel) {
    const existing = await client.query(
      "SELECT * FROM clientes WHERE telefono = $1 LIMIT 1",
      [tel]
    );
    if (existing.rows[0]) {
      const { rows } = await client.query(
        `UPDATE clientes
         SET nombre = COALESCE(NULLIF($1, ''), nombre), updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [nom, existing.rows[0].id]
      );
      return rows[0];
    }
    const { rows } = await client.query(
      `INSERT INTO clientes (nombre, telefono) VALUES ($1, $2) RETURNING *`,
      [nom, tel]
    );
    return rows[0];
  }

  const { rows } = await client.query(
    `INSERT INTO clientes (nombre, telefono) VALUES ($1, '') RETURNING *`,
    [nom]
  );
  return rows[0];
}

async function listar(req, res) {
  const q = String(req.query.q || "").trim();
  try {
    let query = `
      SELECT c.*,
        (SELECT COUNT(*) FROM turnos t WHERE t.cliente_id = c.id) AS total_visitas,
        (SELECT MAX(t.fecha) FROM turnos t WHERE t.cliente_id = c.id AND t.estado = 'completado') AS ultima_visita
      FROM clientes c
      WHERE 1=1
    `;
    const params = [];
    if (q) {
      params.push(`%${q}%`);
      query += ` AND (c.nombre ILIKE $${params.length} OR c.telefono ILIKE $${params.length})`;
    }
    query += " ORDER BY c.updated_at DESC, c.nombre ASC LIMIT 200";
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar clientes" });
  }
}

async function obtener(req, res) {
  try {
    const { rows } = await pool.query("SELECT * FROM clientes WHERE id = $1", [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ error: "Cliente no encontrado" });

    const historial = await pool.query(
      `SELECT t.*, s.nombre AS servicio_nombre, s.precio AS servicio_precio
       FROM turnos t
       LEFT JOIN servicios s ON s.id = t.servicio_id
       WHERE t.cliente_id = $1
       ORDER BY t.fecha DESC, t.hora DESC
       LIMIT 50`,
      [req.params.id]
    );

    res.json({ ...rows[0], historial: historial.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener cliente" });
  }
}

async function actualizar(req, res) {
  const { nombre, telefono, notas, alergias, preferencias } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE clientes SET
         nombre = COALESCE($1, nombre),
         telefono = COALESCE($2, telefono),
         notas = COALESCE($3, notas),
         alergias = COALESCE($4, alergias),
         preferencias = COALESCE($5, preferencias),
         updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [
        nombre ?? null,
        telefono != null ? normalizarTelefono(telefono) : null,
        notas ?? null,
        alergias ?? null,
        preferencias ?? null,
        req.params.id,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Ya existe un cliente con ese teléfono" });
    }
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
}

module.exports = { listar, obtener, actualizar, upsertCliente, normalizarTelefono };
