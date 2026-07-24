import React, { useEffect, useState } from "react";
import {
  getServicios,
  crearServicio,
  getCotizaciones,
  previewCotizacion,
  crearCotizacion,
  actualizarEstadoCotizacion,
  eliminarCotizacion,
} from "../api.js";

const ESTADOS = ["borrador", "enviada", "aceptada", "rechazada"];

export default function PanelCotizaciones() {
  const [servicios, setServicios] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [preview, setPreview] = useState(null);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cliente, setCliente] = useState({ nombre: "", telefono: "" });
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", duracion_min: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function cargar() {
    const [s, c] = await Promise.all([getServicios(), getCotizaciones()]);
    setServicios(s);
    setCotizaciones(c);
  }

  useEffect(() => {
    cargar()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function toggle(id) {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setPreview(null);
  }

  async function calcular() {
    if (seleccionados.length === 0) return;
    const r = await previewCotizacion(seleccionados);
    setPreview(r);
  }

  async function guardar() {
    setError("");
    try {
      await crearCotizacion({
        cliente_nombre: cliente.nombre || null,
        cliente_telefono: cliente.telefono || null,
        servicio_ids: seleccionados,
      });
      setSeleccionados([]);
      setPreview(null);
      setCliente({ nombre: "", telefono: "" });
      await cargar();
    } catch (e) {
      setError(e.message);
    }
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
      await cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section className="section">
      <header className="section-head">
        <h2>Cotizaciones</h2>
        <p>Arma el presupuesto y envíalo por WhatsApp en un toque.</p>
      </header>

      <div className="layout-split">
        <div className="surface">
          <h3>Nueva cotización</h3>
          <div className="grid-2">
            <div>
              <label htmlFor="cot_nombre">Cliente</label>
              <input
                id="cot_nombre"
                value={cliente.nombre}
                onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                placeholder="Opcional"
              />
            </div>
            <div>
              <label htmlFor="cot_tel">Teléfono</label>
              <input
                id="cot_tel"
                value={cliente.telefono}
                onChange={(e) =>
                  setCliente({ ...cliente, telefono: e.target.value })
                }
                placeholder="573114001414"
              />
            </div>
          </div>

          <p className="label-like">Servicios</p>
          <div className="check-list">
            {servicios.map((s) => (
              <label className="check-row" key={s.id}>
                <input
                  type="checkbox"
                  checked={seleccionados.includes(s.id)}
                  onChange={() => toggle(s.id)}
                />
                <span>
                  {s.nombre} — ${Number(s.precio).toLocaleString("es-CO")}{" "}
                  <span className="muted">({s.duracion_min} min)</span>
                </span>
              </label>
            ))}
          </div>

          <div className="row-actions">
            <button type="button" className="btn btn-secondary" onClick={calcular}>
              Calcular
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={guardar}
              disabled={seleccionados.length === 0}
            >
              Guardar cotización
            </button>
          </div>

          {preview && (
            <div className="flash">
              <p>{preview.servicios.map((s) => s.nombre).join(" · ")}</p>
              <p className="muted">Duración: {preview.duracion_total} min</p>
              <p className="total">
                ${Number(preview.total).toLocaleString("es-CO")}
              </p>
            </div>
          )}

          <hr className="divider" />

          <h3>Catálogo</h3>
          <form onSubmit={agregarServicio}>
            <div className="grid-2">
              <div>
                <label htmlFor="srv_nombre">Nombre</label>
                <input
                  id="srv_nombre"
                  value={nuevo.nombre}
                  onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="srv_precio">Precio ($)</label>
                <input
                  id="srv_precio"
                  type="number"
                  value={nuevo.precio}
                  onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
                  required
                />
              </div>
            </div>
            <label htmlFor="srv_dur">Duración (min)</label>
            <input
              id="srv_dur"
              type="number"
              value={nuevo.duracion_min}
              onChange={(e) =>
                setNuevo({ ...nuevo, duracion_min: e.target.value })
              }
              placeholder="30"
            />
            <button type="submit" className="btn btn-primary">
              Agregar servicio
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>

        <div className="surface">
          <h3>Historial</h3>
          {loading ? (
            <div>
              <div className="skeleton" />
              <div className="skeleton" />
            </div>
          ) : cotizaciones.length === 0 ? (
            <div className="empty">
              <strong>Sin cotizaciones</strong>
              Selecciona servicios y guarda la primera.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Contacto</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cotizaciones.map((c) => (
                    <tr key={c.id}>
                      <td>
                        {c.cliente_nombre || "—"}
                        {c.cliente_telefono && (
                          <>
                            <br />
                            <span className="muted">{c.cliente_telefono}</span>
                          </>
                        )}
                      </td>
                      <td>
                        {(c.items || []).map((i) => i.nombre_servicio).join(", ") ||
                          "—"}
                      </td>
                      <td>${Number(c.total).toLocaleString("es-CO")}</td>
                      <td>
                        <span className={`badge badge-${c.estado}`}>{c.estado}</span>
                        <select
                          className="select-compact"
                          style={{ marginTop: 8, display: "block" }}
                          value={c.estado}
                          onChange={(e) =>
                            actualizarEstadoCotizacion(c.id, e.target.value).then(
                              cargar
                            )
                          }
                        >
                          {ESTADOS.map((es) => (
                            <option key={es} value={es}>
                              {es}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="contact-cell">
                        {c.contacto?.whatsapp_cliente && (
                          <a
                            className="link-wa"
                            href={c.contacto.whatsapp_cliente}
                            target="_blank"
                            rel="noreferrer"
                          >
                            WA
                          </a>
                        )}
                        {c.contacto?.llamar_cliente && (
                          <a className="link-call" href={c.contacto.llamar_cliente}>
                            Tel
                          </a>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() =>
                            confirm("¿Eliminar cotización?") &&
                            eliminarCotizacion(c.id).then(cargar)
                          }
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
