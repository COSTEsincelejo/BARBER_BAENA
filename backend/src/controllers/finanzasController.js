const pool = require("../db");

// Listar movimientos financieros, opcionalmente filtrados por rango de fechas o tipo
async function listar(req, res) {
  const { desde, hasta, tipo } = req.query;
  try {
    let query = "SELECT * FROM movimientos_financieros WHERE 1=1";
    const params = [];
    if (desde) {
      params.push(desde);
      query += ` AND fecha >= $${params.length}`;
    }
    if (hasta) {
      params.push(hasta);
      query += ` AND fecha <= $${params.length}`;
    }
    if (tipo) {
      params.push(tipo);
      query += ` AND tipo = $${params.length}`;
    }
    query += " ORDER BY fecha DESC, created_at DESC";
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar movimientos" });
  }
}

// Registrar un ingreso o gasto manual
async function crear(req, res) {
  const { tipo, concepto, monto, fecha } = req.body;
  if (!["ingreso", "gasto"].includes(tipo) || !concepto || monto == null) {
    return res.status(400).json({ error: "tipo (ingreso|gasto), concepto y monto son requeridos" });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO movimientos_financieros (tipo, concepto, monto, fecha)
       VALUES ($1,$2,$3, COALESCE($4, CURRENT_DATE)) RETURNING *`,
      [tipo, concepto, monto, fecha || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar movimiento" });
  }
}

async function eliminar(req, res) {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM movimientos_financieros WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar movimiento" });
  }
}

// Resumen: total ingresos, total gastos, balance (con filtro opcional de fechas)
async function resumen(req, res) {
  const { desde, hasta } = req.query;
  try {
    let query = `
      SELECT tipo, COALESCE(SUM(monto),0) AS total
      FROM movimientos_financieros
      WHERE 1=1
    `;
    const params = [];
    if (desde) {
      params.push(desde);
      query += ` AND fecha >= $${params.length}`;
    }
    if (hasta) {
      params.push(hasta);
      query += ` AND fecha <= $${params.length}`;
    }
    query += " GROUP BY tipo";
    const { rows } = await pool.query(query, params);

    const ingresos = Number(rows.find((r) => r.tipo === "ingreso")?.total || 0);
    const gastos = Number(rows.find((r) => r.tipo === "gasto")?.total || 0);

    res.json({ ingresos, gastos, balance: ingresos - gastos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al calcular el resumen" });
  }
}

module.exports = { listar, crear, eliminar, resumen };
