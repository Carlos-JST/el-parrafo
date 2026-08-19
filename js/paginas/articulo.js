/* ==========================================================================
   paginas/articulo.js — la página de una noticia
   --------------------------------------------------------------------------
   Cómo sabe esta página qué artículo mostrar:

       articulo.html?nota=la-reforma-que-necesita-el-pais
                          └──────────┬──────────┘
                           parametroDeUrl('nota')
                                     ↓
                          buscarPorSlug(articulos, slug)
                                     ↓
                             se pinta el artículo

   Ese "?nota=..." es un parámetro de URL. Es la forma más sencilla de que
   una página estática muestre contenido distinto sin servidor.

   Más adelante, con Next.js, la dirección será /politica/la-reforma-que-
   necesita-el-pais: más bonita y mejor para Google. La idea de fondo no
   cambia: de la dirección sale un identificador y con él se busca el dato.
   ========================================================================== */

import { cargarArticulos, cargarAutores, buscarPorSlug, relacionados } from '../datos/articulos.js';
import { iniciarCabecera } from '../componentes/cabecera.js';
import { iniciarBoletin } from '../componentes/boletin.js';
import { iniciarBuscador } from '../componentes/buscador.js';
import { crearTarjeta } from '../componentes/tarjeta.js';
import { elemento, elementos, fechaLegible, parametroDeUrl, rutas,
         prefiereMenosMovimiento } from '../utilidades/texto.js';

iniciarCabecera();
iniciarBoletin();
mostrarArticulo();

async function mostrarArticulo() {
  const nota = document.getElementById('nota');
  const estado = document.getElementById('estado-nota');
  const slug = parametroDeUrl('nota');

  try {
    // Los dos archivos se piden a la vez, no uno detrás de otro.
    // Promise.all espera a que lleguen ambos y tarda lo que el más lento.
    const [articulos, autores] = await Promise.all([cargarArticulos(), cargarAutores()]);

    const articulo = buscarPorSlug(articulos, slug);

    if (!articulo) {
      estado.innerHTML = '';
      const aviso = document.createElement('p');
      aviso.textContent = 'No encontramos ese artículo. Puede que el enlace esté mal escrito.';
      const volver = document.createElement('a');
      volver.className = 'boton boton--primario';
      volver.href = rutas.inicio;
      volver.textContent = 'Ir a la portada';
      estado.append(aviso, volver);
      estado.classList.add('estado--error');
      document.title = 'Artículo no encontrado — El Párrafo';
      return;
    }

    pintar(articulo, autores);
    pintarRelacionados(articulos, articulo);

    estado.remove();
    nota.hidden = false;
    document.getElementById('relacionados').hidden = false;

    iniciarBuscador(articulos);
    revelar();
  } catch (error) {
    console.error('No se pudo cargar el artículo:', error);
    estado.textContent = 'No pudimos cargar el artículo. Comprueba tu conexión e inténtalo otra vez.';
    estado.classList.add('estado--error');
  }
}

function pintar(articulo, autores) {
  // find() otra vez: la ficha del autor que firma esta nota
  const autor = autores.find(function (a) { return a.slug === articulo.autor.slug; })
              || { nombre: articulo.autor.nombre, rol: '', slug: articulo.autor.slug };

  // El título de la pestaña del navegador también es parte de la página
  document.title = articulo.titulo + ' — El Párrafo';

  elemento('[data-nota-titulo]').textContent = articulo.titulo;
  elemento('[data-nota-resumen]').textContent = articulo.resumen;

  elementos('[data-nota-seccion]').forEach(function (enlace) {
    enlace.textContent = articulo.categoria;
    enlace.href = rutas.seccion(articulo.categoria);
  });

  elemento('[data-nota-autor-nombre]').textContent = autor.nombre;
  elemento('[data-nota-autor-rol]').textContent = autor.rol;
  elemento('[data-nota-autor-inicial]').textContent = autor.nombre.charAt(0);
  elemento('[data-nota-autor-enlace]').href = rutas.autor(autor.slug);

  elemento('[data-nota-meta]').textContent =
    fechaLegible(articulo.fecha) + ' \u00B7 ' + articulo.minutosLectura + ' min de lectura';

  const imagen = elemento('[data-nota-imagen]');
  imagen.src = articulo.imagen;
  imagen.alt = articulo.alt;
  elemento('[data-nota-pie]').textContent = articulo.alt;

  /* Un <p> por cada párrafo del array "cuerpo".
     Usamos textContent y no innerHTML: si un texto trae un signo < o &,
     se escribe tal cual en vez de interpretarse como HTML. Es la defensa
     básica contra inyección de código, y valdrá doble cuando el texto
     venga de una base de datos y no de un archivo que escribimos nosotros. */
  const cuerpo = elemento('[data-nota-cuerpo]');
  cuerpo.innerHTML = '';

  const bolsa = document.createDocumentFragment();
  articulo.cuerpo.forEach(function (parrafo, i) {
    const p = document.createElement('p');
    p.textContent = parrafo;
    if (i === 0) p.className = 'nota__primero';   // primer párrafo destacado
    bolsa.append(p);
  });
  cuerpo.append(bolsa);
}

function pintarRelacionados(articulos, articulo) {
  const rejilla = document.getElementById('rejilla-relacionados');
  const otros = relacionados(articulos, articulo, 3);

  if (otros.length === 0) {
    document.getElementById('relacionados').remove();
    return;
  }

  const bolsa = document.createDocumentFragment();
  otros.forEach(function (a) { bolsa.append(crearTarjeta(a)); });
  rejilla.append(bolsa);
}

/* Revelado al hacer scroll, igual que en la portada */
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

  elementos('.nota__figura, .nota__cuerpo > p, .tarjeta, .seccion-cabeza, .boletin__caja, .pie__rejilla > *')
    .forEach(function (el, i) {
      el.setAttribute('data-revelar', '');
      el.style.setProperty('--retraso', Math.min(i, 6) * 50 + 'ms');
      vigilante.observe(el);
    });
}
