import React, { useEffect, useState } from "react";
import { getMovimientos, getResumenFinanciero, crearMovimiento, eliminarMovimiento } from "../api.js";

export default function Finanzas() {
  const [movimientos, setMovimientos] = useState([]);
  const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, balance: 0 });
  const [form, setForm] = useState({ tipo: "ingreso", concepto: "", monto: "", fecha: "" });
  const [error, setError] = useState("");

  async function cargar() {
    const [m, r] = await Promise.all([getMovimientos(), getResumenFinanciero()]);
    setMovimientos(m);
    setResumen(r);
  }

  useEffect(() => { cargar(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await crearMovimiento({ ...form, monto: Number(form.monto) });
      setForm({ tipo: "ingreso", concepto: "", monto: "", fecha: "" });
      cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este movimiento?")) return;
    await eliminarMovimiento(id);
    cargar();
  }

  return (
    <div>
      <h2>Ingresos y gastos</h2>

      <div className="card">
        <div className="stat">
          <div className="stat-box">
            <div className="label">Total ingresos</div>
            <div className="value">${resumen.ingresos.toLocaleString()}</div>
          </div>
          <div className="stat-box">
            <div className="label">Total gastos</div>
            <div className="value">${resumen.gastos.toLocaleString()}</div>
          </div>
          <div className="stat-box">
            <div className="label">Balance</div>
            <div className="value">${resumen.balance.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Registrar movimiento</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div>
              <label>Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="ingreso">Ingreso</option>
                <option value="gasto">Gasto</option>
              </select>
            </div>
            <div>
              <label>Monto ($)</label>
              <input type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} required />
            </div>
          </div>
          <label>Concepto</label>
          <input value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} placeholder="Ej: Compra de productos, propina, arriendo..." required />
          <label>Fecha (opcional, por defecto hoy)</label>
          <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
          <button type="submit" className="btn-primary">Registrar</button>
        </form>
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      </div>

      <div className="card">
        <h3>Historial</h3>
        <table>
          <thead>
            <tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Monto</th><th></th></tr>
          </thead>
          <tbody>
            {movimientos.map((m) => (
              <tr key={m.id}>
                <td>{m.fecha?.slice(0, 10)}</td>
                <td><span className={`badge ${m.tipo === "ingreso" ? "badge-completado" : "badge-cancelado"}`}>{m.tipo}</span></td>
                <td>{m.concepto}</td>
                <td>${Number(m.monto).toLocaleString()}</td>
                <td><button className="btn-danger" onClick={() => eliminar(m.id)}>✕</button></td>
              </tr>
            ))}
            {movimientos.length === 0 && (
              <tr><td colSpan={5}>No hay movimientos registrados aún.</td></tr>
            )}
          </tbody>
        </table>
        <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
          Nota: los ingresos por servicios completados se registran automáticamente al marcar un turno como "completado".
        </p>
      </div>
    </div>
  );
}
