/* ==========================================================================
   componentes/tarjeta.js — un artículo se convierte en una tarjeta
   --------------------------------------------------------------------------
   Este es el archivo más importante de la fase. Hace UNA cosa:

       un objeto artículo   →   un elemento <article> listo para el DOM

   Fíjate en que no toca la página: no busca dónde meterlo ni sabe cuántas
   tarjetas habrá. Solo construye y devuelve. Quien lo llame decide qué
   hacer con el resultado.

   Ese patrón —recibir datos y devolver interfaz— es exactamente lo que
   hace un componente de React. Cuando migremos, este archivo se convertirá
   casi línea por línea en Tarjeta.jsx.
   ========================================================================== */

import { fechaLegible } from '../utilidades/texto.js';

export function crearTarjeta(articulo) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta';
  tarjeta.dataset.categoria = articulo.categoria;

  const enlace = document.createElement('a');
  enlace.className = 'tarjeta__enlace';
  enlace.href = '#';                       // en la Fase 4C apuntará al artículo
  enlace.dataset.slug = articulo.slug;

  // --- Imagen ---
  const figura = document.createElement('figure');
  figura.className = 'tarjeta__figura';

  const imagen = document.createElement('img');
  imagen.src = articulo.imagen;
  imagen.alt = articulo.alt || '';
  imagen.width = 1200;
  imagen.height = 800;
  /* loading="lazy": el navegador no descarga la imagen hasta que se acerca
     a la pantalla. Con 22 noticias eso ahorra bastantes descargas. */
  imagen.loading = 'lazy';
  figura.append(imagen);

  // --- Categoría ---
  const categoria = document.createElement('p');
  categoria.className = 'etiqueta etiqueta--roja';
  categoria.textContent = articulo.categoria;

  // --- Título ---
  const titulo = document.createElement('h3');
  titulo.className = 'tarjeta__titulo';
  titulo.textContent = articulo.titulo;

  // --- Resumen ---
  const resumen = document.createElement('p');
  resumen.className = 'tarjeta__resumen';
  resumen.textContent = articulo.resumen;

  // --- Autor y fecha ---
  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = fechaLegible(articulo.fecha) + ' \u00B7 Por ' + articulo.autor.nombre;

  // --- Leer más ---
  const leer = document.createElement('span');
  leer.className = 'enlace-leer';
  leer.append('Leer m\u00E1s ');

  const flecha = document.createElement('span');
  flecha.setAttribute('aria-hidden', 'true');
  flecha.textContent = '\u2192';
  leer.append(flecha);

  enlace.append(figura, categoria, titulo, resumen, meta, leer);
  tarjeta.append(enlace);
  return tarjeta;
}

/* Tarjeta gris de relleno para mientras cargan los datos.
   Ocupa el mismo sitio que una tarjeta real, así la página no da un salto
   cuando llegan las noticias de verdad. */
export function crearTarjetaFantasma() {
  const fantasma = document.createElement('div');
  fantasma.className = 'fantasma';
  fantasma.setAttribute('aria-hidden', 'true');

  const figura = document.createElement('div');
  figura.className = 'fantasma__figura';
  fantasma.append(figura);

  ['corta', '', '', 'media'].forEach(function (variante) {
    const linea = document.createElement('div');
    linea.className = 'fantasma__linea' + (variante ? ' fantasma__linea--' + variante : '');
    fantasma.append(linea);
  });

  return fantasma;
}
