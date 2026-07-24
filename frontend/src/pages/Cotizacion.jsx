import React, { useEffect, useState } from "react";
import { getServicios, crearServicio, cotizar } from "../api.js";

export default function Cotizacion() {
  const [servicios, setServicios] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", duracion_min: "" });
  const [error, setError] = useState("");

  async function cargar() {
    const s = await getServicios();
    setServicios(s);
  }

  useEffect(() => { cargar(); }, []);

  function toggle(id) {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function calcular() {
    if (seleccionados.length === 0) return;
    const r = await cotizar(seleccionados);
    setResultado(r);
  }

  async function agregarServicio(e) {
    e.preventDefault();
    setError("");
    try {
      await crearServicio({
        nombre: nuevo.nombre,
        precio: Number(nuevo.precio),
        duracion_min: Number(nuevo.duracion_min) || 30,
      });
      setNuevo({ nombre: "", precio: "", duracion_min: "" });
      cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <h2>Cotización de servicios</h2>

      <div className="card">
        <h3>Selecciona los servicios a cotizar</h3>
        {servicios.map((s) => (
          <div className="checkbox-row" key={s.id}>
            <input
              type="checkbox"
              checked={seleccionados.includes(s.id)}
              onChange={() => toggle(s.id)}
            />
            <span>{s.nombre} — ${Number(s.precio).toLocaleString()} ({s.duracion_min} min)</span>
          </div>
        ))}
        <button className="btn-primary" onClick={calcular}>Calcular cotización</button>

        {resultado && (
          <div style={{ marginTop: 16 }}>
            <p><strong>Servicios:</strong> {resultado.servicios.map((s) => s.nombre).join(", ")}</p>
            <p>Duración estimada: {resultado.duracion_total} min</p>
            <p className="total-line">Total: ${resultado.total.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Agregar nuevo servicio al catálogo</h3>
        <form onSubmit={agregarServicio}>
          <div className="grid-2">
            <div>
              <label>Nombre</label>
              <input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} required />
            </div>
            <div>
              <label>Precio ($)</label>
              <input type="number" value={nuevo.precio} onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })} required />
            </div>
          </div>
          <label>Duración (minutos)</label>
          <input type="number" value={nuevo.duracion_min} onChange={(e) => setNuevo({ ...nuevo, duracion_min: e.target.value })} placeholder="30" />
          <button type="submit" className="btn-primary">Agregar servicio</button>
        </form>
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      </div>
    </div>
  );
}
