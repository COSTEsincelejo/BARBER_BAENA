import React, { useEffect, useState } from "react";
import {
  getContacto,
  getServicios,
  crearTurno,
  getDisponibilidad,
  getBloqueosPublico,
} from "../api.js";
import Calendario from "../components/Calendario.jsx";
import SelectorHora from "../components/SelectorHora.jsx";
import BrandMark from "../components/BrandMark.jsx";
import { slotsConEstadoLocal, formatHoraAmPm } from "../utils/horarios.js";

const emptyForm = {
  cliente_nombre: "",
  servicio_id: "",
  fecha: "",
  hora: "",
};

const SERVICIO_ORDER = ["corte", "barba", "corte + barba"];
const ADMIN_WA = import.meta.env.VITE_WHATSAPP || "573001234567";

function waLink(numero, mensaje) {
  const n = String(numero || ADMIN_WA).replace(/\D/g, "");
  return `https://wa.me/${n}?text=${encodeURIComponent(mensaje)}`;
}

function mensajeCitaAdmin(turno, servicioNombre, precio) {
  return (
    `✂️ *Nueva cita — Baena Barber*\n\n` +
    `👤 Cliente: ${turno.cliente_nombre}\n` +
    (turno.cliente_telefono ? `📱 Tel: ${turno.cliente_telefono}\n` : "") +
    `💇 Servicio: ${servicioNombre}\n` +
    (precio != null
      ? `💰 Precio: $${Number(precio).toLocaleString("es-CO")}\n`
      : "") +
    `📅 Fecha: ${turno.fecha}\n` +
    `🕐 Hora: ${formatHoraAmPm(turno.hora)}`
  );
}

const MENSAJE_DUDAS =
  "Hola Baena Barber, tengo una duda / quiero más información.";

export default function Cliente() {
  const [contacto, setContacto] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [slots, setSlots] = useState([]);
  const [bloqueos, setBloqueos] = useState({ fechas: [], dias_semana: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  const adminNumero = contacto?.numero_whatsapp || ADMIN_WA;
  const linkDudas = waLink(adminNumero, MENSAJE_DUDAS);

  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    Promise.all([
      getContacto().catch(() => null),
      getServicios().catch(() => []),
      getBloqueosPublico().catch(() => ({ fechas: [], dias_semana: [] })),
    ]).then(([c, s, b]) => {
      if (c) setContacto(c);
      else {
        const phone = import.meta.env.VITE_PHONE || "+573001234567";
        setContacto({
          whatsapp: waLink(ADMIN_WA, MENSAJE_DUDAS),
          telefono: `tel:${phone}`,
          numero_whatsapp: ADMIN_WA,
        });
      }
      setBloqueos({
        fechas: b?.fechas || [],
        dias_semana: b?.dias_semana || [],
      });
      const defaults = [
        { id: "local-corte", nombre: "Corte", precio: 17000, duracion_min: 30 },
        { id: "local-barba", nombre: "Barba", precio: 10000, duracion_min: 20 },
        {
          id: "local-combo",
          nombre: "Corte + Barba",
          precio: 27000,
          duracion_min: 45,
        },
      ];
      const list = (s || [])
        .filter((x) =>
          SERVICIO_ORDER.includes(String(x.nombre).toLowerCase())
        )
        .sort(
          (a, b) =>
            SERVICIO_ORDER.indexOf(String(a.nombre).toLowerCase()) -
            SERVICIO_ORDER.indexOf(String(b.nombre).toLowerCase())
        );
      setServicios(list.length ? list : defaults);
    });
  }, []);

  useEffect(() => {
    if (!form.fecha) {
      setSlots([]);
      return;
    }

    setSlots(slotsConEstadoLocal(form.fecha));
    setLoadingSlots(true);

    let cancelled = false;
    getDisponibilidad(form.fecha)
      .then((data) => {
        if (!cancelled && Array.isArray(data.slots) && data.slots.length) {
          setSlots(data.slots);
        }
      })
      .catch(() => {})
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
    const servicioNombre = servicio?.nombre || "Servicio";
    const payload = {
      ...form,
      cliente_nombre: form.cliente_nombre.trim(),
      cliente_telefono: "",
    };

    const waAdmin = waLink(
      adminNumero,
      mensajeCitaAdmin(payload, servicioNombre, servicio?.precio)
    );

    let guardada = false;
    const esLocal = String(form.servicio_id).startsWith("local-");
    const servicioIdNum = Number(form.servicio_id);

    if (!esLocal && !Number.isNaN(servicioIdNum)) {
      try {
        await crearTurno({
          cliente_nombre: payload.cliente_nombre,
          cliente_telefono: payload.cliente_telefono,
          servicio_id: servicioIdNum,
          fecha: form.fecha,
          hora: form.hora,
        });
        guardada = true;
      } catch {
        // Si la API falla, igual se envía WhatsApp al admin
      }
    }

    window.open(waAdmin, "_blank", "noopener,noreferrer");
    setMsg(
      guardada
        ? "Cita guardada. WhatsApp abierto para avisar al administrador."
        : "WhatsApp abierto con tu cita para el administrador."
    );
    setForm(emptyForm);
    setSlots([]);
    setSaving(false);
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
          <img
            className="nav-logo"
            src="/logo-baena-barber.png"
            alt="Baena Barber"
            width="40"
            height="40"
          />
          <div className="nav-brand-text">
            <strong>Baena Barber</strong>
            <span>Barber Shop</span>
          </div>
        </div>
        <div className="client-nav-actions">
          <a className="btn btn-wa" href={linkDudas} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          {contacto?.telefono && (
            <a className="btn btn-call" href={contacto.telefono}>
              Llamar
            </a>
          )}
        </div>
      </header>

      <section className="client-hero client-hero-brand">
        <div className="hero-brand-panel">
          <img
            className="hero-logo"
            src="/logo-baena-barber.png"
            alt="Baena Barber — logo"
          />
          <BrandMark variant="hero" />
          <p className="client-lead">
            Elige el día, el horario y el servicio. Al confirmar se avisa al
            administrador por WhatsApp.
          </p>
          {msg && <p className="client-success">{msg}</p>}
        </div>
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
          <p>1) Día → 2) Hora → 3) Servicio → Confirmar (WhatsApp al admin)</p>
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
                bloqueos={bloqueos}
              />
              {form.fecha && (
                <p className="muted" style={{ marginTop: 10 }}>
                  Día seleccionado: <strong>{form.fecha}</strong>
                </p>
              )}
            </div>

            <div className="booking-step">
              <h3>2. Elige la hora</h3>
              {!form.fecha && (
                <p className="muted">
                  Selecciona un día para ver el reloj de horarios.
                </p>
              )}
              {form.fecha && (
                <SelectorHora
                  slots={slots}
                  value={form.hora}
                  loading={loadingSlots}
                  onChange={(hora) => setForm((f) => ({ ...f, hora }))}
                />
              )}
              <p className="muted slot-legend">
                Atención 9:30 a.m. – 6:00 p.m. · cada 30 min · tachado = ocupado /
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

          <button type="submit" className="btn btn-wa btn-block" disabled={saving}>
            {saving ? "Abriendo WhatsApp…" : "Confirmar cita por WhatsApp"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </section>

      <footer className="client-footer">
        <div className="footer-brand">
          <img src="/logo-baena-barber.png" alt="" width="48" height="48" />
          <div>
            <strong>Baena Barber</strong>
            <p>Barber Shop · Corte · Barba · Combo</p>
          </div>
        </div>
        <div className="contact-actions">
          <a className="btn btn-wa" href={linkDudas} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          {contacto?.telefono && (
            <a className="btn btn-call" href={contacto.telefono}>
              Llamar
            </a>
          )}
        </div>
      </footer>

      {/* Ícono flotante para dudas */}
      <a
        className="wa-fab"
        href={linkDudas}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp — dudas o preguntas"
        title="¿Dudas? Escríbenos por WhatsApp"
      >
        <span className="wa-fab-icon" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor">
            <path d="M16.1 3C9.5 3 4.1 8.3 4.1 14.9c0 2.1.6 4.1 1.6 5.9L4 28.1l7.5-1.9c1.7.9 3.6 1.4 5.5 1.4 6.6 0 12-5.4 12-12S22.7 3 16.1 3zm0 21.9c-1.8 0-3.5-.5-5-1.3l-.4-.2-4.4 1.1 1.2-4.3-.2-.4c-1-1.6-1.5-3.4-1.5-5.2 0-5.5 4.5-10 10-10s10 4.5 10 10-4.2 10.3-9.7 10.3zm5.5-7.5c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.2-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.8.8 2.5.8 3.4.7.5-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4 0-.1-.3-.2-.6-.3z" />
          </svg>
        </span>
        <span className="wa-fab-label">¿Dudas?</span>
      </a>
    </div>
  );
}
