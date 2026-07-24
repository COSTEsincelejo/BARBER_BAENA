const pool = require("../db");

const NOMBRES_DIA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

async function listarPublico(_req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT tipo, to_char(fecha, 'YYYY-MM-DD') AS fecha, dia_semana
       FROM dias_bloqueados`
    );
    const fechas = rows
      .filter((r) => r.tipo === "fecha" && r.fecha)
      .map((r) => r.fecha);
    const dias_semana = rows
      .filter((r) => r.tipo === "dia_semana" && r.dia_semana != null)
      .map((r) => Number(r.dia_semana));
    res.json({ fechas, dias_semana });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar bloqueos" });
  }
}

async function listarAdmin(_req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, tipo, to_char(fecha, 'YYYY-MM-DD') AS fecha, dia_semana, motivo, created_at
       FROM dias_bloqueados
       ORDER BY tipo, fecha NULLS LAST, dia_semana NULLS LAST`
    );
    res.json(
      rows.map((r) => ({
        ...r,
        dia_nombre:
          r.tipo === "dia_semana" ? NOMBRES_DIA[r.dia_semana] : null,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar bloqueos" });
  }
}

async function crear(req, res) {
  const { tipo, fecha, dia_semana, motivo } = req.body;
  if (!["fecha", "dia_semana"].includes(tipo)) {
    return res.status(400).json({ error: "tipo debe ser fecha o dia_semana" });
  }
  try {
    if (tipo === "fecha") {
      const f = String(fecha || "").slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) {
        return res.status(400).json({ error: "fecha inválida" });
      }
      const { rows } = await pool.query(
        `INSERT INTO dias_bloqueados (tipo, fecha, motivo)
         VALUES ('fecha', $1, $2) RETURNING *`,
        [f, motivo || null]
      );
      return res.status(201).json(rows[0]);
    }

    const d = Number(dia_semana);
    if (!Number.isInteger(d) || d < 0 || d > 6) {
      return res.status(400).json({ error: "dia_semana debe ser 0..6 (domingo..sábado)" });
    }
    const { rows } = await pool.query(
      `INSERT INTO dias_bloqueados (tipo, dia_semana, motivo)
       VALUES ('dia_semana', $1, $2) RETURNING *`,
      [d, motivo || null]
    );
    res.status(201).json({
      ...rows[0],
      dia_nombre: NOMBRES_DIA[d],
    });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Ese bloqueo ya existe" });
    }
    res.status(500).json({ error: "Error al crear bloqueo" });
  }
}

async function eliminar(req, res) {
  try {
    await pool.query("DELETE FROM dias_bloqueados WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar bloqueo" });
  }
}

/** Utilidad: ¿fecha bloqueada? */
async function esDiaBloqueado(fechaStr) {
  const [y, m, d] = String(fechaStr).slice(0, 10).split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dow = date.getDay(); // 0 domingo
  const { rows } = await pool.query(
    `SELECT id FROM dias_bloqueados
     WHERE (tipo = 'fecha' AND fecha = $1::date)
        OR (tipo = 'dia_semana' AND dia_semana = $2)
     LIMIT 1`,
    [fechaStr, dow]
  );
  return rows.length > 0;
}

module.exports = {
  listarPublico,
  listarAdmin,
  crear,
  eliminar,
  esDiaBloqueado,
  NOMBRES_DIA,
};
