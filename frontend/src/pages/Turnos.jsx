import React, { useEffect, useState } from "react";
import { getTurnos, crearTurno, actualizarEstadoTurno, eliminarTurno, getServicios } from "../api.js";

const ESTADOS = ["pendiente", "confirmado", "completado", "cancelado"];

export default function Turnos() {
  const [turnos, setTurnos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [contacto, setContacto] = useState(null);
  const [form, setForm] = useState({
    cliente_nombre: "",
    cliente_telefono: "",
    servicio_id: "",
    barbero: "",
    fecha: "",
    hora: "",
    notas: "",
  });
  const [error, setError] = useState("");

  async function cargar() {
    try {
      const [t, s] = await Promise.all([getTurnos(), getServicios()]);
      setTurnos(t);
      setServicios(s);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { cargar(); }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await crearTurno({ ...form, servicio_id: form.servicio_id || null });
      setContacto(res.contacto);
      setForm({ cliente_nombre: "", cliente_telefono: "", servicio_id: "", barbero: "", fecha: "", hora: "", notas: "" });
      cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  async function cambiarEstado(id, estado) {
    await actualizarEstadoTurno(id, estado);
    cargar();
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este turno?")) return;
    await eliminarTurno(id);
    cargar();
  }

  return (
    <div>
      <h2>Gestión de turnos</h2>

      <div className="card">
        <h3>Agendar nuevo turno</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div>
              <label>Nombre del cliente</label>
              <input name="cliente_nombre" value={form.cliente_nombre} onChange={handleChange} required />
            </div>
            <div>
              <label>Teléfono del cliente (WhatsApp)</label>
              <input name="cliente_telefono" value={form.cliente_telefono} onChange={handleChange} placeholder="573001234567" required />
            </div>
          </div>
          <div className="grid-2">
            <div>
              <label>Servicio</label>
              <select name="servicio_id" value={form.servicio_id} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre} - ${Number(s.precio).toLocaleString()}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Barbero</label>
              <input name="barbero" value={form.barbero} onChange={handleChange} placeholder="Opcional" />
            </div>
          </div>
          <div className="grid-2">
            <div>
              <label>Fecha</label>
              <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
            </div>
            <div>
              <label>Hora</label>
              <input type="time" name="hora" value={form.hora} onChange={handleChange} required />
            </div>
          </div>
          <label>Notas</label>
          <textarea name="notas" value={form.notas} onChange={handleChange} rows={2} />
          <button type="submit" className="btn-primary">Agendar turno</button>
        </form>
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      </div>

      {contacto && (
        <div className="card">
          <h3>Turno creado — confirmar por contacto directo</h3>
          <a href={contacto.whatsapp_barberia} target="_blank" rel="noreferrer">
            <button className="btn-whatsapp">WhatsApp barbería</button>
          </a>
          <a href={contacto.whatsapp_cliente} target="_blank" rel="noreferrer">
            <button className="btn-whatsapp">WhatsApp cliente</button>
          </a>
          <a href={contacto.llamar_cliente}>
            <button className="btn-call">Llamar cliente</button>
          </a>
        </div>
      )}

      <div className="card">
        <h3>Turnos agendados</h3>
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((t) => (
              <tr key={t.id}>
                <td>{t.cliente_nombre}<br /><small>{t.cliente_telefono}</small></td>
                <td>{t.servicio_nombre || "-"}</td>
                <td>{t.fecha?.slice(0, 10)}</td>
                <td>{t.hora?.slice(0, 5)}</td>
                <td><span className={`badge badge-${t.estado}`}>{t.estado}</span></td>
                <td>
                  <select value={t.estado} onChange={(e) => cambiarEstado(t.id, e.target.value)}>
                    {ESTADOS.map((es) => <option key={es} value={es}>{es}</option>)}
                  </select>
                  <button className="btn-danger" onClick={() => eliminar(t.id)} style={{ marginLeft: 6 }}>✕</button>
                </td>
              </tr>
            ))}
            {turnos.length === 0 && (
              <tr><td colSpan={6}>No hay turnos agendados aún.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
