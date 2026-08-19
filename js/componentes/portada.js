/* ==========================================================================
   componentes/portada.js — carrusel de la noticia principal
   --------------------------------------------------------------------------
   Ya no lleva las noticias escritas dentro: recibe la lista de destacados
   y va rellenando el mismo bloque de HTML.
   ========================================================================== */

import { elemento, elementos, prefiereMenosMovimiento } from '../utilidades/texto.js';

const CONFIG = {
  rotacionAutomatica: true,    // false = solo cambia si el lector pulsa
  segundosPorNoticia: 9,
  milisegundosTransicion: 340
};

export function iniciarPortada(destacados) {
  const pieza = document.getElementById('portada-pieza');
  const cajaPuntos = document.getElementById('portada-puntos');
  if (!pieza || !cajaPuntos || destacados.length === 0) return null;

  const destino = {
    categoria: elemento('[data-portada-categoria]', pieza),
    titulo: elemento('[data-portada-titulo]', pieza),
    resumen: elemento('[data-portada-resumen]', pieza),
    meta: elemento('[data-portada-meta]', pieza),
    imagen: elemento('[data-portada-imagen]', pieza),
    enlace: elemento('[data-portada-enlace]', pieza)
  };

  let indiceActual = 0;
  let temporizador = null;
  let yaComenzo = false;

  // Un indicador redondo por noticia destacada
  cajaPuntos.innerHTML = '';
  const puntos = destacados.map(function (noticia, i) {
    const punto = document.createElement('button');
    punto.type = 'button';
    punto.className = 'portada__punto';
    punto.setAttribute('aria-label', 'Ver: ' + noticia.titulo);
    punto.addEventListener('click', function () {
      ir(i);
      reiniciarRotacion();
    });
    cajaPuntos.append(punto);
    return punto;
  });

  function escribir(noticia) {
    destino.categoria.textContent = noticia.categoria;
    destino.titulo.textContent = noticia.titulo;
    destino.resumen.textContent = noticia.resumen;
    destino.meta.textContent = 'Por ' + noticia.autor.nombre +
                               ' \u00B7 ' + noticia.minutosLectura + ' min de lectura';
    destino.imagen.src = noticia.imagen;
    destino.imagen.alt = noticia.alt;
    destino.enlace.href = '#';
    destino.enlace.dataset.slug = noticia.slug;
  }

  function marcarPuntoActivo() {
    puntos.forEach(function (punto, i) {
      const activo = i === indiceActual;
      punto.classList.toggle('es-activo', activo);
      punto.setAttribute('aria-current', activo ? 'true' : 'false');
    });
  }

  function ir(indice) {
    const nuevo = (indice + destacados.length) % destacados.length;
    if (yaComenzo && nuevo === indiceActual) return;

    indiceActual = nuevo;
    marcarPuntoActivo();

    if (!yaComenzo || prefiereMenosMovimiento) {
      escribir(destacados[indiceActual]);
      yaComenzo = true;
      return;
    }

    /* Tres tiempos: sale hacia arriba, cambiamos el contenido mientras no
       se ve, y entra desde abajo. El doble requestAnimationFrame obliga al
       navegador a dibujar el estado inicial antes de quitar la clase; si no,
       junta las dos órdenes y no anima nada. */
    pieza.classList.add('esta-saliendo');

    window.setTimeout(function () {
      escribir(destacados[indiceActual]);
      pieza.classList.remove('esta-saliendo');
      pieza.classList.add('esta-entrando');

      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          pieza.classList.remove('esta-entrando');
        });
      });
    }, CONFIG.milisegundosTransicion);
  }

  function avanzar(paso) { ir(indiceActual + paso); }

  /* Los titulares no miden lo mismo. Sin esto la página daría un salto en
     cada cambio: escribimos las tres noticias, medimos cuál queda más alta
     y reservamos esa altura. Ocurre antes de que el navegador dibuje. */
  function reservarAltura() {
    pieza.style.minHeight = '0';
    let maximo = 0;

    destacados.forEach(function (noticia) {
      escribir(noticia);
      maximo = Math.max(maximo, pieza.getBoundingClientRect().height);
    });

    escribir(destacados[indiceActual]);
    pieza.style.minHeight = Math.ceil(maximo) + 'px';
  }

  function detenerRotacion() {
    window.clearInterval(temporizador);
    temporizador = null;
  }

  function reiniciarRotacion() {
    detenerRotacion();
    if (!CONFIG.rotacionAutomatica || prefiereMenosMovimiento) return;
    if (destacados.length < 2) return;
    temporizador = window.setInterval(function () {
      avanzar(1);
    }, CONFIG.segundosPorNoticia * 1000);
  }

  elementos('[data-portada]').forEach(function (boton) {
    boton.addEventListener('click', function () {
      avanzar(boton.dataset.portada === 'siguiente' ? 1 : -1);
      reiniciarRotacion();
    });
  });

  pieza.addEventListener('keydown', function (evento) {
    if (evento.key === 'ArrowRight') { avanzar(1); reiniciarRotacion(); }
    if (evento.key === 'ArrowLeft') { avanzar(-1); reiniciarRotacion(); }
  });

  let inicioX = 0;
  pieza.addEventListener('touchstart', function (e) {
    inicioX = e.changedTouches[0].clientX;
  }, { passive: true });

  pieza.addEventListener('touchend', function (e) {
    const distancia = e.changedTouches[0].clientX - inicioX;
    if (Math.abs(distancia) < 50) return;    // fue un toque, no un deslizamiento
    avanzar(distancia < 0 ? 1 : -1);
    reiniciarRotacion();
  }, { passive: true });

  /* Nunca cambiamos el titular que alguien está leyendo */
  const zona = pieza.closest('.portada');
  zona.addEventListener('mouseenter', detenerRotacion);
  zona.addEventListener('mouseleave', reiniciarRotacion);
  zona.addEventListener('focusin', detenerRotacion);
  zona.addEventListener('focusout', reiniciarRotacion);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) detenerRotacion();
    else reiniciarRotacion();
  });

  ir(0);
  reservarAltura();
  reiniciarRotacion();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(reservarAltura);
  }

  // "debounce": esperamos 200 ms tras el último movimiento para no medir
  // sesenta veces por segundo mientras se arrastra la ventana
  let esperaMedida = null;
  window.addEventListener('resize', function () {
    window.clearTimeout(esperaMedida);
    esperaMedida = window.setTimeout(reservarAltura, 200);
  });

  return { ir: ir, avanzar: avanzar, total: destacados.length };
}
