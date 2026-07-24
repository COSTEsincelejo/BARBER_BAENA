import React, { useEffect, useState } from "react";
import {
  getTurnos,
  actualizarEstadoTurno,
  eliminarTurno,
  marcarPagoTurno,
} from "../api.js";
import { formatHoraAmPm } from "../utils/horarios.js";

const ESTADOS = [
  "pendiente",
  "confirmado",
  "completado",
  "cancelado",
  "no_asistio",
];

export default function PanelCitas() {
  const [citas, setCitas] = useState([]);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [fecha, setFecha] = useState("");
  const [estado, setEstado] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function cargar(params = {}) {
    setLoading(true);
    setError("");
    try {
      const filters = {};
      if (params.fecha ?? fecha) filters.fecha = params.fecha ?? fecha;
      if (params.desde ?? desde) filters.desde = params.desde ?? desde;
      if (params.hasta ?? hasta) filters.hasta = params.hasta ?? hasta;
      if (params.estado ?? estado) filters.estado = params.estado ?? estado;
      if (filters.fecha) {
        delete filters.desde;
        delete filters.hasta;
      }
      setCitas(await getTurnos(filters));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function aplicarFiltros(e) {
    e.preventDefault();
    cargar();
  }

  function limpiar() {
    setFecha("");
    setDesde("");
    setHasta("");
    setEstado("");
    cargar({ fecha: "", desde: "", hasta: "", estado: "" });
  }

  async function cambiarEstado(id, nuevo) {
    await actualizarEstadoTurno(id, nuevo);
    await cargar();
  }

  async function marcarNequi(id) {
    await marcarPagoTurno(id, {
      pago_estado: "pagado",
      pago_metodo: "nequi",
    });
    await cargar();
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar esta cita?")) return;
    await eliminarTurno(id);
    await cargar();
  }

  return (
    <section className="section">
      <header className="section-head">
        <h2>Citas agendadas</h2>
        <p>Filtra, confirma, marca no-show o pago Nequi.</p>
      </header>

      <form className="surface filter-bar" onSubmit={aplicarFiltros}>
        <div className="grid-2">
          <div>
            <label htmlFor="f_dia">Día exacto</label>
            <input
              id="f_dia"
              type="date"
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value);
                if (e.target.value) {
                  setDesde("");
                  setHasta("");
                }
              }}
            />
          </div>
          <div>
            <label htmlFor="f_estado">Estado</label>
            <select
              id="f_estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos</option>
              {ESTADOS.map((es) => (
                <option key={es} value={es}>
                  {es}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid-2">
          <div>
            <label htmlFor="f_desde">Desde</label>
            <input
              id="f_desde"
              type="date"
              value={desde}
              disabled={Boolean(fecha)}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="f_hasta">Hasta</label>
            <input
              id="f_hasta"
              type="date"
              value={hasta}
              disabled={Boolean(fecha)}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
        </div>
        <div className="row-actions">
          <button type="submit" className="btn btn-primary">
            Filtrar
          </button>
          <button type="button" className="btn btn-secondary" onClick={limpiar}>
            Limpiar
          </button>
        </div>
      </form>

      <div className="surface" style={{ marginTop: 16 }}>
        {loading ? (
          <p className="muted">Cargando citas…</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : citas.length === 0 ? (
          <div className="empty">
            <strong>Sin citas</strong>
            No hay resultados con estos filtros.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Pago</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {citas.map((c) => (
                  <tr key={c.id}>
                    <td>{String(c.fecha).slice(0, 10)}</td>
                    <td>{formatHoraAmPm(String(c.hora).slice(0, 5))}</td>
                    <td>
                      <strong>{c.cliente_nombre}</strong>
                      {c.cliente_telefono && (
                        <>
                          <br />
                          <span className="muted">{c.cliente_telefono}</span>
                        </>
                      )}
                    </td>
                    <td>
                      {c.servicio_nombre || "—"}
                      {c.monto != null && (
                        <>
                          <br />
                          <span className="muted">
                            ${Number(c.monto).toLocaleString("es-CO")}
                          </span>
                        </>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          c.pago_estado === "pagado"
                            ? "badge-completado"
                            : "badge-pendiente"
                        }`}
                      >
                        {c.pago_estado || "pendiente"}
                        {c.pago_metodo ? ` · ${c.pago_metodo}` : ""}
                      </span>
                      {c.pago_estado !== "pagado" && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ marginTop: 6, display: "block" }}
                          onClick={() => marcarNequi(c.id)}
                        >
                          Marcar Nequi
                        </button>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${c.estado}`}>{c.estado}</span>
                      <select
                        className="select-compact"
                        style={{ marginTop: 8, display: "block" }}
                        value={c.estado}
                        onChange={(e) => cambiarEstado(c.id, e.target.value)}
                      >
                        {ESTADOS.map((es) => (
                          <option key={es} value={es}>
                            {es}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => eliminar(c.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
