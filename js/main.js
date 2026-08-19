/* ==========================================================================
   EL PÁRRAFO — main.js
   --------------------------------------------------------------------------
   Este archivo ya no hace nada por sí mismo: coordina. Pide los datos,
   se los reparte a cada componente y se aparta.

   Un vistazo al orden de la página:

       cabecera        →  no necesita datos, arranca ya
       boletín         →  tampoco
       cargarArticulos →  tarda: mientras tanto enseñamos tarjetas grises
       portada         →  recibe los destacados
       noticias        →  recibe todos
       buscador        →  recibe todos
       revelado        →  se activa al final, cuando ya hay tarjetas

   El <script> del HTML lleva type="module": eso permite import/export y
   obliga a servir la página desde un servidor (Live Server o Vercel).
   ========================================================================== */

import { cargarArticulos } from './datos/articulos.js';
import { iniciarCabecera } from './componentes/cabecera.js';
import { iniciarBoletin } from './componentes/boletin.js';
import { iniciarPortada } from './componentes/portada.js';
import { iniciarNoticias, dibujarOpinion, mostrarCargando, mostrarError } from './componentes/noticias.js';
import { iniciarBuscador } from './componentes/buscador.js';
import { elementos, prefiereMenosMovimiento } from './utilidades/texto.js';

const PORCION_VISIBLE_PARA_REVELAR = 0.15;

/* Lo que no depende de los datos arranca de inmediato: así la cabecera
   responde aunque las noticias tarden. */
iniciarCabecera();
iniciarBoletin();

arrancarContenido();

/* async/await en acción.

   "Asíncrono" significa que la operación no termina en el momento: se pide
   y la respuesta llega después. fetch va a la red, y la red puede tardar
   5 ms o 5 segundos. Si JavaScript se quedara esperando parado, la página
   entera se congelaría: no responderían ni los botones ni el scroll.

   Por eso fetch devuelve una PROMESA —un "te aviso cuando lo tenga"— y
   await es la forma de decir "espera aquí, pero deja la página viva". */
async function arrancarContenido() {
  mostrarCargando();

  /* try/catch: intenta esto y, si algo falla, ejecuta lo otro.
     Sin él, un error en la carga dejaría al lector mirando tarjetas grises
     para siempre, sin saber qué pasó ni poder reintentar. */
  try {
    const articulos = await cargarArticulos();

    const destacados = articulos.filter(function (a) { return a.destacado; });

    iniciarPortada(destacados);
    iniciarNoticias(articulos);
    dibujarOpinion(articulos);
    iniciarBuscador(articulos);

    iniciarRevelado();

    /* Cada vez que cambia la rejilla (filtro o "Ver más") hay tarjetas
       nuevas que nadie está vigilando: volvemos a pasar el observador.
       Las que ya tenían data-revelar se saltan solas. */
    document.addEventListener('contenido:cambio', iniciarRevelado);
  } catch (error) {
    // Queda en la consola para nosotros y en pantalla para el lector
    console.error('No se pudieron cargar los artículos:', error);
    mostrarError(arrancarContenido);   // el botón "Reintentar" vuelve a llamar aquí
  }
}

/* ==================================================================
   REVELADO AL ENTRAR EN PANTALLA
   ------------------------------------------------------------------
   IntersectionObserver: en lugar de preguntar "¿ya se ve?" en cada
   scroll (caro), le pedimos al navegador que nos avise. Lo hace fuera
   del hilo principal, así que no cuesta rendimiento.

   El atributo data-revelar lo ponemos aquí, no en el HTML. Si este
   archivo fallara, la página se vería completa. Nunca escondas
   contenido con una condición que puede no cumplirse.
   ================================================================== */
let vigilante = null;

function iniciarRevelado() {
  if (prefiereMenosMovimiento) return;
  if (!('IntersectionObserver' in window)) return;

  const grupos = [
    { selector: '.portada__pieza', escalon: 0 },
    { selector: '.seccion-cabeza', escalon: 0 },
    { selector: '.tarjeta', escalon: 60 },
    { selector: '.mas-leido', escalon: 0 },
    { selector: '.opinion__texto, .opinion__figura', escalon: 120 },
    { selector: '.boletin__caja', escalon: 0 },
    { selector: '.pie__rejilla > *', escalon: 60 }
  ];

  if (!vigilante) vigilante = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('es-visible');
      vigilante.unobserve(entrada.target);   // una vez revelado, deja de vigilarlo
    });
  }, {
    /* Aparece cuando se ve el 15% del bloque. Usar un margen negativo
       ("espera a que entre 90px") tenía un fallo real: las últimas
       columnas del pie quedan a menos de 90px del final de la página y
       nunca llegaban a cumplirlo. */
    threshold: PORCION_VISIBLE_PARA_REVELAR
  });

  grupos.forEach(function (grupo) {
    elementos(grupo.selector).forEach(function (el, i) {
      if (el.hasAttribute('data-revelar')) return;   // ya estaba vigilado
      el.setAttribute('data-revelar', '');
      if (grupo.escalon > 0) {
        el.style.setProperty('--retraso', Math.min(i, 8) * grupo.escalon + 'ms');
      }
      vigilante.observe(el);
    });
  });
}
