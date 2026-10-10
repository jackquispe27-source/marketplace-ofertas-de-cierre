// La fecha de vencimiento es una fecha de CALENDARIO en Perú ("2026-10-10"), no un instante.
// Se calcula en la zona horaria de Lima para que no dependa de la zona del servidor
// (un servidor en UTC ya está en "mañana" desde las 19:00 de Lima).

export const ZONA_HORARIA = 'America/Lima';

/** @returns {string} fecha en formato YYYY-MM-DD según el calendario de Lima */
export function fechaCalendario(instante) {
  return new Date(instante).toLocaleDateString('sv-SE', { timeZone: ZONA_HORARIA });
}
