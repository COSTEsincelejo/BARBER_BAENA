const pool = require("../db");
const { linkWhatsApp, linkLlamada, mensajeConfirmacionTurno } = require("../utils/contacto");

const BARBERSHOP_WHATSAPP = process.env.BARBERSHOP_WHATSAPP || "573000000000";
const BARBERSHOP_PHONE = process.env.BARBERSHOP_PHONE || "+573000000000";

// Listar turnos (opcionalmente filtrados por fecha o estado)
async function listar(req, res) {
  const { fecha, estado } = req.query;
  try {
    let query = `
      SELECT t.*, s.nombre AS servicio_nombre, s.precio AS servicio_precio
      FROM turnos t
      LEFT JOIN servicios s ON s.id = t.servicio_id
      WHERE 1=1
    `;
    const params = [];
    if (fecha) {
      params.push(fecha);
      query += ` AND t.fecha = $${params.length}`;
    }
    if (estado) {
      params.push(estado);
      query += ` AND t.estado = $${params.length}`;
    }
    query += " ORDER BY t.fecha, t.hora";
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar turnos" });
  }
}

function tiempoAMinutos(valor) {
  if (valor == null) return null;
  const match = String(valor).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function minutosAHora(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generarSlots(horaApertura, horaCierre, duracionMin) {
  const inicio = tiempoAMinutos(horaApertura);
  const fin = tiempoAMinutos(horaCierre);
  const slots = [];
  if (inicio == null || fin == null || !duracionMin || duracionMin <= 0) return slots;
  for (let t = inicio; t + duracionMin <= fin; t += duracionMin) {
    slots.push(minutosAHora(t));
  }
  return slots;
}

function slotSeTraslapa(slotInicioMin, duracionMin, bloqueoInicio, bloqueoFin) {
  const bIni = tiempoAMinutos(bloqueoInicio);
  const bFin = tiempoAMinutos(bloqueoFin);
  if (bIni == null || bFin == null) return false;
  const slotFin = slotInicioMin + duracionMin;
  return slotInicioMin < bFin && slotFin > bIni;
}

// GET /api/turnos/disponibilidad?fecha=YYYY-MM-DD&servicio_id=ID
async function consultarDisponibilidad(req, res) {
  const { fecha, servicio_id } = req.query;
  if (!fecha) {
    return res.status(400).json({ error: "fecha es requerida (YYYY-MM-DD)" });
  }

  try {
    const dow = await pool.query(
      "SELECT EXTRACT(DOW FROM $1::date)::int AS dia_semana",
      [fecha]
    );
    const diaSemana = dow.rows[0]?.dia_semana;

    const horario = await pool.query(
      `SELECT hora_apertura, hora_cierre
       FROM horarios_atencion
       WHERE dia_semana = $1 AND activo = TRUE`,
      [diaSemana]
    );
    if (horario.rows.length === 0) {
      return res.json({ disponible: false, motivo: "dia_cerrado", horarios: [] });
    }

    const bloqueoDia = await pool.query(
      `SELECT id FROM bloqueos
       WHERE fecha = $1::date AND hora_inicio IS NULL`,
      [fecha]
    );
    if (bloqueoDia.rows.length > 0) {
      return res.json({ disponible: false, motivo: "dia_bloqueado", horarios: [] });
    }

    let duracionMin = 30;
    if (servicio_id) {
      const servicio = await pool.query(
        "SELECT duracion_min FROM servicios WHERE id = $1",
        [servicio_id]
      );
      if (servicio.rows.length === 0) {
        return res.status(404).json({ error: "Servicio no encontrado" });
      }
      duracionMin = Number(servicio.rows[0].duracion_min) || 30;
    }

    const { hora_apertura, hora_cierre } = horario.rows[0];
    let slots = generarSlots(hora_apertura, hora_cierre, duracionMin);

    const bloqueosParciales = await pool.query(
      `SELECT hora_inicio, hora_fin FROM bloqueos
       WHERE fecha = $1::date AND hora_inicio IS NOT NULL AND hora_fin IS NOT NULL`,
      [fecha]
    );
    slots = slots.filter((slot) => {
      const slotIni = tiempoAMinutos(slot);
      return !bloqueosParciales.rows.some((b) =>
        slotSeTraslapa(slotIni, duracionMin, b.hora_inicio, b.hora_fin)
      );
    });

    const ocupados = await pool.query(
      `SELECT hora FROM turnos
       WHERE fecha = $1::date AND estado IN ('pendiente','confirmado')`,
      [fecha]
    );
    const horasOcupadas = new Set(
      ocupados.rows.map((r) => minutosAHora(tiempoAMinutos(r.hora)))
    );
    slots = slots.filter((slot) => !horasOcupadas.has(slot));

    res.json({ disponible: true, horarios: slots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al consultar disponibilidad" });
  }
}

// Crear turno + generar enlaces de contacto
async function crear(req, res) {
  const { cliente_nombre, cliente_telefono, servicio_id, barbero, fecha, hora, notas } = req.body;
  if (!cliente_nombre || !cliente_telefono || !fecha || !hora) {
    return res.status(400).json({ error: "cliente_nombre, cliente_telefono, fecha y hora son requeridos" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Serializa reservas concurrentes de la misma fecha+hora (FOR UPDATE no bloquea si no hay filas).
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1::text), hashtext($2::text))",
      [fecha, hora]
    );

    const ocupado = await client.query(
      `SELECT id FROM turnos
       WHERE fecha = $1 AND hora = $2 AND estado IN ('pendiente','confirmado')
       FOR UPDATE`,
      [fecha, hora]
    );
    if (ocupado.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Ese horario ya no está disponible, elige otro." });
    }

    const { rows } = await client.query(
      `INSERT INTO turnos (cliente_nombre, cliente_telefono, servicio_id, barbero, fecha, hora, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [cliente_nombre, cliente_telefono, servicio_id || null, barbero || null, fecha, hora, notas || null]
    );
    const turno = rows[0];

    let servicioNombre = null;
    if (servicio_id) {
      const s = await client.query("SELECT nombre FROM servicios WHERE id = $1", [servicio_id]);
      servicioNombre = s.rows[0]?.nombre;
    }

    await client.query("COMMIT");

    const mensaje = mensajeConfirmacionTurno(turno, servicioNombre);

    res.status(201).json({
      turno,
      contacto: {
        whatsapp_barberia: linkWhatsApp(BARBERSHOP_WHATSAPP, mensaje),
        llamar_barberia: linkLlamada(BARBERSHOP_PHONE),
        whatsapp_cliente: linkWhatsApp(cliente_telefono, "Hola, te confirmamos tu turno en la barbería."),
        llamar_cliente: linkLlamada(cliente_telefono),
      },
    });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (_) {
      /* ignore rollback errors */
    }
    console.error(err);
    res.status(500).json({ error: "Error al crear turno" });
  } finally {
    client.release();
  }
}

// Actualizar estado del turno (pendiente, confirmado, completado, cancelado)
async function actualizarEstado(req, res) {
  const { id } = req.params;
  const { estado } = req.body;
  const validos = ["pendiente", "confirmado", "completado", "cancelado"];
  if (!validos.includes(estado)) {
    return res.status(400).json({ error: `estado debe ser uno de: ${validos.join(", ")}` });
  }
  try {
    const { rows } = await pool.query(
      "UPDATE turnos SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Turno no encontrado" });

    // Si se marca como completado, registrar automáticamente el ingreso
    if (estado === "completado") {
      const turno = rows[0];
      const existe = await pool.query(
        "SELECT id FROM movimientos_financieros WHERE turno_id = $1",
        [id]
      );
      if (existe.rows.length === 0 && turno.servicio_id) {
        const servicio = await pool.query("SELECT nombre, precio FROM servicios WHERE id = $1", [turno.servicio_id]);
        if (servicio.rows[0]) {
          await pool.query(
            `INSERT INTO movimientos_financieros (tipo, concepto, monto, fecha, turno_id)
             VALUES ('ingreso', $1, $2, CURRENT_DATE, $3)`,
            [`Servicio: ${servicio.rows[0].nombre} - ${turno.cliente_nombre}`, servicio.rows[0].precio, id]
          );
        }
      }
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar el turno" });
  }
}

async function eliminar(req, res) {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM turnos WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar turno" });
  }
}

module.exports = { listar, consultarDisponibilidad, crear, actualizarEstado, eliminar };
