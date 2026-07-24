import React, { useEffect, useState } from "react";
import { getContacto, getServicios, crearTurno } from "../api.js";

const HORARIOS = ["09:00", "09:15", "09:30"];

const emptyForm = {
  cliente_nombre: "",
  cliente_telefono: "",
  servicio_id: "",
  fecha: "",
  hora: "",
};

function buildWhatsAppAdmin(numero, turno, servicioNombre) {
  const n = String(numero || "573001234567").replace(/\D/g, "");
  const mensaje =
    `Hola Baena Barber, quiero agendar una cita:\n` +
    `Nombre: ${turno.cliente_nombre}\n` +
    (turno.cliente_telefono ? `Teléfono: ${turno.cliente_telefono}\n` : "") +
    `Servicio: ${servicioNombre || "-"}\n` +
    `Fecha: ${turno.fecha}\n` +
    `Hora: ${turno.hora}`;
  return `https://wa.me/${n}?text=${encodeURIComponent(mensaje)}`;
}

export default function Cliente() {
  const [contacto, setContacto] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    Promise.all([
      getContacto().catch(() => null),
      getServicios().catch(() => []),
    ]).then(([c, s]) => {
      if (c) setContacto(c);
      else {
        const wa = import.meta.env.VITE_WHATSAPP || "573001234567";
        const phone = import.meta.env.VITE_PHONE || "+573001234567";
        setContacto({
          whatsapp: `https://wa.me/${wa}`,
          telefono: `tel:${phone}`,
          numero_whatsapp: wa,
        });
      }
      // Solo Corte y Barba (por si la DB aún tiene más)
      const filtrados = (s || []).filter((x) =>
        ["corte", "barba"].includes(String(x.nombre).toLowerCase())
      );
      setServicios(filtrados.length ? filtrados : s || []);
    });
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function agendar(e) {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!form.servicio_id || !form.fecha || !form.hora || !form.cliente_nombre) {
      setError("Elige servicio, fecha, horario y escribe tu nombre.");
      return;
    }

    setSaving(true);
    const servicio = servicios.find((s) => String(s.id) === String(form.servicio_id));
    const servicioNombre = servicio?.nombre || "";

    try {
      const res = await crearTurno({
        cliente_nombre: form.cliente_nombre,
        cliente_telefono: form.cliente_telefono || "",
        servicio_id: form.servicio_id,
        fecha: form.fecha,
        hora: form.hora,
      });

      const waAdmin =
        res?.contacto?.whatsapp_barberia ||
        buildWhatsAppAdmin(
          contacto?.numero_whatsapp || import.meta.env.VITE_WHATSAPP,
          form,
          servicioNombre
        );

      setMsg("Cita lista. Se abre WhatsApp del administrador para confirmar.");
      setForm(emptyForm);
      window.open(waAdmin, "_blank", "noopener,noreferrer");
    } catch (err) {
      // Si la API falla, igual enviamos la cita por WhatsApp al admin
      const waAdmin = buildWhatsAppAdmin(
        contacto?.numero_whatsapp || import.meta.env.VITE_WHATSAPP,
        form,
        servicioNombre
      );
      setMsg("Abriendo WhatsApp del administrador con tu cita…");
      window.open(waAdmin, "_blank", "noopener,noreferrer");
      if (err?.message) setError(`Nota: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div className={`client-app ${ready ? "is-ready" : ""}`}>
      <div className="client-atmosphere" aria-hidden="true">
        <div className="client-glow client-glow-a" />
        <div className="client-glow client-glow-b" />
        <div className="client-grain" />
        <div className="pole-stripe" />
      </div>

      <header className="client-nav">
        <div className="client-nav-brand">
          <span className="brand-scissors" aria-hidden="true">
            ✂
          </span>
          <strong>Baena Barber</strong>
        </div>
        <div className="client-nav-actions">
          {contacto && (
            <>
              <a
                className="btn btn-wa"
                href={contacto.whatsapp}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
              <a className="btn btn-call" href={contacto.telefono}>
                Llamar
              </a>
            </>
          )}
        </div>
      </header>

      <section className="client-hero">
        <p className="client-kicker">Barbería moderna</p>
        <h1 className="client-brand">Baena Barber</h1>
        <p className="client-lead">
          Corte y barba. Elige el servicio, el horario y agenda al instante —
          sin registrarte.
        </p>
        <div className="client-cta">
          <a className="btn btn-primary" href="#agendar">
            Agendar cita
          </a>
        </div>
        {msg && <p className="client-success">{msg}</p>}
      </section>

      <section className="client-section" id="servicios">
        <header className="client-section-head">
          <h2>Servicios y precios</h2>
          <p>Solo dos servicios. Toca uno para agendar.</p>
        </header>
        <div className="service-rail service-rail-two">
          {servicios.map((s, i) => (
            <button
              type="button"
              className={
                String(form.servicio_id) === String(s.id)
                  ? "service-item service-pick active"
                  : "service-item service-pick"
              }
              key={s.id}
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => {
                setForm({ ...form, servicio_id: String(s.id) });
                document.getElementById("agendar")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <h3>{s.nombre}</h3>
              <p className="service-meta">{s.duracion_min} min</p>
              <p className="service-price">
                ${Number(s.precio).toLocaleString("es-CO")}
              </p>
            </button>
          ))}
          {servicios.length === 0 && (
            <p className="muted">Cargando servicios…</p>
          )}
        </div>
      </section>

      <section className="client-section" id="agendar">
        <header className="client-section-head">
          <h2>Agendar cita</h2>
          <p>
            Sin registro. Elige fecha y horario; se envía al WhatsApp del
            administrador.
          </p>
        </header>
        <form className="client-form" onSubmit={agendar}>
          <p className="label-like">Servicio</p>
          <div className="service-mini-picks">
            {servicios.map((s) => (
              <button
                key={s.id}
                type="button"
                className={
                  String(form.servicio_id) === String(s.id)
                    ? "chip active"
                    : "chip"
                }
                onClick={() => setForm({ ...form, servicio_id: String(s.id) })}
              >
                {s.nombre} · ${Number(s.precio).toLocaleString("es-CO")}
              </button>
            ))}
          </div>

          <label htmlFor="cliente_nombre">Tu nombre</label>
          <input
            id="cliente_nombre"
            name="cliente_nombre"
            value={form.cliente_nombre}
            onChange={handleChange}
            placeholder="Cómo te llamas"
            required
          />

          <label htmlFor="cliente_telefono">Tu WhatsApp (opcional)</label>
          <input
            id="cliente_telefono"
            name="cliente_telefono"
            value={form.cliente_telefono}
            onChange={handleChange}
            placeholder="573001234567"
          />

          <label htmlFor="fecha">Fecha</label>
          <input
            id="fecha"
            type="date"
            name="fecha"
            value={form.fecha}
            min={hoy}
            onChange={handleChange}
            required
          />

          <p className="label-like">Horario</p>
          <div className="slot-grid" role="group" aria-label="Horarios disponibles">
            {HORARIOS.map((h) => (
              <button
                key={h}
                type="button"
                className={form.hora === h ? "slot-btn active" : "slot-btn"}
                onClick={() => setForm({ ...form, hora: h })}
              >
                {h}
              </button>
            ))}
          </div>

          <button type="submit" className="btn btn-wa btn-block" disabled={saving}>
            {saving ? "Enviando…" : "Agendar y enviar por WhatsApp"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </section>

      <footer className="client-footer">
        <div>
          <strong>Baena Barber</strong>
          <p>Corte · Barba</p>
        </div>
        <div className="contact-actions">
          {contacto && (
            <>
              <a
                className="btn btn-wa"
                href={contacto.whatsapp}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
              <a className="btn btn-call" href={contacto.telefono}>
                Llamar
              </a>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
