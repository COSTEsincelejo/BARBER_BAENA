import React from "react";
import { formatHoraAmPm } from "../utils/horarios.js";

/**
 * Selector visual de hora (reloj digital + lista de slots).
 */
export default function SelectorHora({
  slots = [],
  value,
  onChange,
  loading = false,
}) {
  return (
    <div className="time-picker">
      <div className="clock-face" aria-live="polite">
        <span className="clock-icon" aria-hidden="true">
          ⏱
        </span>
        <div className="clock-readout">
          <strong>{value ? formatHoraAmPm(value) : "--:--"}</strong>
          <span>{value ? "Hora elegida" : "Elige una hora"}</span>
        </div>
      </div>

      {loading && <p className="muted">Cargando horarios…</p>}

      <div className="slot-grid slot-grid-dense" role="listbox" aria-label="Horarios disponibles">
        {slots.map((s) => (
          <button
            key={s.hora}
            type="button"
            role="option"
            aria-selected={value === s.hora}
            disabled={!s.disponible}
            className={[
              "slot-btn",
              value === s.hora ? "active" : "",
              !s.disponible ? "busy" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(s.hora)}
            title={
              s.disponible
                ? formatHoraAmPm(s.hora)
                : s.motivo === "ocupado"
                  ? "Ocupado"
                  : "No disponible"
            }
          >
            {formatHoraAmPm(s.hora)}
          </button>
        ))}
      </div>

      {!loading && slots.length === 0 && (
        <p className="muted">No hay horarios para mostrar.</p>
      )}
    </div>
  );
}
