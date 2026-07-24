import React, { useEffect, useState } from "react";
import {
  getBloqueosAdmin,
  crearBloqueo,
  eliminarBloqueo,
} from "../api.js";

const DIAS_SEMANA = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export default function PanelBloqueos() {
  const [items, setItems] = useState([]);
  const [fecha, setFecha] = useState("");
  const [diaSemana, setDiaSemana] = useState("0");
  const [motivoFecha, setMotivoFecha] = useState("");
  const [motivoDia, setMotivoDia] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function cargar() {
    setLoading(true);
    try {
      setItems(await getBloqueosAdmin());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function agregarFecha(e) {
    e.preventDefault();
    setError("");
    try {
      await crearBloqueo({
        tipo: "fecha",
        fecha,
        motivo: motivoFecha || null,
      });
      setFecha("");
      setMotivoFecha("");
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function agregarDia(e) {
    e.preventDefault();
    setError("");
    try {
      await crearBloqueo({
        tipo: "dia_semana",
        dia_semana: Number(diaSemana),
        motivo: motivoDia || null,
      });
      setMotivoDia("");
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function quitar(id) {
    if (!confirm("¿Quitar este bloqueo?")) return;
    await eliminarBloqueo(id);
    await cargar();
  }

  const fechas = items.filter((i) => i.tipo === "fecha");
  const recurrentes = items.filter((i) => i.tipo === "dia_semana");

  return (
    <section className="section">
      <header className="section-head">
        <h2>Días sin servicio</h2>
        <p>
          Bloquea una fecha exacta o un día de la semana. El calendario del
          cliente lo refleja al instante.
        </p>
      </header>

      <div className="layout-split">
        <form className="surface" onSubmit={agregarFecha}>
          <h3>Fecha exacta</h3>
          <label htmlFor="blk_fecha">Fecha</label>
          <input
            id="blk_fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
          <label htmlFor="blk_motivo_f">Motivo (opcional)</label>
          <input
            id="blk_motivo_f"
            value={motivoFecha}
            onChange={(e) => setMotivoFecha(e.target.value)}
            placeholder="Feriado, imprevisto…"
          />
          <button type="submit" className="btn btn-primary">
            Bloquear fecha
          </button>
        </form>

        <form className="surface" onSubmit={agregarDia}>
          <h3>Día de la semana (recurrente)</h3>
          <label htmlFor="blk_dia">Día</label>
          <select
            id="blk_dia"
            value={diaSemana}
            onChange={(e) => setDiaSemana(e.target.value)}
          >
            {DIAS_SEMANA.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <label htmlFor="blk_motivo_d">Motivo (opcional)</label>
          <input
            id="blk_motivo_d"
            value={motivoDia}
            onChange={(e) => setMotivoDia(e.target.value)}
            placeholder="Ej: cerrado los domingos"
          />
          <button type="submit" className="btn btn-primary">
            Bloquear día recurrente
          </button>
        </form>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="layout-split" style={{ marginTop: 16 }}>
        <div className="surface">
          <h3>Fechas bloqueadas</h3>
          {loading ? (
            <p className="muted">Cargando…</p>
          ) : fechas.length === 0 ? (
            <p className="muted">Ninguna fecha bloqueada.</p>
          ) : (
            <ul className="block-list">
              {fechas.map((b) => (
                <li key={b.id}>
                  <div>
                    <strong>{b.fecha}</strong>
                    {b.motivo && <span className="muted"> — {b.motivo}</span>}
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => quitar(b.id)}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="surface">
          <h3>Días recurrentes</h3>
          {loading ? (
            <p className="muted">Cargando…</p>
          ) : recurrentes.length === 0 ? (
            <p className="muted">Ningún día recurrente bloqueado.</p>
          ) : (
            <ul className="block-list">
              {recurrentes.map((b) => (
                <li key={b.id}>
                  <div>
                    <strong>{b.dia_nombre || DIAS_SEMANA[b.dia_semana]?.label}</strong>
                    {b.motivo && <span className="muted"> — {b.motivo}</span>}
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => quitar(b.id)}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
