/* ==========================================================================
   paginas/autor.js — ficha de una firma
   --------------------------------------------------------------------------
   autor.html?firma=laura-beltre  →  su ficha y todos sus artículos.

   Esta página es el primer ladrillo de algo más grande: el día que El
   Párrafo tenga suscripciones por autor, este es el sitio donde vivirá
   el botón de seguir.
   ========================================================================== */

import { cargarArticulos, cargarAutores, articulosDeAutor } from '../datos/articulos.js';
import { iniciarCabecera } from '../componentes/cabecera.js';
import { iniciarBoletin } from '../componentes/boletin.js';
import { iniciarBuscador } from '../componentes/buscador.js';
import { crearTarjeta } from '../componentes/tarjeta.js';
import { elemento, elementos, parametroDeUrl, rutas,
         prefiereMenosMovimiento } from '../utilidades/texto.js';

iniciarCabecera();
iniciarBoletin();
arrancar();

async function arrancar() {
  const estado = document.getElementById('estado-noticias');
  const rejilla = document.getElementById('rejilla-noticias');
  const slug = parametroDeUrl('firma');

  try {
    const [articulos, autores] = await Promise.all([cargarArticulos(), cargarAutores()]);
    const autor = autores.find(function (a) { return a.slug === slug; });

    if (!autor) {
      elemento('[data-autor-nombre]').textContent = 'Firma no encontrada';
      estado.innerHTML = '';
      const aviso = document.createElement('p');
      aviso.textContent = 'No tenemos una ficha con ese nombre.';
      const volver = document.createElement('a');
      volver.className = 'boton boton--primario';
      volver.href = rutas.inicio;
      volver.textContent = 'Ir a la portada';
      estado.append(aviso, volver);
      estado.classList.add('estado--error');
      return;
    }

    document.title = autor.nombre + ' — El Párrafo';
    elemento('[data-autor-nombre]').textContent = autor.nombre;
    elemento('[data-autor-rol]').textContent = autor.rol;
    elemento('[data-autor-bio]').textContent = autor.bio;
    elemento('[data-autor-inicial]').textContent = autor.nombre.charAt(0);

    const suyos = articulosDeAutor(articulos, autor.slug);
    elemento('[data-autor-conteo]').textContent = suyos.length === 1
      ? '1 artículo publicado'
      : suyos.length + ' artículos publicados';

    const bolsa = document.createDocumentFragment();
    suyos.forEach(function (a) { bolsa.append(crearTarjeta(a)); });
    rejilla.append(bolsa);

    estado.textContent = suyos.length === 0 ? 'Esta firma todavía no tiene artículos.' : '';

    iniciarBuscador(articulos);
    revelar();
  } catch (error) {
    console.error('No se pudo cargar la firma:', error);
    estado.textContent = 'No pudimos cargar esta página. Inténtalo otra vez.';
    estado.classList.add('estado--error');
  }
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

  elementos('.tarjeta, .boletin__caja, .pie__rejilla > *').forEach(function (el, i) {
    el.setAttribute('data-revelar', '');
    el.style.setProperty('--retraso', Math.min(i, 6) * 60 + 'ms');
    vigilante.observe(el);
  });
}
