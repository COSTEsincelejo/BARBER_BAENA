const pool = require("../db");
const {
  linkWhatsApp,
  linkLlamada,
  mensajeConfirmacionTurno,
} = require("../utils/contacto");

const BARBERSHOP_WHATSAPP = process.env.BARBERSHOP_WHATSAPP || "573000000000";
const BARBERSHOP_PHONE = process.env.BARBERSHOP_PHONE || "+573000000000";

function contactoTurno(clienteTelefono, mensaje) {
  return {
    whatsapp_barberia: linkWhatsApp(BARBERSHOP_WHATSAPP, mensaje),
    llamar_barberia: linkLlamada(BARBERSHOP_PHONE),
    whatsapp_cliente: linkWhatsApp(
      clienteTelefono,
      "Hola, te escribimos desde Baena Barber."
    ),
    llamar_cliente: linkLlamada(clienteTelefono),
  };
}

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

async function crear(req, res) {
  const {
    cliente_nombre,
    cliente_telefono,
    servicio_id,
    barbero,
    fecha,
    hora,
    notas,
  } = req.body;

  if (!cliente_nombre || !fecha || !hora) {
    return res.status(400).json({
      error: "cliente_nombre, fecha y hora son requeridos",
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO turnos
         (cliente_nombre, cliente_telefono, servicio_id, barbero, fecha, hora, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        cliente_nombre,
        cliente_telefono || "",
        servicio_id || null,
        barbero || null,
        fecha,
        hora,
        notas || null,
      ]
    );
    const turno = rows[0];

    let servicioNombre = null;
    if (servicio_id) {
      const s = await pool.query("SELECT nombre FROM servicios WHERE id = $1", [
        servicio_id,
      ]);
      servicioNombre = s.rows[0]?.nombre;
    }

    const mensaje = mensajeConfirmacionTurno(turno, servicioNombre);

    res.status(201).json({
      turno,
      contacto: contactoTurno(cliente_telefono, mensaje),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear turno" });
  }
}

async function actualizarEstado(req, res) {
  const { id } = req.params;
  const { estado } = req.body;
  const validos = ["pendiente", "confirmado", "completado", "cancelado"];
  if (!validos.includes(estado)) {
    return res
      .status(400)
      .json({ error: `estado debe ser uno de: ${validos.join(", ")}` });
  }

  try {
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
          await pool.query(
            `INSERT INTO movimientos_financieros (tipo, concepto, monto, fecha, turno_id)
             VALUES ('ingreso', $1, $2, CURRENT_DATE, $3)`,
            [
              `Servicio: ${servicio.rows[0].nombre} — ${turno.cliente_nombre}`,
              servicio.rows[0].precio,
              id,
            ]
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

module.exports = { listar, crear, actualizarEstado, eliminar };
