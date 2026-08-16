import React, { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/style.css";
import { getServicios, getDisponibilidad, crearTurno } from "../api.js";
import "./Reservar.css";

function aFechaISO(date) {
  return format(date, "yyyy-MM-dd");
}

function mensajeCierre(motivo) {
  if (motivo === "dia_cerrado") return "Este día la barbería está cerrada";
  if (motivo === "dia_bloqueado") return "No hay atención este día";
  return "No hay atención este día";
}

export default function Reservar() {
  const [servicios, setServicios] = useState([]);
  const [servicioId, setServicioId] = useState("");
  const [fecha, setFecha] = useState(undefined);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [hora, setHora] = useState("");
  const [form, setForm] = useState({ cliente_nombre: "", cliente_telefono: "", notas: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);

  const servicioElegido = servicios.find((s) => String(s.id) === String(servicioId));
  const fechaISO = fecha ? aFechaISO(fecha) : "";

  useEffect(() => {
    getServicios()
      .then(setServicios)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!servicioId || !fechaISO) {
      setDisponibilidad(null);
      setHora("");
      return;
    }
    let cancelado = false;
    setCargandoHoras(true);
    setError("");
    setHora("");
    setDisponibilidad(null);
    getDisponibilidad(fechaISO, servicioId)
      .then((data) => {
        if (!cancelado) setDisponibilidad(data);
      })
      .catch((e) => {
        if (!cancelado) setError(e.message);
      })
      .finally(() => {
        if (!cancelado) setCargandoHoras(false);
      });
    return () => {
      cancelado = true;
    };
  }, [servicioId, fechaISO]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function refrescarHoras() {
    if (!servicioId || !fechaISO) return;
    setCargandoHoras(true);
    try {
      const data = await getDisponibilidad(fechaISO, servicioId);
      setDisponibilidad(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargandoHoras(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const res = await crearTurno({
        cliente_nombre: form.cliente_nombre,
        cliente_telefono: form.cliente_telefono,
        servicio_id: Number(servicioId),
        fecha: fechaISO,
        hora,
        notas: form.notas || null,
      });
      setConfirmacion({
        turno: res.turno,
        contacto: res.contacto,
        servicioNombre: servicioElegido?.nombre,
      });
    } catch (e) {
      if (e.status === 409) {
        setError(e.message);
        setHora("");
        await refrescarHoras();
      } else {
        setError(e.message);
      }
    } finally {
      setEnviando(false);
    }
  }

  function resetear() {
    setServicioId("");
    setFecha(undefined);
    setDisponibilidad(null);
    setHora("");
    setForm({ cliente_nombre: "", cliente_telefono: "", notas: "" });
    setError("");
    setConfirmacion(null);
  }

  if (confirmacion) {
    const { turno, contacto, servicioNombre } = confirmacion;
    return (
      <div className="reservar-page">
        <header className="reservar-header">
          <h1>💈 Barbería</h1>
          <p>Reserva confirmada</p>
        </header>
        <div className="reservar-card">
          <h2>¡Listo, tu turno quedó agendado!</h2>
          <ul className="reservar-resumen">
            <li><strong>Cliente:</strong> {turno.cliente_nombre}</li>
            <li><strong>Servicio:</strong> {servicioNombre || "-"}</li>
            <li><strong>Fecha:</strong> {String(turno.fecha).slice(0, 10)}</li>
            <li><strong>Hora:</strong> {String(turno.hora).slice(0, 5)}</li>
          </ul>
          <div className="reservar-contacto">
            <a href={contacto.whatsapp_barberia} target="_blank" rel="noreferrer">
              <button type="button" className="btn-whatsapp">WhatsApp barbería</button>
            </a>
            <a href={contacto.whatsapp_cliente} target="_blank" rel="noreferrer">
              <button type="button" className="btn-whatsapp">WhatsApp cliente</button>
            </a>
            <a href={contacto.llamar_cliente}>
              <button type="button" className="btn-call">Llamar cliente</button>
            </a>
          </div>
          <button type="button" className="btn-primary reservar-otra" onClick={resetear}>
            Agendar otra cita
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reservar-page">
      <header className="reservar-header">
        <h1>💈 Barbería</h1>
        <p>Elegí servicio, día y hora. Sin cuenta.</p>
      </header>

      <form className="reservar-form" onSubmit={handleSubmit}>
        <section className="reservar-card">
          <h2><span className="reservar-paso">1</span> Servicio</h2>
          <div className="reservar-servicios" role="radiogroup" aria-label="Servicio">
            {servicios.map((s) => (
              <label
                key={s.id}
                className={`reservar-servicio${String(servicioId) === String(s.id) ? " is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="servicio_id"
                  value={s.id}
                  checked={String(servicioId) === String(s.id)}
                  onChange={() => setServicioId(String(s.id))}
                />
                <span className="reservar-servicio-nombre">{s.nombre}</span>
                <span className="reservar-servicio-meta">
                  ${Number(s.precio).toLocaleString()} · {s.duracion_min} min
                </span>
              </label>
            ))}
          </div>
        </section>

        {servicioId && (
          <section className="reservar-card">
            <h2><span className="reservar-paso">2</span> Fecha</h2>
            <div className="reservar-calendario">
              <DayPicker
                mode="single"
                locale={es}
                selected={fecha}
                onSelect={setFecha}
                disabled={{ before: new Date() }}
              />
            </div>
          </section>
        )}

        {servicioId && fecha && (
          <section className="reservar-card">
            <h2><span className="reservar-paso">3</span> Hora</h2>
            {cargandoHoras && <p className="reservar-hint">Buscando horarios…</p>}
            {!cargandoHoras && disponibilidad && disponibilidad.disponible === false && (
              <p className="reservar-aviso">{mensajeCierre(disponibilidad.motivo)}</p>
            )}
            {!cargandoHoras && disponibilidad && disponibilidad.disponible === true && disponibilidad.horarios.length === 0 && (
              <p className="reservar-aviso">No quedan horarios disponibles para este día, prueba otra fecha.</p>
            )}
            {!cargandoHoras && disponibilidad && disponibilidad.disponible === true && disponibilidad.horarios.length > 0 && (
              <div className="reservar-horas" role="radiogroup" aria-label="Hora">
                {disponibilidad.horarios.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={`reservar-hora${hora === h ? " is-selected" : ""}`}
                    onClick={() => setHora(h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {servicioId && fecha && hora && (
          <section className="reservar-card">
            <h2><span className="reservar-paso">4</span> Tus datos</h2>
            <p className="reservar-hint">
              {servicioElegido?.nombre} · {fechaISO} · {hora}
            </p>
            <label htmlFor="cliente_nombre">Nombre</label>
            <input
              id="cliente_nombre"
              name="cliente_nombre"
              value={form.cliente_nombre}
              onChange={handleChange}
              required
            />
            <label htmlFor="cliente_telefono">Teléfono (WhatsApp)</label>
            <input
              id="cliente_telefono"
              name="cliente_telefono"
              value={form.cliente_telefono}
              onChange={handleChange}
              placeholder="573001234567"
              required
            />
            <label htmlFor="notas">Notas (opcional)</label>
            <textarea
              id="notas"
              name="notas"
              value={form.notas}
              onChange={handleChange}
              rows={2}
            />
            <button type="submit" className="btn-primary reservar-confirmar" disabled={enviando}>
              {enviando ? "Confirmando…" : "Confirmar reserva"}
            </button>
          </section>
        )}

        {error && <p className="reservar-error">{error}</p>}
      </form>
    </div>
  );
}
