import React, { useMemo } from "react";

const DIAS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function toISODate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function startOfToday() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

/**
 * Calendario mensual.
 * bloqueos: { fechas: string[], dias_semana: number[] } (0=domingo)
 */
export default function Calendario({
  value,
  onChange,
  month,
  onMonthChange,
  bloqueos = { fechas: [], dias_semana: [] },
}) {
  const hoy = startOfToday();
  const fechasBloq = useMemo(
    () => new Set(bloqueos.fechas || []),
    [bloqueos.fechas]
  );
  const diasBloq = useMemo(
    () => new Set((bloqueos.dias_semana || []).map(Number)),
    [bloqueos.dias_semana]
  );

  const cells = useMemo(() => {
    const y = month.getFullYear();
    const m = month.getMonth();
    const first = new Date(y, m, 1);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const list = [];

    for (let i = 0; i < offset; i++) {
      list.push({ type: "empty", key: `e-${i}` });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      date.setHours(0, 0, 0, 0);
      const iso = toISODate(y, m, d);
      const pasado = date < hoy;
      const bloqueado = fechasBloq.has(iso) || diasBloq.has(date.getDay());
      list.push({
        type: "day",
        key: iso,
        day: d,
        iso,
        pasado,
        bloqueado,
        disabled: pasado || bloqueado,
      });
    }

    return list;
  }, [month, hoy, fechasBloq, diasBloq]);

  function prevMonth() {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  }

  function nextMonth() {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1));
  }

  const canPrev =
    month.getFullYear() > hoy.getFullYear() ||
    (month.getFullYear() === hoy.getFullYear() &&
      month.getMonth() > hoy.getMonth());

  return (
    <div className="calendar">
      <div className="calendar-head">
        <button
          type="button"
          className="calendar-nav"
          onClick={prevMonth}
          disabled={!canPrev}
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <strong>
          {MESES[month.getMonth()]} {month.getFullYear()}
        </strong>
        <button
          type="button"
          className="calendar-nav"
          onClick={nextMonth}
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {DIAS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((c) => {
          if (c.type === "empty") {
            return <span key={c.key} className="calendar-cell empty" />;
          }
          const selected = value === c.iso;
          return (
            <button
              key={c.key}
              type="button"
              disabled={c.disabled}
              className={[
                "calendar-cell",
                "day",
                c.pasado ? "past" : "",
                c.bloqueado ? "blocked" : "",
                selected ? "selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onChange(c.iso)}
              title={
                c.bloqueado
                  ? "Sin servicio"
                  : c.pasado
                    ? "Día pasado"
                    : c.iso
              }
            >
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
