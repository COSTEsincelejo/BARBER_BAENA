import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BrandMark from "../components/BrandMark.jsx";
import PanelFinanzas from "../panels/Finanzas.jsx";
import PanelBloqueos from "../panels/Bloqueos.jsx";
import PanelCitas from "../panels/Citas.jsx";
import PanelClientes from "../panels/Clientes.jsx";
import PanelReportes from "../panels/Reportes.jsx";
import {
  clearSession,
  getStoredAdmin,
  getToken,
  isLoggedIn,
  setSession,
} from "../auth.js";
import { loginAdmin, getMe } from "../api.js";

const TABS = [
  { id: "citas", label: "Citas", hint: "Agenda" },
  { id: "clientes", label: "Clientes", hint: "Historial" },
  { id: "reportes", label: "Reportes", hint: "Ingresos / no-shows" },
  { id: "bloqueos", label: "Bloqueos", hint: "Días sin servicio" },
  { id: "finanzas", label: "Caja", hint: "Manual" },
];

function AdminLogin({ onSuccess }) {
  const [usuario, setUsuario] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginAdmin(usuario.trim(), password);
      setSession(data.token, data.admin);
      onSuccess(data.admin);
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app admin-app is-ready">
      <div className="bg-glow bg-glow-a" aria-hidden="true" />
      <div className="pole-stripe" aria-hidden="true" />
      <div className="shell" style={{ maxWidth: 440 }}>
        <div className="hero-brand-panel" style={{ marginBottom: 16 }}>
          <img
            className="hero-logo"
            src="/logo-baena-barber.png"
            alt="Baena Barber"
            style={{ width: 140 }}
          />
          <BrandMark variant="compact" />
        </div>
        <header className="section-head">
          <h2>Acceso administrador</h2>
          <p>Área privada. El cliente no tiene acceso aquí.</p>
        </header>
        <form className="surface form-block" onSubmit={submit}>
          <label htmlFor="admin_user">Usuario</label>
          <input
            id="admin_user"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            required
          />
          <label htmlFor="admin_pass">Contraseña</label>
          <input
            id="admin_pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Entrando…" : "Iniciar sesión"}
          </button>
          {error && <p className="error">{error}</p>}
          <p className="muted" style={{ marginTop: 12 }}>
            <Link to="/" style={{ color: "inherit" }}>
              ← Volver al sitio público
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function Admin() {
  const [admin, setAdmin] = useState(() => getStoredAdmin());
  const [checking, setChecking] = useState(() => isLoggedIn());
  const [tab, setTab] = useState("citas");
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (!getToken()) {
      setChecking(false);
      return;
    }
    getMe()
      .then((data) => {
        setAdmin(data.admin);
        setChecking(false);
      })
      .catch(() => {
        clearSession();
        setAdmin(null);
        setChecking(false);
      });
  }, []);

  if (checking) {
    return (
      <div className="app admin-app is-ready">
        <div className="shell">
          <p className="muted">Verificando sesión…</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin onSuccess={setAdmin} />;
  }

  function logout() {
    clearSession();
    setAdmin(null);
  }

  return (
    <div className={`app admin-app ${entered ? "is-ready" : ""}`}>
      <div className="bg-glow bg-glow-a" aria-hidden="true" />
      <div className="bg-glow bg-glow-b" aria-hidden="true" />
      <div className="pole-stripe" aria-hidden="true" />

      <div className="shell">
        <header className="hero-bar">
          <div className="brand-lockup">
            <div className="admin-brand-row">
              <img
                className="nav-logo"
                src="/logo-baena-barber.png"
                alt="Baena Barber"
                width="48"
                height="48"
              />
              <div>
                <BrandMark variant="compact" />
                <p className="brand-tag">
                  Panel privado · {admin.usuario}
                </p>
              </div>
            </div>
          </div>

          <div className="hero-meta">
            <div className="contact-actions">
              <Link className="btn btn-secondary" to="/">
                Sitio cliente
              </Link>
              <button type="button" className="btn btn-call" onClick={logout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        <nav className="tabs tabs-admin" role="tablist" aria-label="Admin">
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
          {tab === "citas" && <PanelCitas />}
          {tab === "clientes" && <PanelClientes />}
          {tab === "reportes" && <PanelReportes />}
          {tab === "bloqueos" && <PanelBloqueos />}
          {tab === "finanzas" && <PanelFinanzas />}
        </main>
      </div>
    </div>
  );
}
