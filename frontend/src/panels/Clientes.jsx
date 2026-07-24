import React, { useEffect, useState } from "react";
import {
  getClientes,
  getCliente,
  actualizarCliente,
} from "../api.js";
import { formatHoraAmPm } from "../utils/horarios.js";

export default function PanelClientes() {
  const [q, setQ] = useState("");
  const [lista, setLista] = useState([]);
  const [sel, setSel] = useState(null);
  const [form, setForm] = useState({
    notas: "",
    alergias: "",
    preferencias: "",
  });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function buscar(e) {
    e?.preventDefault?.();
    setError("");
    try {
      setLista(await getClientes(q));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function abrir(id) {
    setMsg("");
    try {
      const c = await getCliente(id);
      setSel(c);
      setForm({
        notas: c.notas || "",
        alergias: c.alergias || "",
        preferencias: c.preferencias || "",
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function guardar(e) {
    e.preventDefault();
    if (!sel) return;
    try {
      const updated = await actualizarCliente(sel.id, form);
      setSel({ ...sel, ...updated });
      setMsg("Notas guardadas.");
      buscar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="section">
      <header className="section-head">
        <h2>Historial de clientes</h2>
        <p>Visitas, notas, alergias y preferencias (ej. fade alto).</p>
      </header>

      <form className="surface filter-bar" onSubmit={buscar}>
        <label htmlFor="cli_q">Buscar</label>
        <input
          id="cli_q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre o teléfono"
        />
        <button type="submit" className="btn btn-primary">
          Buscar
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="layout-split" style={{ marginTop: 16 }}>
        <div className="surface">
          <h3>Clientes</h3>
          {lista.length === 0 ? (
            <p className="muted">Sin clientes aún.</p>
          ) : (
            <ul className="block-list">
              {lista.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ textAlign: "left", flex: 1 }}
                    onClick={() => abrir(c.id)}
                  >
                    <strong>{c.nombre}</strong>
                    <br />
                    <span className="muted">
                      {c.telefono || "sin tel."} · {c.total_visitas || 0} visitas
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="surface">
          {!sel ? (
            <p className="muted">Selecciona un cliente.</p>
          ) : (
            <>
              <h3>{sel.nombre}</h3>
              <p className="muted">{sel.telefono || "Sin teléfono"}</p>
              {msg && <p className="client-success">{msg}</p>}
              <form onSubmit={guardar}>
                <label htmlFor="alergias">Alergias</label>
                <textarea
                  id="alergias"
                  rows={2}
                  value={form.alergias}
                  onChange={(e) => setForm({ ...form, alergias: e.target.value })}
                  placeholder="Ej: sensibilidad al alcohol…"
                />
                <label htmlFor="preferencias">Preferencias</label>
                <textarea
                  id="preferencias"
                  rows={2}
                  value={form.preferencias}
                  onChange={(e) =>
                    setForm({ ...form, preferencias: e.target.value })
                  }
                  placeholder="Ej: fade alto, barba perfilada…"
                />
                <label htmlFor="notas">Notas</label>
                <textarea
                  id="notas"
                  rows={3}
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                />
                <button type="submit" className="btn btn-primary">
                  Guardar historial
                </button>
              </form>

              <hr className="divider" />
              <h3>Últimas visitas</h3>
              {(sel.historial || []).length === 0 ? (
                <p className="muted">Sin visitas registradas.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Servicio</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sel.historial.map((t) => (
                        <tr key={t.id}>
                          <td>{String(t.fecha).slice(0, 10)}</td>
                          <td>{formatHoraAmPm(String(t.hora).slice(0, 5))}</td>
                          <td>{t.servicio_nombre || "—"}</td>
                          <td>
                            <span className={`badge badge-${t.estado}`}>
                              {t.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
