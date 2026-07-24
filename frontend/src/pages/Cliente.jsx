import React, { useEffect, useState } from "react";
import {
  getContacto,
  getServicios,
  crearTurno,
  getDisponibilidad,
} from "../api.js";
import Calendario from "../components/Calendario.jsx";

const emptyForm = {
  cliente_nombre: "",
  cliente_telefono: "",
  servicio_id: "",
  fecha: "",
  hora: "",
};

const SERVICIO_ORDER = ["corte", "barba", "corte + barba"];

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
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
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
      const list = (s || [])
        .filter((x) =>
          SERVICIO_ORDER.includes(String(x.nombre).toLowerCase())
        )
        .sort(
          (a, b) =>
            SERVICIO_ORDER.indexOf(String(a.nombre).toLowerCase()) -
            SERVICIO_ORDER.indexOf(String(b.nombre).toLowerCase())
        );
      setServicios(list.length ? list : s || []);
    });
  }, []);

  useEffect(() => {
    if (!form.fecha) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    getDisponibilidad(form.fecha)
      .then((data) => {
        if (!cancelled) setSlots(data.slots || []);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          setSlots([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.fecha]);

  function pickFecha(iso) {
    setForm((f) => ({ ...f, fecha: iso, hora: "" }));
    setError("");
    setMsg("");
  }

  async function confirmar(e) {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!form.fecha) {
      setError("Selecciona un día en el calendario.");
      return;
    }
    if (!form.hora) {
      setError("Selecciona un horario disponible.");
      return;
    }
    if (!form.servicio_id) {
      setError("Selecciona un servicio (Corte, Barba o Corte + Barba).");
      return;
    }
    if (!form.cliente_nombre.trim()) {
      setError("Escribe tu nombre para confirmar la cita.");
      return;
    }

    setSaving(true);
    const servicio = servicios.find(
      (s) => String(s.id) === String(form.servicio_id)
    );
    const servicioNombre = servicio?.nombre || "";

    try {
      const res = await crearTurno({
        cliente_nombre: form.cliente_nombre.trim(),
        cliente_telefono: form.cliente_telefono || "",
        servicio_id: Number(form.servicio_id),
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

      setMsg("Cita confirmada y guardada. Se abre WhatsApp del administrador.");
      setForm(emptyForm);
      setSlots([]);
      window.open(waAdmin, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.message || "No se pudo agendar");
      // refrescar slots por si quedó ocupado
      if (form.fecha) {
        getDisponibilidad(form.fecha)
          .then((data) => setSlots(data.slots || []))
          .catch(() => {});
      }
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

      <section className="client-hero client-hero-compact">
        <p className="client-kicker">Barbería moderna</p>
        <h1 className="client-brand">Baena Barber</h1>
        <p className="client-lead">
          Elige el día, el horario disponible y el servicio. Sin registro.
        </p>
        {msg && <p className="client-success">{msg}</p>}
      </section>

      <section className="client-section" id="servicios">
        <header className="client-section-head">
          <h2>Servicios y precios</h2>
          <p>Corte, Barba o el combo.</p>
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
        </div>
      </section>

      <section className="client-section" id="agendar">
        <header className="client-section-head">
          <h2>Agendar cita</h2>
          <p>1) Día → 2) Horario (9:30–18:00) → 3) Servicio → Confirmar</p>
        </header>

        <form className="client-form client-form-wide" onSubmit={confirmar}>
          <div className="booking-steps">
            <div className="booking-step">
              <h3>1. Calendario</h3>
              <Calendario
                value={form.fecha}
                onChange={pickFecha}
                month={month}
                onMonthChange={setMonth}
              />
              {form.fecha && (
                <p className="muted" style={{ marginTop: 10 }}>
                  Día seleccionado: <strong>{form.fecha}</strong>
                </p>
              )}
            </div>

            <div className="booking-step">
              <h3>2. Horario laboral</h3>
              {!form.fecha && (
                <p className="muted">Selecciona un día para ver horarios.</p>
              )}
              {form.fecha && loadingSlots && (
                <p className="muted">Cargando horarios…</p>
              )}
              {form.fecha && !loadingSlots && (
                <div className="slot-grid slot-grid-dense" role="group" aria-label="Horarios">
                  {slots.map((s) => (
                    <button
                      key={s.hora}
                      type="button"
                      disabled={!s.disponible}
                      className={[
                        "slot-btn",
                        form.hora === s.hora ? "active" : "",
                        !s.disponible ? "busy" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() =>
                        setForm((f) => ({ ...f, hora: s.hora }))
                      }
                      title={
                        s.disponible
                          ? "Disponible"
                          : s.motivo === "ocupado"
                            ? "Ocupado"
                            : "No disponible"
                      }
                    >
                      {s.hora}
                    </button>
                  ))}
                </div>
              )}
              <p className="muted slot-legend">
                Atención 9:30 a.m. – 6:00 p.m. · cada 30 min · gris = ocupado /
                pasado
              </p>
            </div>
          </div>

          <div className="booking-step">
            <h3>3. Tipo de servicio</h3>
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
                  onClick={() =>
                    setForm((f) => ({ ...f, servicio_id: String(s.id) }))
                  }
                >
                  {s.nombre} · ${Number(s.precio).toLocaleString("es-CO")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label htmlFor="cliente_nombre">Tu nombre</label>
              <input
                id="cliente_nombre"
                name="cliente_nombre"
                value={form.cliente_nombre}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cliente_nombre: e.target.value }))
                }
                placeholder="Cómo te llamas"
                required
              />
            </div>
            <div>
              <label htmlFor="cliente_telefono">WhatsApp (opcional)</label>
              <input
                id="cliente_telefono"
                name="cliente_telefono"
                value={form.cliente_telefono}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cliente_telefono: e.target.value }))
                }
                placeholder="573001234567"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? "Guardando…" : "Confirmar cita"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </section>

      <footer className="client-footer">
        <div>
          <strong>Baena Barber</strong>
          <p>Corte · Barba · Combo</p>
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
