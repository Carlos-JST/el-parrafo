/* ==========================================================================
   EL PÁRRAFO — main.js
   --------------------------------------------------------------------------
   Todo el código vive dentro de una IIFE: una función que se ejecuta sola.
   Así ninguna variable nuestra se mezcla con las del navegador.

   Organización del archivo:

    1. CONFIG                 ajustes que puedes cambiar
    2. NOTICIAS_PORTADA       los datos del carrusel (un array de objetos)
    3. Utilidades             funciones pequeñas que se reutilizan
    4. iniciarMenuMovil()     abre y cierra el menú
    5. iniciarBusqueda()      buscador sobre los artículos de la página
    6. iniciarPortada()       carrusel de la noticia principal
    7. iniciarBoletin()       valida el correo
    8. iniciarNavFija()       sombra de la navegación al hacer scroll
    9. mostrarFechaDeHoy()    fecha real en la barra superior
   10. Arranque               se llama a todo lo anterior
   ========================================================================== */

(function () {
  'use strict';

  /* ==================================================================
     1. CONFIG — cámbialo sin tocar la lógica
     ================================================================== */
  const CONFIG = {
    rotacionAutomatica: true,   // false = el carrusel solo cambia si tú pulsas
    segundosPorNoticia: 9,      // cada cuánto cambia la noticia principal
    milisegundosTransicion: 260 // cuánto dura el fundido entre noticias
  };


  /* ==================================================================
     2. NOTICIAS_PORTADA
     Un ARRAY (lista ordenada) de OBJETOS (fichas con datos).
     Para añadir una cuarta noticia, copia un bloque { ... } y edítalo:
     el carrusel se adapta solo y crea un indicador más.
     ================================================================== */
  const NOTICIAS_PORTADA = [
    {
      categoria: 'Política',
      titulo: 'La reforma que necesita el país',
      resumen: 'Un análisis profundo sobre los desafíos estructurales que enfrenta ' +
               'la República Dominicana y las reformas que podrían transformar su futuro.',
      meta: 'Política · Por Redacción · 8 min de lectura',
      imagen: 'assets/images/portada-1.svg',
      alt: 'Fachada del Palacio Nacional con su cúpula y la bandera dominicana',
      enlace: '#'
    },
    {
      categoria: 'Economía',
      titulo: 'República Dominicana ante nuevos desafíos económicos',
      resumen: 'El consumo interno pierde fuerza y las exportaciones sostienen las cifras. ' +
               'Los analistas piden mirar el segundo semestre con prudencia.',
      meta: 'Economía · Por Laura Beltré · 6 min de lectura',
      imagen: 'assets/images/portada-2.svg',
      alt: 'Silueta de la ciudad al atardecer con el sol descendiendo',
      enlace: '#'
    },
    {
      categoria: 'Internacional',
      titulo: 'El futuro político de América Latina',
      resumen: 'Una región que vota casi sin pausa y que llega a cada elección con las ' +
               'mismas preguntas todavía sin responder.',
      meta: 'Internacional · Por Josué Fermín · 7 min de lectura',
      imagen: 'assets/images/noticia-internacional.svg',
      alt: 'Salón de una asamblea internacional con banderas y podio',
      enlace: '#'
    }
  ];


  /* ==================================================================
     3. UTILIDADES
     ================================================================== */

  // ¿El usuario pidió menos animaciones en su sistema operativo?
  const prefiereMenosMovimiento =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Deja un texto listo para comparar:  "Economía" → "economia"
     Así "economia", "ECONOMÍA" y "Economía" cuentan como lo mismo.
     normalize('NFD') separa la letra de su tilde y luego borramos las tildes. */
  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  // Atajos para escribir menos
  function elemento(selector, dentroDe) {
    return (dentroDe || document).querySelector(selector);
  }

  function elementos(selector, dentroDe) {
    return Array.from((dentroDe || document).querySelectorAll(selector));
  }


  /* ==================================================================
     4. MENÚ MÓVIL
     Devuelve un objeto { abrir, cerrar, estaAbierto } para que otras
     partes del código puedan cerrarlo sin conocer sus detalles.
     ================================================================== */
  function iniciarMenuMovil() {
    const boton = elemento('.boton-menu');
    const menu = document.getElementById('menu-movil');
    const nav = document.getElementById('nav');
    if (!boton || !menu) return null;

    const panel = elemento('.menu-movil__panel', menu);

    function estaAbierto() {
      return !menu.hidden;
    }

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

    // Un mismo botón abre y cierra
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
      // Escape cierra el menú
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

    // Si la ventana cambia de tamaño, recolocamos el panel
    window.addEventListener('resize', function () {
      if (estaAbierto()) colocarBajoLaCabecera();
    });

    // Al llegar a escritorio, el menú móvil sobra
    window.matchMedia('(min-width: 62em)').addEventListener('change', function (e) {
      if (e.matches) cerrar(false);
    });

    return { abrir: abrir, cerrar: cerrar, estaAbierto: estaAbierto };
  }


  /* ==================================================================
     5. BÚSQUEDA
     ------------------------------------------------------------------
     De dónde salen los datos:

     · Las noticias de portada, del array NOTICIAS_PORTADA.
     · Las demás se LEEN DEL HTML: todo elemento con data-articulo.

     Ventaja: si mañana añades una tarjeta en index.html, el buscador la
     encuentra sin tocar este archivo.

     En una fase posterior estos datos vendrán de PostgreSQL a través de
     Supabase: en vez de leer el HTML haremos una petición al servidor y
     recibiremos objetos con esta misma forma.
     ================================================================== */
  function iniciarBusqueda() {
    const boton = elemento('.boton-buscar');
    const panel = document.getElementById('panel-busqueda');
    const forma = document.getElementById('forma-busqueda');
    const campo = document.getElementById('campo-busqueda');
    const botonLimpiar = document.getElementById('boton-limpiar');
    const aviso = document.getElementById('aviso-busqueda');
    const lista = document.getElementById('lista-resultados');
    if (!boton || !panel || !forma || !campo) return null;

    // --- 5.1 Reunir los artículos donde vamos a buscar ---
    function leerArticulosDelHtml() {
      return elementos('[data-articulo]').map(function (caja) {
        const categoria = elemento('[data-categoria]', caja);
        const titulo = elemento('[data-titulo]', caja);
        const resumen = elemento('[data-resumen]', caja);
        const enlace = elemento('[data-enlace]', caja);

        return {
          categoria: categoria ? categoria.textContent.trim() : 'El Párrafo',
          titulo: titulo ? titulo.textContent.trim() : '',
          resumen: resumen ? resumen.textContent.replace(/\s+/g, ' ').trim() : '',
          enlace: enlace ? enlace.getAttribute('href') : '#'
        };
      });
    }

    const articulos = NOTICIAS_PORTADA.concat(leerArticulosDelHtml());

    /* Versión "plana" de cada artículo para comparar rápido.
       Se calcula una sola vez, no en cada tecla. */
    const indice = articulos.map(function (articulo) {
      return {
        articulo: articulo,
        texto: normalizar(articulo.categoria + ' ' + articulo.titulo + ' ' + articulo.resumen)
      };
    });

    // --- 5.2 Buscar ---
    function buscar(consulta) {
      const termino = normalizar(consulta);
      if (termino === '') return [];

      // includes() responde true si el texto contiene el término
      return indice
        .filter(function (fila) { return fila.texto.includes(termino); })
        .map(function (fila) { return fila.articulo; });
    }

    // --- 5.3 Pintar los resultados ---
    function pintar(resultados, consulta) {
      lista.innerHTML = '';                       // borramos lo anterior
      const limpia = consulta.trim();

      if (limpia === '') {
        aviso.textContent = '';
        return;
      }

      if (resultados.length === 0) {
        aviso.textContent = 'Sin resultados para “' + limpia + '”. Prueba con otra palabra.';
        return;
      }

      aviso.textContent = resultados.length === 1
        ? '1 resultado para “' + limpia + '”'
        : resultados.length + ' resultados para “' + limpia + '”';

      resultados.forEach(function (articulo) {
        const fila = document.createElement('li');
        fila.className = 'resultados__fila';

        const enlace = document.createElement('a');
        enlace.className = 'resultados__enlace';
        enlace.href = articulo.enlace || '#';

        const categoria = document.createElement('span');
        categoria.className = 'resultados__categoria';
        categoria.textContent = articulo.categoria;

        const titulo = document.createElement('span');
        titulo.className = 'resultados__titulo';
        titulo.textContent = articulo.titulo;

        enlace.append(categoria, titulo);
        fila.append(enlace);
        lista.append(fila);
      });
    }

    function actualizar() {
      const consulta = campo.value;
      botonLimpiar.hidden = consulta === '';
      pintar(buscar(consulta), consulta);
    }

    // --- 5.4 Abrir, cerrar y limpiar ---
    function estaAbierto() {
      return !panel.hidden;
    }

    function abrir() {
      panel.hidden = false;
      boton.setAttribute('aria-expanded', 'true');
      campo.focus();
    }

    function cerrar(devolverFoco) {
      if (!estaAbierto()) return;
      panel.hidden = true;
      boton.setAttribute('aria-expanded', 'false');
      if (devolverFoco) boton.focus();
    }

    function limpiar() {
      campo.value = '';
      actualizar();
      campo.focus();
    }

    boton.addEventListener('click', function () {
      if (estaAbierto()) cerrar(true);
      else abrir();
    });

    botonLimpiar.addEventListener('click', limpiar);

    // 'input' se dispara con cada tecla, pegado o borrado
    campo.addEventListener('input', actualizar);

    // Enter no debe recargar la página
    forma.addEventListener('submit', function (evento) {
      evento.preventDefault();
      actualizar();
    });

    // Escape: primero limpia el campo, y si ya está vacío cierra el panel
    campo.addEventListener('keydown', function (evento) {
      if (evento.key !== 'Escape') return;
      if (campo.value !== '') limpiar();
      else cerrar(true);
    });

    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && estaAbierto() && document.activeElement !== campo) {
        cerrar(true);
      }
    });

    return {
      abrir: abrir,
      cerrar: cerrar,
      estaAbierto: estaAbierto,
      totalArticulos: articulos.length
    };
  }


  /* ==================================================================
     6. PORTADA / CARRUSEL
     Un solo bloque de HTML que se rellena con los datos del array.
     ================================================================== */
  function iniciarPortada() {
    const pieza = document.getElementById('portada-pieza');
    const contenedorPuntos = document.getElementById('portada-puntos');
    if (!pieza || !contenedorPuntos || NOTICIAS_PORTADA.length === 0) return null;

    // Los huecos del HTML que vamos a rellenar
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

    // Un indicador redondo por noticia, creado a partir del array
    const puntos = NOTICIAS_PORTADA.map(function (noticia, i) {
      const punto = document.createElement('button');
      punto.type = 'button';
      punto.className = 'portada__punto';
      punto.setAttribute('aria-label', 'Ver: ' + noticia.titulo);
      punto.addEventListener('click', function () {
        ir(i);
        reiniciarRotacion();
      });
      contenedorPuntos.append(punto);
      return punto;
    });

    // Escribe los datos de una noticia dentro del HTML
    function escribir(noticia) {
      destino.categoria.textContent = noticia.categoria;
      destino.titulo.textContent = noticia.titulo;
      destino.resumen.textContent = noticia.resumen;
      destino.meta.textContent = noticia.meta;
      destino.imagen.src = noticia.imagen;
      destino.imagen.alt = noticia.alt;
      destino.enlace.href = noticia.enlace;
    }

    function marcarPuntoActivo() {
      puntos.forEach(function (punto, i) {
        const activo = i === indiceActual;
        punto.classList.toggle('es-activo', activo);
        punto.setAttribute('aria-current', activo ? 'true' : 'false');
      });
    }

    /* Cambiar de noticia: bajamos la opacidad, cambiamos el contenido y la
       subimos otra vez. El fundido en sí lo hace el CSS. */
    function ir(indice) {
      const nuevo = (indice + NOTICIAS_PORTADA.length) % NOTICIAS_PORTADA.length;
      if (yaComenzo && nuevo === indiceActual) return;

      indiceActual = nuevo;
      marcarPuntoActivo();

      if (!yaComenzo || prefiereMenosMovimiento) {
        escribir(NOTICIAS_PORTADA[indiceActual]);
        yaComenzo = true;
        return;
      }

      pieza.classList.add('esta-cambiando');
      window.setTimeout(function () {
        escribir(NOTICIAS_PORTADA[indiceActual]);
        pieza.classList.remove('esta-cambiando');
      }, CONFIG.milisegundosTransicion);
    }

    function avanzar(paso) {
      ir(indiceActual + paso);
    }

    /* Los titulares no miden lo mismo: uno ocupa dos líneas y otro cuatro.
       Sin esto, la página daría un salto cada vez que cambia la noticia.

       Truco: escribimos las tres noticias una tras otra, medimos cuál queda
       más alta y reservamos esa altura. Todo ocurre en el mismo instante,
       antes de que el navegador dibuje, así que no se ve ningún parpadeo. */
    function reservarAlturaDelTitularMasLargo() {
      pieza.style.minHeight = '0';
      let maximo = 0;

      NOTICIAS_PORTADA.forEach(function (noticia) {
        escribir(noticia);
        maximo = Math.max(maximo, pieza.getBoundingClientRect().height);
      });

      escribir(NOTICIAS_PORTADA[indiceActual]);   // dejamos la que tocaba
      pieza.style.minHeight = Math.ceil(maximo) + 'px';
    }

    function detenerRotacion() {
      window.clearInterval(temporizador);
      temporizador = null;
    }

    function reiniciarRotacion() {
      detenerRotacion();
      if (!CONFIG.rotacionAutomatica || prefiereMenosMovimiento) return;
      if (NOTICIAS_PORTADA.length < 2) return;
      temporizador = window.setInterval(function () {
        avanzar(1);
      }, CONFIG.segundosPorNoticia * 1000);
    }

    // Flechas anterior / siguiente
    elementos('[data-portada]').forEach(function (boton) {
      boton.addEventListener('click', function () {
        avanzar(boton.dataset.portada === 'siguiente' ? 1 : -1);
        reiniciarRotacion();
      });
    });

    // Teclado: flechas ← y →
    pieza.addEventListener('keydown', function (evento) {
      if (evento.key === 'ArrowRight') { avanzar(1); reiniciarRotacion(); }
      if (evento.key === 'ArrowLeft') { avanzar(-1); reiniciarRotacion(); }
    });

    // Deslizar con el dedo
    let inicioX = 0;
    pieza.addEventListener('touchstart', function (e) {
      inicioX = e.changedTouches[0].clientX;
    }, { passive: true });

    pieza.addEventListener('touchend', function (e) {
      const distancia = e.changedTouches[0].clientX - inicioX;
      if (Math.abs(distancia) < 50) return;   // fue un toque, no un deslizamiento
      avanzar(distancia < 0 ? 1 : -1);
      reiniciarRotacion();
    }, { passive: true });

    /* La rotación se detiene mientras el usuario está encima o navegando con
       el teclado: nunca cambiamos el titular que alguien está leyendo. */
    const zona = pieza.closest('.portada');
    zona.addEventListener('mouseenter', detenerRotacion);
    zona.addEventListener('mouseleave', reiniciarRotacion);
    zona.addEventListener('focusin', detenerRotacion);
    zona.addEventListener('focusout', reiniciarRotacion);

    // Si la pestaña pasa a segundo plano, no gastamos recursos
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) detenerRotacion();
      else reiniciarRotacion();
    });

    ir(0);
    reservarAlturaDelTitularMasLargo();
    reiniciarRotacion();

    /* Las tipografías de Google llegan un poco después que el HTML.
       Cuando terminan de cargar, las letras cambian de tamaño: volvemos
       a medir para que la reserva siga siendo correcta. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(reservarAlturaDelTitularMasLargo);
    }

    /* Al cambiar el ancho de la ventana cambian los saltos de línea.
       Esperamos 200 ms tras el último movimiento para no medir 60 veces
       por segundo: eso se llama "debounce". */
    let esperaMedida = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(esperaMedida);
      esperaMedida = window.setTimeout(reservarAlturaDelTitularMasLargo, 200);
    });

    return { ir: ir, avanzar: avanzar, total: NOTICIAS_PORTADA.length };
  }


  /* ==================================================================
     7. BOLETÍN
     ================================================================== */
  function iniciarBoletin() {
    const forma = document.getElementById('forma-boletin');
    const campo = document.getElementById('campo-correo');
    const aviso = document.getElementById('aviso-boletin');
    if (!forma || !campo || !aviso) return;

    forma.addEventListener('submit', function (evento) {
      evento.preventDefault();

      const correo = campo.value.trim();
      const pareceCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo);

      if (!pareceCorreo) {
        aviso.textContent = 'Escribe un correo válido, por ejemplo nombre@dominio.com';
        aviso.classList.add('es-error');
        campo.classList.add('tiene-error');
        campo.focus();
        return;
      }

      aviso.textContent = 'Listo. Guardaremos ' + correo + ' cuando conectemos el servidor.';
      aviso.classList.remove('es-error');
      campo.classList.remove('tiene-error');
      forma.reset();
    });

    campo.addEventListener('input', function () {
      campo.classList.remove('tiene-error');
      aviso.classList.remove('es-error');
    });
  }


  /* ==================================================================
     8. NAVEGACIÓN FIJA
     ================================================================== */
  function iniciarNavFija() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    function revisar() {
      nav.classList.toggle('esta-fijada', window.scrollY > nav.offsetTop);
    }

    revisar();
    window.addEventListener('scroll', revisar, { passive: true });
  }


  /* ==================================================================
     9. FECHA DE HOY
     ================================================================== */
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


  /* ==================================================================
     10. ARRANQUE
     ================================================================== */
  mostrarFechaDeHoy();
  const menu = iniciarMenuMovil();
  const busqueda = iniciarBusqueda();
  iniciarPortada();
  iniciarBoletin();
  iniciarNavFija();

  // El menú y la búsqueda no deben quedar abiertos a la vez
  if (menu && busqueda) {
    elemento('.boton-menu').addEventListener('click', function () {
      busqueda.cerrar(false);
    });
    elemento('.boton-buscar').addEventListener('click', function () {
      menu.cerrar(false);
    });
  }
})();
