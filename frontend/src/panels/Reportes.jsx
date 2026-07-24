import React, { useEffect, useState } from "react";
import { getReportes } from "../api.js";

export default function PanelReportes() {
  const [periodo, setPeriodo] = useState("semana");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function cargar(p = periodo) {
    setLoading(true);
    setError("");
    try {
      setData(await getReportes({ periodo: p }));
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

  return (
    <section className="section">
      <header className="section-head">
        <h2>Reportes</h2>
        <p>Ingresos, servicio más vendido y no-shows.</p>
      </header>

      <div className="row-actions" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className={periodo === "semana" ? "btn btn-primary" : "btn btn-secondary"}
          onClick={() => {
            setPeriodo("semana");
            cargar("semana");
          }}
        >
          Esta semana
        </button>
        <button
          type="button"
          className={periodo === "mes" ? "btn btn-primary" : "btn btn-secondary"}
          onClick={() => {
            setPeriodo("mes");
            cargar("mes");
          }}
        >
          Este mes
        </button>
      </div>

      {loading && <p className="muted">Cargando…</p>}
      {error && <p className="error">{error}</p>}

      {data && !loading && (
        <>
          <p className="muted">
            Del {data.desde} al {data.hasta}
          </p>
          <div className="stats">
            <div className="stat">
              <span className="stat-label">Ingresos</span>
              <span className="stat-value income">
                ${Number(data.ingresos).toLocaleString("es-CO")}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Gastos</span>
              <span className="stat-value expense">
                ${Number(data.gastos).toLocaleString("es-CO")}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">No-shows</span>
              <span className="stat-value">{data.no_shows}</span>
            </div>
          </div>

          <div className="layout-split">
            <div className="surface">
              <h3>Servicio más vendido</h3>
              {data.servicio_mas_vendido ? (
                <p className="total">
                  {data.servicio_mas_vendido.nombre}
                  <br />
                  <span className="muted">
                    {data.servicio_mas_vendido.cantidad} citas · $
                    {Number(data.servicio_mas_vendido.ingresos).toLocaleString(
                      "es-CO"
                    )}
                  </span>
                </p>
              ) : (
                <p className="muted">Sin servicios completados en el período.</p>
              )}
            </div>
            <div className="surface">
              <h3>Por servicio</h3>
              {(data.servicios || []).length === 0 ? (
                <p className="muted">Sin datos.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Servicio</th>
                        <th>Cant.</th>
                        <th>Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.servicios.map((s) => (
                        <tr key={s.nombre}>
                          <td>{s.nombre}</td>
                          <td>{s.cantidad}</td>
                          <td>${Number(s.ingresos).toLocaleString("es-CO")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
