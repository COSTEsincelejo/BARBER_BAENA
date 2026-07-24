import React, { useEffect, useState } from "react";
import {
  getMovimientos,
  getResumenFinanciero,
  crearMovimiento,
  eliminarMovimiento,
} from "../api.js";

export default function PanelFinanzas() {
  const [movimientos, setMovimientos] = useState([]);
  const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, balance: 0 });
  const [form, setForm] = useState({
    tipo: "ingreso",
    concepto: "",
    monto: "",
    fecha: "",
  });
  const [error, setError] = useState("");

  async function cargar() {
    const [m, r] = await Promise.all([getMovimientos(), getResumenFinanciero()]);
    setMovimientos(m);
    setResumen(r);
  }

  useEffect(() => {
    cargar().catch((e) => setError(e.message));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await crearMovimiento({ ...form, monto: Number(form.monto) });
      setForm({ tipo: "ingreso", concepto: "", monto: "", fecha: "" });
      await cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section className="section">
      <header className="section-head">
        <h2>Ingresos y gastos</h2>
        <p>
          Registra movimientos. Al marcar un turno como completado se crea el
          ingreso automáticamente.
        </p>
      </header>

      <div className="stats">
        <div className="stat">
          <span className="stat-label">Ingresos</span>
          <span className="stat-value income">
            ${Number(resumen.ingresos).toLocaleString("es-CO")}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Gastos</span>
          <span className="stat-value expense">
            ${Number(resumen.gastos).toLocaleString("es-CO")}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Balance</span>
          <span className="stat-value">
            ${Number(resumen.balance).toLocaleString("es-CO")}
          </span>
        </div>
      </div>

      <div className="layout-split">
        <form className="surface form-block" onSubmit={handleSubmit}>
          <h3>Registrar movimiento</h3>
          <div className="grid-2">
            <div>
              <label htmlFor="tipo">Tipo</label>
              <select
                id="tipo"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              >
                <option value="ingreso">Ingreso</option>
                <option value="gasto">Gasto</option>
              </select>
            </div>
            <div>
              <label htmlFor="monto">Monto ($)</label>
              <input
                id="monto"
                type="number"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                required
              />
            </div>
          </div>
          <label htmlFor="concepto">Concepto</label>
          <input
            id="concepto"
            value={form.concepto}
            onChange={(e) => setForm({ ...form, concepto: e.target.value })}
            placeholder="Productos, arriendo, propina…"
            required
          />
          <label htmlFor="fecha_mov">Fecha (opcional)</label>
          <input
            id="fecha_mov"
            type="date"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          />
          <button type="submit" className="btn btn-primary">
            Registrar
          </button>
          {error && <p className="error">{error}</p>}
        </form>

        <div className="surface">
          <h3>Historial</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Concepto</th>
                  <th>Monto</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => (
                  <tr key={m.id}>
                    <td>{String(m.fecha).slice(0, 10)}</td>
                    <td>
                      <span
                        className={`pill ${
                          m.tipo === "ingreso" ? "pill-ok" : "pill-bad"
                        }`}
                      >
                        {m.tipo}
                      </span>
                    </td>
                    <td>{m.concepto}</td>
                    <td>${Number(m.monto).toLocaleString("es-CO")}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() =>
                          confirm("¿Eliminar movimiento?") &&
                          eliminarMovimiento(m.id).then(cargar)
                        }
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                {movimientos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="muted">
                      Sin movimientos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
