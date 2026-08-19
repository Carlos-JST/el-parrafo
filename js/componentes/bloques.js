/* ==========================================================================
   componentes/bloques.js — los bloques especiales de la portada
   --------------------------------------------------------------------------
   Un periódico no muestra todo con el mismo formato. Lo que ocurrió hace
   una hora se lee de un vistazo; un reportaje de once minutos necesita
   espacio; una columna de opinión se presenta por su firma.

   Aquí viven esos tres tratamientos. Cada función hace lo mismo que
   crearTarjeta(): recibe artículos y devuelve interfaz. Ninguna sabe
   dónde va a colocarse ni qué hay alrededor.
   ========================================================================== */

import { fechaLegible, rutas } from '../utilidades/texto.js';

const CUANTOS_BREVES = 5;
const CUANTOS_LARGOS = 2;
const MINUTOS_PARA_SER_LARGO = 8;

/* ------------------------------------------------------------------
   EN BREVE — titulares sin imagen, para leer de un vistazo
   ------------------------------------------------------------------ */
export function dibujarBreves(articulos) {
  const lista = document.getElementById('lista-breves');
  if (!lista) return;

  /* Los más recientes que no están en el carrusel: si ya ocupan la
     apertura, repetirlos aquí sería redundante. */
  const breves = articulos
    .filter(function (a) { return !a.destacado; })
    .slice(0, CUANTOS_BREVES);

  const bolsa = document.createDocumentFragment();

  breves.forEach(function (articulo) {
    const fila = document.createElement('li');
    fila.className = 'breve';

    const enlace = document.createElement('a');
    enlace.className = 'breve__enlace';
    enlace.href = rutas.articulo(articulo.slug);

    const hora = document.createElement('span');
    hora.className = 'breve__hora';
    hora.textContent = fechaLegible(articulo.fecha);

    const titulo = document.createElement('span');
    titulo.className = 'breve__titulo';
    titulo.textContent = articulo.titulo;

    const seccion = document.createElement('span');
    seccion.className = 'meta';
    seccion.textContent = articulo.categoria;

    enlace.append(hora, titulo, seccion);
    fila.append(enlace);
    bolsa.append(fila);
  });

  lista.innerHTML = '';
  lista.append(bolsa);
}

/* ------------------------------------------------------------------
   EN PROFUNDIDAD — los reportajes largos, en horizontal
   ------------------------------------------------------------------ */
export function dibujarProfundidad(articulos) {
  const caja = document.getElementById('lista-profundidad');
  if (!caja) return;

  /* Ordenamos por tiempo de lectura y nos quedamos con los más largos.
     slice() antes de sort() porque sort MODIFICA el array original y no
     queremos reordenar la lista que usa el resto de la página. */
  const largos = articulos
    .slice()
    .filter(function (a) { return a.minutosLectura >= MINUTOS_PARA_SER_LARGO; })
    .sort(function (a, b) { return b.minutosLectura - a.minutosLectura; })
    .slice(0, CUANTOS_LARGOS);

  if (largos.length === 0) {
    caja.closest('section').remove();
    return;
  }

  const bolsa = document.createDocumentFragment();

  largos.forEach(function (articulo) {
    const pieza = document.createElement('article');
    pieza.className = 'reportaje';

    const enlace = document.createElement('a');
    enlace.className = 'reportaje__enlace';
    enlace.href = rutas.articulo(articulo.slug);

    const figura = document.createElement('figure');
    figura.className = 'reportaje__figura';

    const imagen = document.createElement('img');
    imagen.src = articulo.imagen;
    imagen.alt = articulo.alt || '';
    imagen.width = 1200;
    imagen.height = 800;
    imagen.loading = 'lazy';
    figura.append(imagen);

    const texto = document.createElement('div');
    texto.className = 'reportaje__texto';

    const etiqueta = document.createElement('p');
    etiqueta.className = 'etiqueta etiqueta--roja';
    etiqueta.textContent = articulo.categoria;

    const titulo = document.createElement('h3');
    titulo.className = 'reportaje__titulo';
    titulo.textContent = articulo.titulo;

    const resumen = document.createElement('p');
    resumen.className = 'reportaje__resumen';
    resumen.textContent = articulo.resumen;

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = 'Por ' + articulo.autor.nombre +
                       ' \u00B7 ' + articulo.minutosLectura + ' min de lectura';

    const leer = document.createElement('span');
    leer.className = 'enlace-leer';
    leer.append('Leer el reportaje ');

    const flecha = document.createElement('span');
    flecha.setAttribute('aria-hidden', 'true');
    flecha.textContent = '\u2192';
    leer.append(flecha);

    texto.append(etiqueta, titulo, resumen, meta, leer);
    enlace.append(figura, texto);
    pieza.append(enlace);
    bolsa.append(pieza);
  });

  caja.innerHTML = '';
  caja.append(bolsa);
}

/* ------------------------------------------------------------------
   COLUMNISTAS — la opinión se presenta por su firma, no por su foto
   ------------------------------------------------------------------ */
export function dibujarColumnistas(articulos, saltarSlug) {
  const caja = document.getElementById('lista-columnistas');
  if (!caja) return;

  const columnas = articulos.filter(function (a) {
    return a.categoria === 'Opini\u00F3n' && a.slug !== saltarSlug;
  });

  if (columnas.length === 0) {
    caja.closest('section').remove();
    return;
  }

  const bolsa = document.createDocumentFragment();

  columnas.forEach(function (articulo) {
    const pieza = document.createElement('article');
    pieza.className = 'columna';

    const enlace = document.createElement('a');
    enlace.className = 'columna__enlace';
    enlace.href = rutas.articulo(articulo.slug);

    const firma = document.createElement('span');
    firma.className = 'columna__firma';

    const inicial = document.createElement('span');
    inicial.className = 'firma__inicial';
    inicial.setAttribute('aria-hidden', 'true');
    inicial.textContent = articulo.autor.nombre.charAt(0);

    const nombre = document.createElement('span');
    nombre.className = 'columna__autor';
    nombre.textContent = articulo.autor.nombre;

    firma.append(inicial, nombre);

    const titulo = document.createElement('h3');
    titulo.className = 'columna__titulo';
    titulo.textContent = articulo.titulo;

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = fechaLegible(articulo.fecha) +
                       ' \u00B7 ' + articulo.minutosLectura + ' min';

    enlace.append(firma, titulo, meta);
    pieza.append(enlace);
    bolsa.append(pieza);
  });

  caja.innerHTML = '';
  caja.append(bolsa);
}
