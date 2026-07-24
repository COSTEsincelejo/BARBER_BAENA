const pool = require("../db");

function rangoDesdePeriodo(periodo) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hasta = hoy.toISOString().slice(0, 10);
  const desdeDate = new Date(hoy);

  if (periodo === "mes") {
    desdeDate.setDate(1);
  } else {
    // semana: lunes
    const day = (hoy.getDay() + 6) % 7;
    desdeDate.setDate(hoy.getDate() - day);
  }

  return {
    desde: desdeDate.toISOString().slice(0, 10),
    hasta,
  };
}

async function resumen(req, res) {
  const periodo = req.query.periodo === "mes" ? "mes" : "semana";
  let { desde, hasta } = req.query;
  if (!desde || !hasta) {
    const r = rangoDesdePeriodo(periodo);
    desde = desde || r.desde;
    hasta = hasta || r.hasta;
  }

  try {
    const ingresosMov = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) AS total
       FROM movimientos_financieros
       WHERE tipo = 'ingreso' AND fecha BETWEEN $1 AND $2`,
      [desde, hasta]
    );

    // Pagos Nequi/anticipados sin movimiento de caja (evita doble conteo al completar)
    const ingresosPagos = await pool.query(
      `SELECT COALESCE(SUM(COALESCE(t.monto, s.precio, 0)), 0) AS total
       FROM turnos t
       LEFT JOIN servicios s ON s.id = t.servicio_id
       WHERE t.pago_estado = 'pagado'
         AND t.fecha BETWEEN $1 AND $2
         AND NOT EXISTS (
           SELECT 1 FROM movimientos_financieros m WHERE m.turno_id = t.id
         )`,
      [desde, hasta]
    );

    const gastos = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) AS total
       FROM movimientos_financieros
       WHERE tipo = 'gasto' AND fecha BETWEEN $1 AND $2`,
      [desde, hasta]
    );

    const porServicio = await pool.query(
      `SELECT s.nombre,
              COUNT(*)::int AS cantidad,
              COALESCE(SUM(COALESCE(t.monto, s.precio, 0)), 0) AS ingresos
       FROM turnos t
       JOIN servicios s ON s.id = t.servicio_id
       WHERE t.estado = 'completado'
         AND t.fecha BETWEEN $1 AND $2
       GROUP BY s.id, s.nombre
       ORDER BY cantidad DESC, ingresos DESC`,
      [desde, hasta]
    );

    const noShows = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM turnos
       WHERE estado = 'no_asistio'
         AND fecha BETWEEN $1 AND $2`,
      [desde, hasta]
    );

    const porEstado = await pool.query(
      `SELECT estado, COUNT(*)::int AS total
       FROM turnos
       WHERE fecha BETWEEN $1 AND $2
       GROUP BY estado`,
      [desde, hasta]
    );

    const ingresosCaja = Number(ingresosMov.rows[0].total);
    const ingresosNequiTurnos = Number(ingresosPagos.rows[0].total);
    const gastosTotal = Number(gastos.rows[0].total);

    res.json({
      periodo,
      desde,
      hasta,
      ingresos_caja: ingresosCaja,
      ingresos_pagos_turnos: ingresosNequiTurnos,
      ingresos: ingresosCaja + ingresosNequiTurnos,
      gastos: gastosTotal,
      balance: ingresosCaja + ingresosNequiTurnos - gastosTotal,
      servicio_mas_vendido: porServicio.rows[0] || null,
      servicios: porServicio.rows,
      no_shows: noShows.rows[0].total,
      por_estado: porEstado.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar reportes" });
  }
}

module.exports = { resumen };
