/** Horario laboral Baena Barber: 9:30 a.m. – 6:00 p.m., cada 30 min */

const APERTURA_MIN = 9 * 60 + 30; // 09:30
const CIERRE_MIN = 18 * 60; // 18:00
const INTERVALO = 30;

function minutosAHora(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generarSlotsLaborales() {
  const slots = [];
  for (let t = APERTURA_MIN; t <= CIERRE_MIN; t += INTERVALO) {
    slots.push(minutosAHora(t));
  }
  return slots;
}

function normalizarHora(hora) {
  const s = String(hora || "").slice(0, 5);
  if (!/^\d{2}:\d{2}$/.test(s)) return null;
  return s;
}

function esHorarioLaboral(hora) {
  const h = normalizarHora(hora);
  if (!h) return false;
  return generarSlotsLaborales().includes(h);
}

function esFechaPasada(fechaStr) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const [y, m, d] = String(fechaStr).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return true;
  const fecha = new Date(y, m - 1, d);
  fecha.setHours(0, 0, 0, 0);
  return fecha < hoy;
}

module.exports = {
  generarSlotsLaborales,
  normalizarHora,
  esHorarioLaboral,
  esFechaPasada,
  APERTURA_MIN,
  CIERRE_MIN,
  INTERVALO,
};
