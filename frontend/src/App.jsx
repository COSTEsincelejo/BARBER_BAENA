import React from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import Turnos from "./pages/Turnos.jsx";
import Cotizacion from "./pages/Cotizacion.jsx";
import Finanzas from "./pages/Finanzas.jsx";
import Reservar from "./pages/Reservar.jsx";
import Login from "./pages/admin/Login.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function AdminLayout() {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>💈 Barbería</h1>
        {admin?.username && <p className="sidebar-user">{admin.username}</p>}
        <nav>
          <NavLink to="/admin/turnos" className={({ isActive }) => (isActive ? "active" : "")}>
            Turnos
          </NavLink>
          <NavLink to="/admin/cotizacion" className={({ isActive }) => (isActive ? "active" : "")}>
            Cotización
          </NavLink>
          <NavLink to="/admin/finanzas" className={({ isActive }) => (isActive ? "active" : "")}>
            Ingresos / Gastos
          </NavLink>
        </nav>
        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

function AdminRootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/admin/turnos" : "/admin/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/reservar" replace />} />
          <Route path="/reservar" element={<Reservar />} />
          <Route path="/turnos" element={<Navigate to="/admin/turnos" replace />} />
          <Route path="/cotizacion" element={<Navigate to="/admin/cotizacion" replace />} />
          <Route path="/finanzas" element={<Navigate to="/admin/finanzas" replace />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminRootRedirect />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/turnos" element={<Turnos />} />
              <Route path="/admin/cotizacion" element={<Cotizacion />} />
              <Route path="/admin/finanzas" element={<Finanzas />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
