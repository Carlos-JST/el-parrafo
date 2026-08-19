/* ==========================================================================
   utilidades/texto.js — funciones pequeñas que usan varios módulos
   --------------------------------------------------------------------------
   Si una función la necesitan dos archivos distintos, vive aquí. Así
   existe una sola versión y se arregla en un solo sitio.
   ========================================================================== */

/* Deja un texto listo para comparar:  "Economía" → "economia"
   normalize('NFD') separa la letra de su tilde y luego borramos las tildes,
   así "economia", "ECONOMÍA" y "Economía" cuentan como lo mismo.
   También aplasta los espacios de más. */
export function normalizar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Convierte una fecha en algo legible: "Hace 3 horas", "Ayer", "12 ago".
   Los periódicos usan el tiempo relativo en lo reciente y la fecha seca
   en lo antiguo, porque "hace 240 horas" no le dice nada a nadie. */
export function fechaLegible(fechaIso) {
  const fecha = new Date(fechaIso);
  if (isNaN(fecha)) return '';

  const minutos = Math.floor((Date.now() - fecha.getTime()) / 60000);

  if (minutos < 1) return 'Ahora mismo';
  if (minutos < 60) return 'Hace ' + minutos + ' min';

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return 'Hace ' + horas + (horas === 1 ? ' hora' : ' horas');

  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'Ayer';
  if (dias < 7) return 'Hace ' + dias + ' días';

  return new Intl.DateTimeFormat('es-DO', { day: 'numeric', month: 'short' }).format(fecha);
}

// Atajos para no repetir document.querySelector por todas partes
export function elemento(selector, dentroDe) {
  return (dentroDe || document).querySelector(selector);
}

export function elementos(selector, dentroDe) {
  return Array.from((dentroDe || document).querySelectorAll(selector));
}

// ¿El usuario pidió menos animaciones en su sistema operativo?
export const prefiereMenosMovimiento =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
