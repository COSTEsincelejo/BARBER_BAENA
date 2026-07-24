// Enlaces de contacto Baena Barber (wa.me y tel:) — sin API de WhatsApp Business

function linkWhatsApp(telefono, mensaje) {
  const numero = String(telefono).replace(/\D/g, "");
  const texto = encodeURIComponent(mensaje || "");
  return `https://wa.me/${numero}?text=${texto}`;
}

function linkLlamada(telefono) {
  const numero = String(telefono).replace(/\s+/g, "");
  return `tel:${numero}`;
}

function mensajeConfirmacionTurno(turno, servicioNombre) {
  return (
    `Hola, quiero confirmar mi turno en Baena Barber:\n` +
    `Cliente: ${turno.cliente_nombre}\n` +
    `Servicio: ${servicioNombre || "-"}\n` +
    `Fecha: ${turno.fecha} ${turno.hora}\n` +
    `Barbero: ${turno.barbero || "cualquiera"}`
  );
}

function mensajeCotizacion(cotizacion, items) {
  const lista = (items || [])
    .map((i) => `• ${i.nombre_servicio}: $${Number(i.precio).toLocaleString("es-CO")}`)
    .join("\n");
  return (
    `Cotización Baena Barber\n` +
    (cotizacion.cliente_nombre ? `Cliente: ${cotizacion.cliente_nombre}\n` : "") +
    `${lista}\n` +
    `Duración: ${cotizacion.duracion_total} min\n` +
    `Total: $${Number(cotizacion.total).toLocaleString("es-CO")}`
  );
}

module.exports = {
  linkWhatsApp,
  linkLlamada,
  mensajeConfirmacionTurno,
  mensajeCotizacion,
};
