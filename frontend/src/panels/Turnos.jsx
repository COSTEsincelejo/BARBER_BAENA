import React, { useEffect, useState } from "react";
import {
  getTurnos,
  crearTurno,
  actualizarEstadoTurno,
  eliminarTurno,
  getServicios,
} from "../api.js";

const ESTADOS = ["pendiente", "confirmado", "completado", "cancelado"];

const emptyForm = {
  cliente_nombre: "",
  cliente_telefono: "",
  servicio_id: "",
  barbero: "",
  fecha: "",
  hora: "",
  notas: "",
};

export default function PanelTurnos() {
  const [turnos, setTurnos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [contacto, setContacto] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function cargar() {
    try {
      const [t, s] = await Promise.all([getTurnos(), getServicios()]);
      setTurnos(t);
      setServicios(s);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await crearTurno({
        ...form,
        servicio_id: form.servicio_id || null,
      });
      setContacto(res.contacto);
      setForm(emptyForm);
      await cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function cambiarEstado(id, estado) {
    await actualizarEstadoTurno(id, estado);
    await cargar();
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este turno?")) return;
    await eliminarTurno(id);
    await cargar();
  }

  return (
    <section className="section">
      <header className="section-head">
        <h2>Turnos</h2>
        <p>Agenda citas y contacta al cliente al instante.</p>
      </header>

      <div className="layout-split">
        <form className="surface form-block" onSubmit={handleSubmit}>
          <h3>Nuevo turno</h3>
          <div className="grid-2">
            <div>
              <label htmlFor="cliente_nombre">Cliente</label>
              <input
                id="cliente_nombre"
                name="cliente_nombre"
                value={form.cliente_nombre}
                onChange={handleChange}
                placeholder="Nombre completo"
                required
              />
            </div>
            <div>
              <label htmlFor="cliente_telefono">WhatsApp</label>
              <input
                id="cliente_telefono"
                name="cliente_telefono"
                value={form.cliente_telefono}
                onChange={handleChange}
                placeholder="573001234567"
                required
              />
            </div>
          </div>
          <div className="grid-2">
            <div>
              <label htmlFor="servicio_id">Servicio</label>
              <select
                id="servicio_id"
                name="servicio_id"
                value={form.servicio_id}
                onChange={handleChange}
              >
                <option value="">Seleccionar…</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} — ${Number(s.precio).toLocaleString("es-CO")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="barbero">Barbero</label>
              <input
                id="barbero"
                name="barbero"
                value={form.barbero}
                onChange={handleChange}
                placeholder="Opcional"
              />
            </div>
          </div>
          <div className="grid-2">
            <div>
              <label htmlFor="fecha">Fecha</label>
              <input
                id="fecha"
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="hora">Hora</label>
              <input
                id="hora"
                type="time"
                name="hora"
                value={form.hora}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <label htmlFor="notas">Notas</label>
          <textarea
            id="notas"
            name="notas"
            value={form.notas}
            onChange={handleChange}
            rows={2}
            placeholder="Preferencias del cliente…"
          />
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Agendando…" : "Agendar turno"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>

        <div className="surface">
          <h3>Agenda viva</h3>
          {loading ? (
            <div>
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
            </div>
          ) : turnos.length === 0 ? (
            <div className="empty">
              <strong>Sin turnos</strong>
              Agenda el primero desde el formulario.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Cuándo</th>
                    <th>Estado</th>
                    <th>Contacto</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {turnos.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <strong>{t.cliente_nombre}</strong>
                        <br />
                        <span className="muted">{t.cliente_telefono}</span>
                      </td>
                      <td>{t.servicio_nombre || "—"}</td>
                      <td>
                        {String(t.fecha).slice(0, 10)}
                        <br />
                        <span className="muted">{String(t.hora).slice(0, 5)}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${t.estado}`}>{t.estado}</span>
                        <select
                          className="select-compact"
                          style={{ marginTop: 8, display: "block" }}
                          value={t.estado}
                          onChange={(e) => cambiarEstado(t.id, e.target.value)}
                          aria-label={`Estado de ${t.cliente_nombre}`}
                        >
                          {ESTADOS.map((es) => (
                            <option key={es} value={es}>
                              {es}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="contact-cell">
                        {t.contacto && (
                          <>
                            <a
                              className="link-wa"
                              href={t.contacto.whatsapp_cliente}
                              target="_blank"
                              rel="noreferrer"
                            >
                              WA
                            </a>
                            <a className="link-call" href={t.contacto.llamar_cliente}>
                              Tel
                            </a>
                          </>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => eliminar(t.id)}
                          aria-label="Eliminar turno"
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

          {contacto && (
            <div className="flash">
              <p>Turno listo. Confirma por contacto directo:</p>
              <div className="flash-actions">
                <a
                  className="btn btn-wa"
                  href={contacto.whatsapp_cliente}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp cliente
                </a>
                <a className="btn btn-call" href={contacto.llamar_cliente}>
                  Llamar cliente
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
