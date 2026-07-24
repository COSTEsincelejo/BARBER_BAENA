/** Horario laboral: 9:30 a.m. – 6:00 p.m., cada 30 min */

export function generarSlotsLaborales() {
  const slots = [];
  for (let t = 9 * 60 + 30; t <= 18 * 60; t += 30) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return slots;
}

export function slotsConEstadoLocal(fecha, ocupados = []) {
  const ocupadoSet = new Set(
    (ocupados || []).map((h) => String(h).slice(0, 5))
  );
  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
  const ahoraMin = hoy.getHours() * 60 + hoy.getMinutes();

  return generarSlotsLaborales().map((hora) => {
    if (ocupadoSet.has(hora)) {
      return { hora, disponible: false, motivo: "ocupado" };
    }
    if (fecha === hoyStr) {
      const [hh, mm] = hora.split(":").map(Number);
      if (hh * 60 + mm <= ahoraMin) {
        return { hora, disponible: false, motivo: "pasado" };
      }
    }
    return { hora, disponible: true, motivo: null };
  });
}

export function formatHoraAmPm(hora) {
  const [hh, mm] = String(hora).split(":").map(Number);
  const suf = hh >= 12 ? "p.m." : "a.m.";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")} ${suf}`;
}
