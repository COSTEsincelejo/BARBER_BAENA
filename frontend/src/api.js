import { getToken, clearSession } from "./auth.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}, { auth = false } = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && auth) {
    clearSession();
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const getContacto = () => request("/contacto");
export const getServicios = () => request("/servicios");
export const getBloqueosPublico = () => request("/bloqueos/publico");

export const getDisponibilidad = (fecha) =>
  request(`/turnos/disponibilidad?fecha=${encodeURIComponent(fecha)}`);
export const crearTurno = (data) =>
  request("/turnos", { method: "POST", body: JSON.stringify(data) });

// Auth
export const loginAdmin = (usuario, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ usuario, password }),
  });
export const getMe = () => request("/auth/me", {}, { auth: true });

// Admin — citas
export const getTurnos = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/admin/turnos${qs ? `?${qs}` : ""}`, {}, { auth: true });
};
export const actualizarEstadoTurno = (id, estado) =>
  request(
    `/admin/turnos/${id}/estado`,
    { method: "PATCH", body: JSON.stringify({ estado }) },
    { auth: true }
  );
export const marcarPagoTurno = (id, data) =>
  request(
    `/admin/turnos/${id}/pago`,
    { method: "PATCH", body: JSON.stringify(data) },
    { auth: true }
  );
export const eliminarTurno = (id) =>
  request(`/admin/turnos/${id}`, { method: "DELETE" }, { auth: true });

// Admin — clientes
export const getClientes = (q = "") =>
  request(`/admin/clientes${q ? `?q=${encodeURIComponent(q)}` : ""}`, {}, { auth: true });
export const getCliente = (id) =>
  request(`/admin/clientes/${id}`, {}, { auth: true });
export const actualizarCliente = (id, data) =>
  request(
    `/admin/clientes/${id}`,
    { method: "PATCH", body: JSON.stringify(data) },
    { auth: true }
  );

// Admin — reportes
export const getReportes = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/admin/reportes${qs ? `?${qs}` : ""}`, {}, { auth: true });
};

// Admin — bloqueos
export const getBloqueosAdmin = () =>
  request("/admin/bloqueos", {}, { auth: true });
export const crearBloqueo = (data) =>
  request(
    "/admin/bloqueos",
    { method: "POST", body: JSON.stringify(data) },
    { auth: true }
  );
export const eliminarBloqueo = (id) =>
  request(`/admin/bloqueos/${id}`, { method: "DELETE" }, { auth: true });

// Admin — finanzas
export const getMovimientos = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/admin/finanzas${qs ? `?${qs}` : ""}`, {}, { auth: true });
};
export const getResumenFinanciero = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(
    `/admin/finanzas/resumen${qs ? `?${qs}` : ""}`,
    {},
    { auth: true }
  );
};
export const crearMovimiento = (data) =>
  request(
    "/admin/finanzas",
    { method: "POST", body: JSON.stringify(data) },
    { auth: true }
  );
export const eliminarMovimiento = (id) =>
  request(`/admin/finanzas/${id}`, { method: "DELETE" }, { auth: true });

// Admin — cotizaciones / servicios
export const getCotizaciones = () =>
  request("/admin/cotizaciones", {}, { auth: true });
export const previewCotizacion = (servicio_ids) =>
  request(
    "/admin/cotizaciones/preview",
    { method: "POST", body: JSON.stringify({ servicio_ids }) },
    { auth: true }
  );
export const crearCotizacion = (data) =>
  request(
    "/admin/cotizaciones",
    { method: "POST", body: JSON.stringify(data) },
    { auth: true }
  );
export const actualizarEstadoCotizacion = (id, estado) =>
  request(
    `/admin/cotizaciones/${id}/estado`,
    { method: "PATCH", body: JSON.stringify({ estado }) },
    { auth: true }
  );
export const eliminarCotizacion = (id) =>
  request(`/admin/cotizaciones/${id}`, { method: "DELETE" }, { auth: true });

export const crearServicio = (data) =>
  request(
    "/admin/servicios",
    { method: "POST", body: JSON.stringify(data) },
    { auth: true }
  );
export const eliminarServicio = (id) =>
  request(`/admin/servicios/${id}`, { method: "DELETE" }, { auth: true });
