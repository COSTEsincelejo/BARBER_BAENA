const pool = require("../db");

const DIAS_SEMANA = [0, 1, 2, 3, 4, 5, 6];

function parseDiaSemana(valor) {
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 0 || n > 6) return null;
  return n;
}

// Devuelve los 7 días; si un día no tiene fila, activo=false
async function listar(req, res) {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM horarios_atencion ORDER BY dia_semana"
    );
    const porDia = new Map(rows.map((r) => [Number(r.dia_semana), r]));
    const resultado = DIAS_SEMANA.map((dia) => {
      const fila = porDia.get(dia);
      if (!fila) {
        return {
          dia_semana: dia,
          hora_apertura: null,
          hora_cierre: null,
          activo: false,
        };
      }
      return fila;
    });
    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar horarios" });
  }
}

// UPSERT por dia_semana
async function actualizar(req, res) {
  const dia_semana = parseDiaSemana(req.params.dia_semana);
  const { hora_apertura, hora_cierre } = req.body;
  const activo = req.body.activo !== undefined ? Boolean(req.body.activo) : true;

  if (dia_semana == null) {
    return res.status(400).json({ error: "dia_semana debe ser un entero entre 0 y 6" });
  }
  if (!hora_apertura || !hora_cierre) {
    return res.status(400).json({ error: "hora_apertura y hora_cierre son requeridos" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO horarios_atencion (dia_semana, hora_apertura, hora_cierre, activo)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (dia_semana) DO UPDATE
         SET hora_apertura = EXCLUDED.hora_apertura,
             hora_cierre = EXCLUDED.hora_cierre,
             activo = EXCLUDED.activo
       RETURNING *`,
      [dia_semana, hora_apertura, hora_cierre, activo]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar horario" });
  }
}

module.exports = { listar, actualizar };
