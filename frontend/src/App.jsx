import React from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import Turnos from "./pages/Turnos.jsx";
import Cotizacion from "./pages/Cotizacion.jsx";
import Finanzas from "./pages/Finanzas.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <aside className="sidebar">
          <h1>💈 Barbería</h1>
          <nav>
            <NavLink to="/turnos" className={({ isActive }) => (isActive ? "active" : "")}>
              Turnos
            </NavLink>
            <NavLink to="/cotizacion" className={({ isActive }) => (isActive ? "active" : "")}>
              Cotización
            </NavLink>
            <NavLink to="/finanzas" className={({ isActive }) => (isActive ? "active" : "")}>
              Ingresos / Gastos
            </NavLink>
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/turnos" replace />} />
            <Route path="/turnos" element={<Turnos />} />
            <Route path="/cotizacion" element={<Cotizacion />} />
            <Route path="/finanzas" element={<Finanzas />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
