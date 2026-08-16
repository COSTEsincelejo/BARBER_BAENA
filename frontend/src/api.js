const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("barberia_admin_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 && path !== "/auth/login") {
      localStorage.removeItem("barberia_admin_token");
      localStorage.removeItem("barberia_admin_info");
      window.location.href = "/admin/login";
    }
    const err = new Error(body.error || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export const loginAdmin = (username, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });

// Servicios
export const getServicios = () => request("/servicios");
export const crearServicio = (data) =>
  request("/servicios", { method: "POST", body: JSON.stringify(data) });
export const cotizar = (servicio_ids) =>
  request("/servicios/cotizar", { method: "POST", body: JSON.stringify({ servicio_ids }) });

// Turnos
export const getTurnos = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/turnos${qs ? `?${qs}` : ""}`);
};
export const crearTurno = (data) =>
  request("/turnos", { method: "POST", body: JSON.stringify(data) });
export const getDisponibilidad = (fecha, servicio_id) => {
  const params = new URLSearchParams({ fecha });
  if (servicio_id != null && servicio_id !== "") {
    params.set("servicio_id", servicio_id);
  }
  return request(`/turnos/disponibilidad?${params.toString()}`);
};
export const actualizarEstadoTurno = (id, estado) =>
  request(`/turnos/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estado }) });
export const eliminarTurno = (id) => request(`/turnos/${id}`, { method: "DELETE" });

// Finanzas
export const getMovimientos = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/finanzas${qs ? `?${qs}` : ""}`);
};
export const getResumenFinanciero = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/finanzas/resumen${qs ? `?${qs}` : ""}`);
};
export const crearMovimiento = (data) =>
  request("/finanzas", { method: "POST", body: JSON.stringify(data) });
export const eliminarMovimiento = (id) => request(`/finanzas/${id}`, { method: "DELETE" });
