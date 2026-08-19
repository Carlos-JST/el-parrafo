/* ==========================================================================
   componentes/cabecera.js — todo lo que rodea al contenido
   --------------------------------------------------------------------------
   Menú móvil, barra de secciones fija, barra de progreso y la fecha del
   día. Nada de esto depende de los artículos, así que arranca de inmediato
   sin esperar a que carguen los datos.
   ========================================================================== */

import { elemento, elementos } from '../utilidades/texto.js';

export function iniciarCabecera() {
  mostrarFechaDeHoy();
  const menu = iniciarMenuMovil();
  iniciarBarraFija();
  return menu;
}

/* ------------------------------------------------------------------
   Fecha real del día en la barra superior
   ------------------------------------------------------------------ */
function mostrarFechaDeHoy() {
  const campo = document.getElementById('fecha-hoy');
  if (!campo) return;

  const hoy = new Date();
  const formato = new Intl.DateTimeFormat('es-DO', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  campo.textContent = formato.format(hoy);
  campo.setAttribute('datetime', hoy.toISOString().slice(0, 10));
}

/* ------------------------------------------------------------------
   Menú móvil
   ------------------------------------------------------------------ */
function iniciarMenuMovil() {
  const boton = elemento('.boton-menu');
  const menu = document.getElementById('menu-movil');
  const nav = document.getElementById('nav');
  if (!boton || !menu) return null;

  const panel = elemento('.menu-movil__panel', menu);

  function estaAbierto() { return !menu.hidden; }

  /* El panel se despliega justo debajo de la cabecera.
     getBoundingClientRect().bottom dice a qué altura de la pantalla
     termina la barra de navegación en este momento. */
  function colocarBajoLaCabecera() {
    const limite = nav ? nav.getBoundingClientRect().bottom : 0;
    menu.style.setProperty('--alto-cabecera', Math.max(0, limite) + 'px');
  }

  function abrir() {
    colocarBajoLaCabecera();
    menu.hidden = false;
    boton.setAttribute('aria-expanded', 'true');   // el CSS cambia el icono a X
    document.body.classList.add('sin-scroll');

    const primerEnlace = elemento('a', panel);
    if (primerEnlace) primerEnlace.focus();
  }

  function cerrar(devolverFoco) {
    if (!estaAbierto()) return;
    menu.hidden = true;
    boton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('sin-scroll');
    if (devolverFoco) boton.focus();
  }

  boton.addEventListener('click', function () {
    if (estaAbierto()) cerrar(true);
    else abrir();
  });

  // Pulsar fuera (el fondo oscuro) cierra el menú
  elementos('[data-cerrar-menu]', menu).forEach(function (el) {
    el.addEventListener('click', function () { cerrar(false); });
  });

  // Elegir una categoría cierra el menú
  elementos('a', panel).forEach(function (enlace) {
    enlace.addEventListener('click', function () { cerrar(false); });
  });

  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && estaAbierto()) {
      cerrar(true);
      return;
    }

    // Tab da vueltas dentro del panel mientras está abierto
    if (evento.key !== 'Tab' || !estaAbierto()) return;

    const enfocables = elementos('a[href], button', panel);
    if (enfocables.length === 0) return;

    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];

    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  });

  window.addEventListener('resize', function () {
    if (estaAbierto()) colocarBajoLaCabecera();
  });

  window.matchMedia('(min-width: 62em)').addEventListener('change', function (e) {
    if (e.matches) cerrar(false);
  });

  return { abrir: abrir, cerrar: cerrar, estaAbierto: estaAbierto };
}

/* ------------------------------------------------------------------
   Barra fija: sombra, marca ¶ y progreso de lectura
   ------------------------------------------------------------------
   Tres cosas dependen del scroll y van en UN SOLO listener. Además
   usamos requestAnimationFrame: el evento se dispara decenas de veces
   por segundo pero la pantalla solo se redibuja 60, así que calculamos
   una vez por fotograma y no más.
   ------------------------------------------------------------------ */
function iniciarBarraFija() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const cabecera = elemento('.cabecera');

  const caja = document.createElement('div');
  caja.className = 'nav__marca-caja';
  caja.setAttribute('aria-hidden', 'true');    // decorativa: no se lee en voz alta

  const marca = document.createElement('span');
  marca.className = 'nav__marca';
  marca.textContent = '\u00B6';
  caja.append(marca);
  nav.append(caja);

  const progreso = document.createElement('div');
  progreso.className = 'progreso-lectura';
  progreso.setAttribute('aria-hidden', 'true');
  document.body.prepend(progreso);

  /* Altura de todo lo que hay ENCIMA de la navegación. El CSS la usa como
     "top" negativo para dejar solo la franja de secciones a la vista. */
  function medirCabecera() {
    if (!cabecera) return;
    cabecera.style.setProperty('--alto-sobre-nav', nav.offsetTop + 'px');
  }

  let pendiente = false;

  function medir() {
    pendiente = false;
    nav.classList.toggle('esta-fijada', window.scrollY > nav.offsetTop);

    const recorrido = document.documentElement.scrollHeight - window.innerHeight;
    const avance = recorrido > 0 ? window.scrollY / recorrido : 0;
    progreso.style.transform = 'scaleX(' + Math.min(1, Math.max(0, avance)) + ')';
  }

  function alHacerScroll() {
    if (pendiente) return;
    pendiente = true;
    window.requestAnimationFrame(medir);
  }

  medirCabecera();
  medir();

  window.addEventListener('scroll', alHacerScroll, { passive: true });
  window.addEventListener('resize', function () {
    medirCabecera();
    alHacerScroll();
  }, { passive: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(medirCabecera);
  }

  // Otras partes del código avisan cuando cambia la altura de la cabecera
  document.addEventListener('cabecera:cambio', medirCabecera);

  /* Al añadir noticias la página se hace más alta y el progreso cambia.
     Este evento lo dispara main.js cuando termina de dibujar. */
  document.addEventListener('contenido:cambio', alHacerScroll);
}
