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
    8. iniciarNavFija()       barra fija: sombra, marca ¶ y progreso de lectura
    9. mostrarFechaDeHoy()    fecha real en la barra superior
   10. iniciarRevelado()      las secciones entran al llegar a ellas
   11. Arranque               se llama a todo lo anterior
   ========================================================================== */

(function () {
  'use strict';

  /* ==================================================================
     1. CONFIG — cámbialo sin tocar la lógica
     ================================================================== */
  const CONFIG = {
    rotacionAutomatica: true,   // false = el carrusel solo cambia si tú pulsas
    segundosPorNoticia: 9,      // cada cuánto cambia la noticia principal
    milisegundosTransicion: 340, // cuánto dura la transición entre noticias
    porcionVisibleParaRevelar: 0.15  // cuánto de un bloque debe verse para que aparezca
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

      /* El panel vive encima de la navegación. Si la página está bajada,
         la cabecera está fija con su parte alta fuera de la pantalla y el
         panel no se vería: subimos primero al principio. */
      if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' });

      document.dispatchEvent(new Event('cabecera:cambio'));
      campo.focus();
    }

    function cerrar(devolverFoco) {
      if (!estaAbierto()) return;
      panel.hidden = true;
      boton.setAttribute('aria-expanded', 'false');
      document.dispatchEvent(new Event('cabecera:cambio'));
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

      /* Tres tiempos:
         1. .esta-saliendo   el texto actual se va hacia arriba
         2. cambiamos el contenido mientras no se ve
         3. .esta-entrando   el nuevo aparece desde abajo

         El doble requestAnimationFrame del paso 3 no es un capricho: si
         quitamos la clase en el mismo instante en que la ponemos, el
         navegador junta las dos órdenes y no anima nada. Esperar un
         fotograma le obliga a dibujar el estado inicial primero. */
      pieza.classList.add('esta-saliendo');

      window.setTimeout(function () {
        escribir(NOTICIAS_PORTADA[indiceActual]);
        pieza.classList.remove('esta-saliendo');
        pieza.classList.add('esta-entrando');

        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            pieza.classList.remove('esta-entrando');
          });
        });
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
     8. BARRA FIJA Y PROGRESO DE LECTURA
     ------------------------------------------------------------------
     Tres cosas dependen del scroll: la sombra de la navegación, la
     marca ¶ que aparece cuando el logo grande deja de verse, y la barra
     roja de progreso.

     Las tres van en UN SOLO listener. Si pusiéramos tres, el navegador
     ejecutaría tres funciones por cada píxel de scroll.

     Además usamos requestAnimationFrame: el evento 'scroll' se dispara
     decenas de veces por segundo, pero la pantalla solo se redibuja 60
     veces. Con esta técnica calculamos una vez por fotograma y no más.
     ================================================================== */
  function iniciarNavFija() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    // Marca ¶ dentro de la barra fija
    const caja = document.createElement('div');
    caja.className = 'nav__marca-caja';
    caja.setAttribute('aria-hidden', 'true');   // decorativa: no se lee en voz alta

    const marca = document.createElement('span');
    marca.className = 'nav__marca';
    marca.textContent = '\u00B6';
    caja.append(marca);
    nav.append(caja);

    // Barra de progreso de lectura
    const progreso = document.createElement('div');
    progreso.className = 'progreso-lectura';
    progreso.setAttribute('aria-hidden', 'true');
    document.body.prepend(progreso);

    const cabecera = document.querySelector('.cabecera');

    /* Altura de todo lo que hay ENCIMA de la navegación (barra superior,
       logo y, si está abierto, el panel de búsqueda). El CSS la usa como
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

    // Las tipografías cambian la altura del logo al terminar de cargar
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(medirCabecera);
    }

    // Otras partes del código avisan cuando cambia la altura de la cabecera
    document.addEventListener('cabecera:cambio', medirCabecera);
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
     10. REVELADO AL ENTRAR EN PANTALLA
     ------------------------------------------------------------------
     Cada bloque aparece cuando te acercas a él, en vez de estar ya ahí.
     Da sensación de que el periódico se va componiendo mientras bajas.

     Usamos IntersectionObserver: en lugar de preguntar "¿ya se ve?" en
     cada scroll (caro), le pedimos al navegador que nos avise. Él lo
     hace fuera del hilo principal, así que no cuesta rendimiento.

     Importante: el CSS solo esconde lo que tenga data-revelar, y ese
     atributo lo ponemos aquí. Si este archivo fallara, la página se
     vería completa igualmente. Nunca escondas contenido que dependa de
     que el JavaScript funcione.
     ================================================================== */
  function iniciarRevelado() {
    if (prefiereMenosMovimiento) return;
    if (!('IntersectionObserver' in window)) return;

    /* Qué se revela y en qué orden. Los grupos con varios elementos
       entran escalonados: 80 ms de diferencia entre uno y otro. */
    const grupos = [
      { selector: '.portada__pieza', escalon: 0 },
      { selector: '.seccion-cabeza', escalon: 0 },
      { selector: '.tarjeta', escalon: 80 },
      { selector: '.opinion__texto, .opinion__figura', escalon: 120 },
      { selector: '.boletin__caja', escalon: 0 },
      { selector: '.pie__rejilla > *', escalon: 60 }
    ];

    const vigilante = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('es-visible');
        vigilante.unobserve(entrada.target);   // una vez revelado, deja de vigilarlo
      });
    }, {
      /* threshold: el bloque aparece cuando se ve el 15% de él.

         Antes usaba rootMargin negativo ("espera a que entre 90px") y tenía
         un fallo real: las últimas columnas del pie quedan a menos de 90px
         del final de la página, así que nunca llegaban a cumplirlo y se
         quedaban invisibles para siempre. Con threshold no puede pasar:
         al llegar abajo del todo se ven al 100%. */
      threshold: CONFIG.porcionVisibleParaRevelar
    });

    grupos.forEach(function (grupo) {
      elementos(grupo.selector).forEach(function (el, i) {
        el.setAttribute('data-revelar', '');
        if (grupo.escalon > 0) {
          el.style.setProperty('--retraso', (i * grupo.escalon) + 'ms');
        }
        vigilante.observe(el);
      });
    });
  }


  /* ==================================================================
     11. ARRANQUE
     ================================================================== */
  mostrarFechaDeHoy();
  const menu = iniciarMenuMovil();
  const busqueda = iniciarBusqueda();
  iniciarPortada();
  iniciarBoletin();
  iniciarNavFija();
  iniciarRevelado();

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
