const pool = require("../db");
const {
  linkWhatsApp,
  linkLlamada,
  mensajeCotizacion,
} = require("../utils/contacto");

const BARBERSHOP_WHATSAPP = process.env.BARBERSHOP_WHATSAPP || "573114001414";
const BARBERSHOP_PHONE = process.env.BARBERSHOP_PHONE || "+573114001414";

async function obtenerConItems(id) {
  const cot = await pool.query("SELECT * FROM cotizaciones WHERE id = $1", [id]);
  if (cot.rows.length === 0) return null;
  const items = await pool.query(
    "SELECT * FROM cotizacion_items WHERE cotizacion_id = $1 ORDER BY id",
    [id]
  );
  const cotizacion = cot.rows[0];
  return {
    ...cotizacion,
    items: items.rows,
    contacto: {
      whatsapp_barberia: linkWhatsApp(
        BARBERSHOP_WHATSAPP,
        mensajeCotizacion(cotizacion, items.rows)
      ),
      llamar_barberia: linkLlamada(BARBERSHOP_PHONE),
      whatsapp_cliente: cotizacion.cliente_telefono
        ? linkWhatsApp(
            cotizacion.cliente_telefono,
            mensajeCotizacion(cotizacion, items.rows)
          )
        : null,
      llamar_cliente: cotizacion.cliente_telefono
        ? linkLlamada(cotizacion.cliente_telefono)
        : null,
    },
  };
}

async function listar(req, res) {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM cotizaciones ORDER BY created_at DESC"
    );
    const result = [];
    for (const row of rows) {
      const full = await obtenerConItems(row.id);
      result.push(full);
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar cotizaciones" });
  }
}

async function obtener(req, res) {
  try {
    const full = await obtenerConItems(req.params.id);
    if (!full) return res.status(404).json({ error: "Cotización no encontrada" });
    res.json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener cotización" });
  }
}

async function crear(req, res) {
  const { cliente_nombre, cliente_telefono, servicio_ids, notas } = req.body;

  if (!Array.isArray(servicio_ids) || servicio_ids.length === 0) {
    return res
      .status(400)
      .json({ error: "servicio_ids debe ser un arreglo no vacío" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: servicios } = await client.query(
      `SELECT * FROM servicios WHERE id = ANY($1::int[]) AND activo = TRUE`,
      [servicio_ids]
    );

    if (servicios.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "No se encontraron servicios válidos" });
    }

    const total = servicios.reduce((acc, s) => acc + Number(s.precio), 0);
    const duracion_total = servicios.reduce(
      (acc, s) => acc + Number(s.duracion_min),
      0
    );

    const { rows } = await client.query(
      `INSERT INTO cotizaciones
         (cliente_nombre, cliente_telefono, total, duracion_total, notas, estado)
       VALUES ($1,$2,$3,$4,$5,'borrador') RETURNING *`,
      [
        cliente_nombre || null,
        cliente_telefono || null,
        total,
        duracion_total,
        notas || null,
      ]
    );
    const cotizacion = rows[0];

    for (const s of servicios) {
      await client.query(
        `INSERT INTO cotizacion_items
           (cotizacion_id, servicio_id, nombre_servicio, precio, duracion_min)
         VALUES ($1,$2,$3,$4,$5)`,
        [cotizacion.id, s.id, s.nombre, s.precio, s.duracion_min]
      );
    }

    await client.query("COMMIT");

    const full = await obtenerConItems(cotizacion.id);
    res.status(201).json(full);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error al crear cotización" });
  } finally {
    client.release();
  }
}

async function actualizarEstado(req, res) {
  const { id } = req.params;
  const { estado } = req.body;
  const validos = ["borrador", "enviada", "aceptada", "rechazada"];
  if (!validos.includes(estado)) {
    return res
      .status(400)
      .json({ error: `estado debe ser uno de: ${validos.join(", ")}` });
  }
  try {
    const { rows } = await pool.query(
      "UPDATE cotizaciones SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Cotización no encontrada" });
    }
    const full = await obtenerConItems(id);
    res.json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar cotización" });
  }
}

async function eliminar(req, res) {
  try {
    await pool.query("DELETE FROM cotizaciones WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar cotización" });
  }
}

/** Cotización rápida sin persistir (preview) */
async function preview(req, res) {
  const { servicio_ids } = req.body;
  if (!Array.isArray(servicio_ids) || servicio_ids.length === 0) {
    return res
      .status(400)
      .json({ error: "servicio_ids debe ser un arreglo no vacío" });
  }
  try {
    const { rows } = await pool.query(
      `SELECT * FROM servicios WHERE id = ANY($1::int[]) AND activo = TRUE`,
      [servicio_ids]
    );
    const total = rows.reduce((acc, s) => acc + Number(s.precio), 0);
    const duracion_total = rows.reduce(
      (acc, s) => acc + Number(s.duracion_min),
      0
    );
    res.json({ servicios: rows, total, duracion_total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al calcular cotización" });
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizarEstado,
  eliminar,
  preview,
};
