import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getContacto } from "../api.js";
import PanelTurnos from "../panels/Turnos.jsx";
import PanelCotizaciones from "../panels/Cotizaciones.jsx";
import PanelFinanzas from "../panels/Finanzas.jsx";

const TABS = [
  { id: "turnos", label: "Turnos", hint: "Agenda" },
  { id: "cotizaciones", label: "Cotizaciones", hint: "Presupuestos" },
  { id: "finanzas", label: "Caja", hint: "Ingresos / gastos" },
];

const ADMIN_KEY = "baena_admin_ok";
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || "baena2026";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function AdminLogin({ onSuccess }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (pin.trim() === ADMIN_PIN) {
      sessionStorage.setItem(ADMIN_KEY, "1");
      onSuccess();
      return;
    }
    setError("Clave incorrecta");
  }

  return (
    <div className="app admin-app is-ready">
      <div className="bg-glow bg-glow-a" aria-hidden="true" />
      <div className="pole-stripe" aria-hidden="true" />
      <div className="shell" style={{ maxWidth: 440 }}>
        <header className="section-head">
          <h2>Acceso administrador</h2>
          <p>Solo personal de Baena Barber.</p>
        </header>
        <form className="surface form-block" onSubmit={submit}>
          <label htmlFor="admin_pin">Clave</label>
          <input
            id="admin_pin"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
            required
          />
          <button type="submit" className="btn btn-primary">
            Entrar
          </button>
          {error && <p className="error">{error}</p>}
          <p className="muted" style={{ marginTop: 12 }}>
            <Link to="/" style={{ color: "inherit" }}>
              ← Volver al sitio
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(ADMIN_KEY) === "1"
  );
  const [tab, setTab] = useState("turnos");
  const [contacto, setContacto] = useState(null);
  const [entered, setEntered] = useState(false);
  const now = useClock();

  useEffect(() => {
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (!authed) return;
    getContacto()
      .then(setContacto)
      .catch(() => {
        const wa = import.meta.env.VITE_WHATSAPP || "573001234567";
        const phone = import.meta.env.VITE_PHONE || "+573001234567";
        setContacto({
          whatsapp: `https://wa.me/${wa}?text=${encodeURIComponent(
            "Hola Baena Barber, quiero agendar un turno."
          )}`,
          telefono: `tel:${phone}`,
        });
      });
  }, [authed]);

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  const hora = now.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const fecha = now.toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  function logout() {
    sessionStorage.removeItem(ADMIN_KEY);
    setAuthed(false);
  }

  return (
    <div className={`app admin-app ${entered ? "is-ready" : ""}`}>
      <div className="bg-glow bg-glow-a" aria-hidden="true" />
      <div className="bg-glow bg-glow-b" aria-hidden="true" />
      <div className="pole-stripe" aria-hidden="true" />

      <div className="shell">
        <header className="hero-bar">
          <div className="brand-lockup">
            <div className="brand-mark-wrap">
              <span className="brand-scissors" aria-hidden="true">
                ✂
              </span>
              <h1 className="brand-mark">Baena Barber</h1>
            </div>
            <p className="brand-tag">Panel administrador</p>
          </div>

          <div className="hero-meta">
            <div className="live-clock">
              <span className="live-dot" aria-hidden="true" />
              <div>
                <strong>{hora}</strong>
                <span>{fecha}</span>
              </div>
            </div>
            <div className="contact-actions">
              <Link className="btn btn-secondary" to="/">
                Sitio cliente
              </Link>
              <button type="button" className="btn btn-call" onClick={logout}>
                Salir
              </button>
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
          </div>
        </header>

        <nav className="tabs" role="tablist" aria-label="Secciones del admin">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? "tab active" : "tab"}
              onClick={() => setTab(t.id)}
            >
              <span className="tab-label">{t.label}</span>
              <span className="tab-hint">{t.hint}</span>
            </button>
          ))}
        </nav>

        <main className="panel" key={tab}>
          {tab === "turnos" && <PanelTurnos />}
          {tab === "cotizaciones" && <PanelCotizaciones />}
          {tab === "finanzas" && <PanelFinanzas />}
        </main>
      </div>
    </div>
  );
}
