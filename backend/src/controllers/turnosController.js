const pool = require("../db");
const {
  linkWhatsApp,
  linkLlamada,
  mensajeConfirmacionTurno,
} = require("../utils/contacto");
const {
  generarSlotsLaborales,
  normalizarHora,
  esHorarioLaboral,
  esFechaPasada,
} = require("../utils/horarios");
const { esDiaBloqueado } = require("./bloqueosController");
const { upsertCliente, normalizarTelefono } = require("./clientesController");

const BARBERSHOP_WHATSAPP = process.env.BARBERSHOP_WHATSAPP || "573114001414";
const BARBERSHOP_PHONE = process.env.BARBERSHOP_PHONE || "+573114001414";
const NEQUI_NUMERO = process.env.NEQUI_NUMERO || BARBERSHOP_WHATSAPP;

function contactoTurno(clienteTelefono, mensaje) {
  return {
    whatsapp_barberia: linkWhatsApp(BARBERSHOP_WHATSAPP, mensaje),
    llamar_barberia: linkLlamada(BARBERSHOP_PHONE),
    whatsapp_cliente: clienteTelefono
      ? linkWhatsApp(clienteTelefono, "Hola, te escribimos desde Baena Barber.")
      : null,
    llamar_cliente: clienteTelefono ? linkLlamada(clienteTelefono) : null,
  };
}

async function listar(req, res) {
  const { fecha, estado, desde, hasta } = req.query;
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
    if (desde) {
      params.push(desde);
      query += ` AND t.fecha >= $${params.length}`;
    }
    if (hasta) {
      params.push(hasta);
      query += ` AND t.fecha <= $${params.length}`;
    }
    if (estado) {
      params.push(estado);
      query += ` AND t.estado = $${params.length}`;
    }
    query += " ORDER BY t.fecha DESC, t.hora DESC";
    const { rows } = await pool.query(query, params);

    const conContacto = rows.map((t) => ({
      ...t,
      contacto: contactoTurno(
        t.cliente_telefono,
        mensajeConfirmacionTurno(t, t.servicio_nombre)
      ),
    }));

    res.json(conContacto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar turnos" });
  }
}

/** GET /api/turnos/disponibilidad?fecha=YYYY-MM-DD */
async function disponibilidad(req, res) {
  const fecha = String(req.query.fecha || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return res.status(400).json({ error: "fecha (YYYY-MM-DD) es requerida" });
  }

  if (esFechaPasada(fecha)) {
    return res.json({
      fecha,
      apertura: "09:30",
      cierre: "18:00",
      intervalo_min: 30,
      pasado: true,
      bloqueado: false,
      slots: generarSlotsLaborales().map((hora) => ({
        hora,
        disponible: false,
        motivo: "pasado",
      })),
    });
  }

  try {
    if (await esDiaBloqueado(fecha)) {
      return res.json({
        fecha,
        apertura: "09:30",
        cierre: "18:00",
        intervalo_min: 30,
        pasado: false,
        bloqueado: true,
        slots: generarSlotsLaborales().map((hora) => ({
          hora,
          disponible: false,
          motivo: "bloqueado",
        })),
      });
    }
    const { rows } = await pool.query(
      `SELECT to_char(hora, 'HH24:MI') AS hora
       FROM turnos
       WHERE fecha = $1 AND estado NOT IN ('cancelado', 'no_asistio')`,
      [fecha]
    );
    const ocupados = new Set(rows.map((r) => r.hora));

    const hoyStr = new Date().toISOString().slice(0, 10);
    const ahoraMin =
      hoyStr === fecha ? new Date().getHours() * 60 + new Date().getMinutes() : null;

    const slots = generarSlotsLaborales().map((hora) => {
      if (ocupados.has(hora)) {
        return { hora, disponible: false, motivo: "ocupado" };
      }
      if (ahoraMin != null) {
        const [hh, mm] = hora.split(":").map(Number);
        if (hh * 60 + mm <= ahoraMin) {
          return { hora, disponible: false, motivo: "pasado" };
        }
      }
      return { hora, disponible: true, motivo: null };
    });

    res.json({
      fecha,
      apertura: "09:30",
      cierre: "18:00",
      intervalo_min: 30,
      pasado: false,
      bloqueado: false,
      slots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al consultar disponibilidad" });
  }
}

async function crear(req, res) {
  const {
    cliente_nombre,
    cliente_telefono,
    servicio_id,
    barbero,
    fecha,
    hora,
    notas,
    pago_metodo,
  } = req.body;

  if (!cliente_nombre || !fecha || !hora || !servicio_id) {
    return res.status(400).json({
      error: "cliente_nombre, fecha, hora y servicio_id son requeridos",
    });
  }

  const fechaNorm = String(fecha).slice(0, 10);
  const horaNorm = normalizarHora(hora);
  const telNorm = normalizarTelefono(cliente_telefono);

  if (esFechaPasada(fechaNorm)) {
    return res.status(400).json({ error: "No se pueden agendar citas en días pasados" });
  }

  if (await esDiaBloqueado(fechaNorm)) {
    return res.status(400).json({ error: "Ese día no hay servicio (día bloqueado)" });
  }

  if (!horaNorm || !esHorarioLaboral(horaNorm)) {
    return res.status(400).json({
      error: "La hora debe estar entre 09:30 y 18:00 en intervalos de 30 minutos",
    });
  }

  try {
    const servicio = await pool.query(
      "SELECT id, nombre, precio FROM servicios WHERE id = $1 AND activo = TRUE",
      [servicio_id]
    );
    if (servicio.rows.length === 0) {
      return res.status(400).json({ error: "Debes seleccionar un servicio válido" });
    }

    const conflicto = await pool.query(
      `SELECT id FROM turnos
       WHERE fecha = $1 AND to_char(hora, 'HH24:MI') = $2
         AND estado NOT IN ('cancelado', 'no_asistio')
       LIMIT 1`,
      [fechaNorm, horaNorm]
    );
    if (conflicto.rows.length > 0) {
      return res.status(409).json({
        error: "Ese horario ya está ocupado. Elige otra hora.",
      });
    }

    const cliente = await upsertCliente({
      nombre: cliente_nombre,
      telefono: telNorm,
    });

    const metodo = pago_metodo === "nequi" ? "nequi" : null;

    const { rows } = await pool.query(
      `INSERT INTO turnos
         (cliente_nombre, cliente_telefono, cliente_id, servicio_id, barbero, fecha, hora, notas, estado, monto, pago_metodo, pago_estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pendiente',$9,$10,'pendiente') RETURNING *`,
      [
        cliente_nombre,
        telNorm || "",
        cliente?.id || null,
        servicio_id,
        barbero || null,
        fechaNorm,
        horaNorm,
        notas || null,
        servicio.rows[0].precio,
        metodo,
      ]
    );
    const turno = rows[0];
    const mensaje = mensajeConfirmacionTurno(turno, servicio.rows[0].nombre);
    const monto = Number(servicio.rows[0].precio);

    const nequiMsg =
      `Hola, agendé en Baena Barber.\n` +
      `Voy a pagar por Nequi $${monto.toLocaleString("es-CO")}\n` +
      `Servicio: ${servicio.rows[0].nombre}\n` +
      `Fecha: ${fechaNorm} ${horaNorm}\n` +
      `Cliente: ${cliente_nombre}`;

    res.status(201).json({
      turno: {
        ...turno,
        servicio_nombre: servicio.rows[0].nombre,
        servicio_precio: servicio.rows[0].precio,
      },
      contacto: contactoTurno(telNorm, mensaje),
      pago: {
        metodo_sugerido: "nequi",
        nequi_numero: NEQUI_NUMERO,
        monto,
        instrucciones:
          `Envía $${monto.toLocaleString("es-CO")} por Nequi al ${NEQUI_NUMERO} y avisa por WhatsApp.`,
        whatsapp_pago: linkWhatsApp(BARBERSHOP_WHATSAPP, nequiMsg),
      },
    });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Ese horario ya está ocupado. Elige otra hora.",
      });
    }
    res.status(500).json({ error: "Error al crear turno" });
  }
}

async function actualizarEstado(req, res) {
  const { id } = req.params;
  const { estado } = req.body;
  const validos = [
    "pendiente",
    "confirmado",
    "completado",
    "cancelado",
    "no_asistio",
  ];
  if (!validos.includes(estado)) {
    return res
      .status(400)
      .json({ error: `estado debe ser uno de: ${validos.join(", ")}` });
  }

  try {
    if (!["cancelado", "no_asistio"].includes(estado)) {
      const actual = await pool.query("SELECT fecha, hora FROM turnos WHERE id = $1", [
        id,
      ]);
      if (actual.rows[0]) {
        const conf = await pool.query(
          `SELECT id FROM turnos
           WHERE fecha = $1 AND hora = $2
             AND estado NOT IN ('cancelado', 'no_asistio')
             AND id <> $3
           LIMIT 1`,
          [actual.rows[0].fecha, actual.rows[0].hora, id]
        );
        if (conf.rows.length > 0) {
          return res.status(409).json({
            error: "Ya existe otra cita activa en ese horario",
          });
        }
      }
    }

    const { rows } = await pool.query(
      "UPDATE turnos SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }

    if (estado === "completado") {
      const turno = rows[0];
      const existe = await pool.query(
        "SELECT id FROM movimientos_financieros WHERE turno_id = $1",
        [id]
      );
      if (existe.rows.length === 0 && turno.servicio_id) {
        const servicio = await pool.query(
          "SELECT nombre, precio FROM servicios WHERE id = $1",
          [turno.servicio_id]
        );
        if (servicio.rows[0]) {
          const monto = turno.monto != null ? turno.monto : servicio.rows[0].precio;
          await pool.query(
            `INSERT INTO movimientos_financieros (tipo, concepto, monto, fecha, turno_id)
             VALUES ('ingreso', $1, $2, CURRENT_DATE, $3)`,
            [
              `Servicio: ${servicio.rows[0].nombre} — ${turno.cliente_nombre}`,
              monto,
              id,
            ]
          );
          if (turno.pago_estado !== "pagado") {
            await pool.query(
              `UPDATE turnos SET pago_estado = 'pagado',
                 pago_metodo = COALESCE(pago_metodo, 'efectivo')
               WHERE id = $1`,
              [id]
            );
            rows[0].pago_estado = "pagado";
          }
        }
      }
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Ya existe otra cita activa en ese horario",
      });
    }
    res.status(500).json({ error: "Error al actualizar el turno" });
  }
}

async function marcarPago(req, res) {
  const { id } = req.params;
  const { pago_estado, pago_metodo, pago_referencia } = req.body;
  const estados = ["pendiente", "pagado", "anulado"];
  if (pago_estado && !estados.includes(pago_estado)) {
    return res.status(400).json({ error: "pago_estado inválido" });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE turnos SET
         pago_estado = COALESCE($1, pago_estado),
         pago_metodo = COALESCE($2, pago_metodo),
         pago_referencia = COALESCE($3, pago_referencia)
       WHERE id = $4 RETURNING *`,
      [
        pago_estado || null,
        pago_metodo || null,
        pago_referencia || null,
        id,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: "Turno no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar el pago" });
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

module.exports = {
  listar,
  disponibilidad,
  crear,
  actualizarEstado,
  marcarPago,
  eliminar,
};
