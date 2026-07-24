// Genera un enlace de WhatsApp (wa.me) con mensaje precargado.
// telefono: número de la BARBERÍA (dueño), no del cliente -- así el barbero recibe el mensaje de confirmación.
function linkWhatsApp(telefono, mensaje) {
  const numero = String(telefono).replace(/\D/g, "");
  const texto = encodeURIComponent(mensaje);
  return `https://wa.me/${numero}?text=${texto}`;
}

// Genera un enlace tel: para llamar directamente
function linkLlamada(telefono) {
  const numero = String(telefono).replace(/\s+/g, "");
  return `tel:${numero}`;
}

function mensajeConfirmacionTurno(turno, servicioNombre) {
  return (
    `Hola, quiero confirmar mi turno:\n` +
    `Cliente: ${turno.cliente_nombre}\n` +
    `Servicio: ${servicioNombre || "-"}\n` +
    `Fecha: ${turno.fecha} ${turno.hora}\n` +
    `Barbero: ${turno.barbero || "cualquiera"}`
  );
}

module.exports = { linkWhatsApp, linkLlamada, mensajeConfirmacionTurno };
