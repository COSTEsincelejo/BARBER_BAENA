const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

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
