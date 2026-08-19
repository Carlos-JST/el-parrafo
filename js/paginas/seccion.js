/* ==========================================================================
   paginas/seccion.js — listado de una sección
   --------------------------------------------------------------------------
   seccion.html?seccion=politica  →  todas las noticias de Política.

   Fíjate en lo poco que hay aquí: el trabajo pesado (rejilla, paginación,
   lo más leído) ya lo hace componentes/noticias.js, escrito para la
   portada. Reutilizarlo es exactamente para lo que separamos el código.
   ========================================================================== */

import { cargarArticulos } from '../datos/articulos.js';
import { iniciarCabecera } from '../componentes/cabecera.js';
import { iniciarBoletin } from '../componentes/boletin.js';
import { iniciarBuscador } from '../componentes/buscador.js';
import { iniciarNoticias, mostrarCargando, mostrarError } from '../componentes/noticias.js';
import { elemento, elementos, slugificar, parametroDeUrl,
         prefiereMenosMovimiento } from '../utilidades/texto.js';

iniciarCabecera();
iniciarBoletin();
arrancar();

async function arrancar() {
  mostrarCargando();

  try {
    const articulos = await cargarArticulos();
    const pedida = parametroDeUrl('seccion');

    /* La dirección trae "opinion" (sin tilde) y los datos dicen "Opinión".
       slugificar() pone las dos en el mismo formato para compararlas. */
    const categoria = categoriaDesdeSlug(articulos, pedida);
    const suyas = articulos.filter(function (a) { return a.categoria === categoria; });

    elemento('[data-seccion-titulo]').textContent = categoria || 'Sección no encontrada';
    elementos('[data-seccion-nombre]').forEach(function (el) {
      el.textContent = categoria || 'Desconocida';
    });
    document.title = (categoria || 'Sección') + ' — El Párrafo';

    elemento('[data-seccion-conteo]').textContent = suyas.length === 1
      ? '1 artículo publicado'
      : suyas.length + ' artículos publicados';

    marcarEnLaNavegacion(categoria);

    // Le pasamos SOLO los artículos de esta sección: el componente
    // no necesita saber que está en una página distinta
    iniciarNoticias(suyas, { conFiltros: false, masLeidos: articulos });

    iniciarBuscador(articulos);
    revelar();
  } catch (error) {
    console.error('No se pudo cargar la sección:', error);
    mostrarError(arrancar);
  }
}

function categoriaDesdeSlug(articulos, slug) {
  const encontrada = articulos.find(function (a) {
    return slugificar(a.categoria) === slug;
  });
  return encontrada ? encontrada.categoria : '';
}

/* Marca la sección actual en la barra de navegación, como en la portada */
function marcarEnLaNavegacion(categoria) {
  if (!categoria) return;
  elementos('.nav__lista a, .menu-movil__lista a').forEach(function (enlace) {
    if (enlace.textContent.trim() === categoria) {
      enlace.setAttribute('aria-current', 'page');
    }
  });
}

function revelar() {
  if (prefiereMenosMovimiento) return;
  if (!('IntersectionObserver' in window)) return;

  const vigilante = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('es-visible');
      vigilante.unobserve(entrada.target);
    });
  }, { threshold: 0.15 });

  function vigilarNuevos() {
    elementos('.tarjeta, .mas-leido, .boletin__caja, .pie__rejilla > *')
      .forEach(function (el, i) {
        if (el.hasAttribute('data-revelar')) return;
        el.setAttribute('data-revelar', '');
        el.style.setProperty('--retraso', Math.min(i, 6) * 60 + 'ms');
        vigilante.observe(el);
      });
  }

  vigilarNuevos();
  document.addEventListener('contenido:cambio', vigilarNuevos);
}
