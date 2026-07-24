import React, { useEffect, useState } from "react";
import { getContacto } from "./api.js";
import PanelTurnos from "./panels/Turnos.jsx";
import PanelCotizaciones from "./panels/Cotizaciones.jsx";
import PanelFinanzas from "./panels/Finanzas.jsx";

const TABS = [
  { id: "turnos", label: "Turnos" },
  { id: "cotizaciones", label: "Cotizaciones" },
  { id: "finanzas", label: "Ingresos / Gastos" },
];

export default function App() {
  const [tab, setTab] = useState("turnos");
  const [contacto, setContacto] = useState(null);

  useEffect(() => {
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
  }, []);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand-block">
          <p className="brand-mark">Baena Barber</p>
          <p className="brand-sub">Panel de gestión</p>
        </div>

        <nav className="tabs" role="tablist" aria-label="Secciones">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? "tab active" : "tab"}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

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
      </header>

      <main className="panel">
        {tab === "turnos" && <PanelTurnos />}
        {tab === "cotizaciones" && <PanelCotizaciones />}
        {tab === "finanzas" && <PanelFinanzas />}
      </main>
    </div>
  );
}
