import React, { useEffect, useState } from "react";
import { getContacto, getServicios, crearTurno } from "../api.js";

const emptyTurno = {
  cliente_nombre: "",
  cliente_telefono: "",
  servicio_id: "",
  fecha: "",
  hora: "",
  notas: "",
};

export default function Cliente() {
  const [contacto, setContacto] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [form, setForm] = useState(emptyTurno);
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
          whatsapp: `https://wa.me/${wa}?text=${encodeURIComponent(
            "Hola Baena Barber, quiero agendar un turno."
          )}`,
          telefono: `tel:${phone}`,
        });
      }
      setServicios(s || []);
    });
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function agendar(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    setSaving(true);
    try {
      await crearTurno({
        ...form,
        servicio_id: form.servicio_id || null,
      });
      setMsg("¡Turno solicitado! Te confirmamos por WhatsApp o llamada.");
      setForm(emptyTurno);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

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
          Cortes precisos, barba impecable y atención al detalle. Agenda tu
          turno en segundos.
        </p>
        <div className="client-cta">
          <a className="btn btn-primary" href="#agendar">
            Agendar turno
          </a>
          {contacto && (
            <a
              className="btn btn-wa"
              href={contacto.whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              Escribir por WhatsApp
            </a>
          )}
        </div>
        {msg && <p className="client-success">{msg}</p>}
      </section>

      <section className="client-section" id="servicios">
        <header className="client-section-head">
          <h2>Servicios y precios</h2>
          <p>Precios claros. Elige el tuyo y agenda abajo.</p>
        </header>
        <div className="service-rail">
          {servicios.map((s, i) => (
            <article
              className="service-item"
              key={s.id}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <h3>{s.nombre}</h3>
              <p className="service-meta">{s.duracion_min} min</p>
              <p className="service-price">
                ${Number(s.precio).toLocaleString("es-CO")}
              </p>
            </article>
          ))}
          {servicios.length === 0 && (
            <p className="muted">Cargando servicios…</p>
          )}
        </div>
      </section>

      <section className="client-section" id="agendar">
        <header className="client-section-head">
          <h2>Agendar cita</h2>
          <p>Déjanos tus datos y te confirmamos el horario.</p>
        </header>
        <form className="client-form" onSubmit={agendar}>
          <div className="grid-2">
            <div>
              <label htmlFor="cliente_nombre">Tu nombre</label>
              <input
                id="cliente_nombre"
                name="cliente_nombre"
                value={form.cliente_nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="cliente_telefono">WhatsApp</label>
              <input
                id="cliente_telefono"
                name="cliente_telefono"
                value={form.cliente_telefono}
                onChange={handleChange}
                placeholder="573001234567"
                required
              />
            </div>
          </div>
          <label htmlFor="servicio_id">Servicio</label>
          <select
            id="servicio_id"
            name="servicio_id"
            value={form.servicio_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar…</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} — ${Number(s.precio).toLocaleString("es-CO")}
              </option>
            ))}
          </select>
          <div className="grid-2">
            <div>
              <label htmlFor="fecha">Fecha</label>
              <input
                id="fecha"
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="hora">Hora</label>
              <input
                id="hora"
                type="time"
                name="hora"
                value={form.hora}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <label htmlFor="notas">Notas</label>
          <textarea
            id="notas"
            name="notas"
            value={form.notas}
            onChange={handleChange}
            rows={2}
            placeholder="¿Algo que debamos saber?"
          />
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Enviando…" : "Solicitar turno"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </section>

      <footer className="client-footer">
        <div>
          <strong>Baena Barber</strong>
          <p>Estilo · Precisión · Cuidado</p>
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
