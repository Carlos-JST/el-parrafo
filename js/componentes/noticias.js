/* ==========================================================================
   componentes/noticias.js — la rejilla, los filtros y "lo más leído"
   --------------------------------------------------------------------------
   Aquí vive el patrón que repetirás toda tu carrera:

       ESTADO  →  se dibuja la pantalla  →  el usuario actúa
          ↑                                        │
          └────────── cambia el estado ────────────┘

   El "estado" aquí es una sola variable: categoriaActiva. Cuando cambia,
   se vuelve a dibujar la rejilla. No modificamos tarjetas sueltas ni
   escondemos unas y enseñamos otras: partimos de los datos y redibujamos.
   Suena costoso y no lo es, y a cambio nunca hay incoherencias.
   ========================================================================== */

import { crearTarjeta, crearTarjetaFantasma } from './tarjeta.js';
import { elemento, fechaLegible, rutas } from '../utilidades/texto.js';

const CATEGORIAS = ['Todas', 'Política', 'Economía', 'Sociedad',
                    'Internacional', 'Cultura', 'Opinión', 'Especiales'];

const CLAVE_GUARDADA = 'elparrafo:categoria';
const CUANTAS_MAS_LEIDAS = 5;
const NOTICIAS_POR_TANDA = 9;   // cuántas se ven antes de pulsar "Ver más"

export function mostrarCargando() {
  const rejilla = document.getElementById('rejilla-noticias');
  if (!rejilla) return;

  rejilla.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    rejilla.append(crearTarjetaFantasma());
  }

  const estado = document.getElementById('estado-noticias');
  if (estado) estado.textContent = 'Cargando noticias\u2026';
}

export function mostrarError(alReintentar) {
  const rejilla = document.getElementById('rejilla-noticias');
  const estado = document.getElementById('estado-noticias');
  if (!rejilla || !estado) return;

  rejilla.innerHTML = '';
  estado.innerHTML = '';
  estado.classList.add('estado--error');

  const texto = document.createElement('p');
  texto.textContent = 'No pudimos cargar las noticias. Comprueba tu conexi\u00F3n e int\u00E9ntalo otra vez.';

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'boton boton--secundario';
  boton.textContent = 'Reintentar';
  boton.addEventListener('click', alReintentar);

  estado.append(texto, boton);
}

/* opciones.conFiltros = false en la página de sección: allí ya sabemos
   qué categoría se muestra, así que la barra de filtros sobra.
   El resto del componente funciona igual. */
export function iniciarNoticias(articulos, opciones) {
  const rejilla = document.getElementById('rejilla-noticias');
  const cajaFiltros = document.getElementById('filtros');
  const estado = document.getElementById('estado-noticias');
  const conteo = document.getElementById('conteo-noticias');
  if (!rejilla) return;

  const conFiltros = Boolean(cajaFiltros) && (!opciones || opciones.conFiltros !== false);

  if (estado) estado.classList.remove('estado--error');

  const botonVerMas = document.getElementById('ver-mas');

  /* --- ESTADO: dos variables mandan sobre todo lo que se ve ---
     Cambiar una de ellas y volver a dibujar es la ÚNICA forma de que
     cambie la pantalla. Nunca tocamos tarjetas sueltas a mano. */
  let categoriaActiva = conFiltros ? recuperarCategoria() : 'Todas';
  let cuantasVisibles = NOTICIAS_POR_TANDA;

  // --- 1. Botones de filtro (solo donde hacen falta) ---
  if (conFiltros) construirFiltros();

  function construirFiltros() {
    cajaFiltros.innerHTML = '';
    CATEGORIAS.forEach(function (nombre) {
    const cuantos = nombre === 'Todas'
      ? articulos.length
      : articulos.filter(function (a) { return a.categoria === nombre; }).length;

      if (cuantos === 0) return;           // no mostramos filtros vacíos

      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'filtro';
      boton.dataset.categoria = nombre;
      boton.setAttribute('aria-pressed', 'false');
      boton.innerHTML = nombre + ' <span class="filtro__cuenta">' + cuantos + '</span>';
      cajaFiltros.append(boton);
    });
  }

  /* DELEGACIÓN DE EVENTOS: un solo listener en el contenedor en lugar de
     uno por botón. Los botones los acabamos de crear con JavaScript; si
     mañana añades una categoría, el listener ya la cubre sin tocar nada.
     event.target es el elemento exacto que se pulsó; closest sube por sus
     padres hasta encontrar el botón. */
  if (conFiltros) cajaFiltros.addEventListener('click', function (evento) {
    const boton = evento.target.closest('.filtro');
    if (!boton) return;
    categoriaActiva = boton.dataset.categoria;
    cuantasVisibles = NOTICIAS_POR_TANDA;   // al cambiar de sección, volvemos al principio
    guardarCategoria(categoriaActiva);
    dibujar();
  });

  // --- 2. Dibujar la rejilla según el estado ---
  function dibujar() {
    const visibles = categoriaActiva === 'Todas'
      ? articulos
      : articulos.filter(function (a) { return a.categoria === categoriaActiva; });

    // Marcar qué filtro está activo
    if (conFiltros) {
      Array.from(cajaFiltros.children).forEach(function (boton) {
        const activo = boton.dataset.categoria === categoriaActiva;
        boton.classList.toggle('es-activo', activo);
        boton.setAttribute('aria-pressed', String(activo));
      });
    }

    /* Construimos todas las tarjetas dentro de un DocumentFragment: una
       bolsa que vive en memoria, fuera de la página. Al final la soltamos
       de una sola vez. Así el navegador recalcula el diseño UNA vez en
       lugar de veintidós. */
    const enPantalla = visibles.slice(0, cuantasVisibles);

    const bolsa = document.createDocumentFragment();
    enPantalla.forEach(function (articulo) {
      bolsa.append(crearTarjeta(articulo));
    });

    rejilla.innerHTML = '';
    rejilla.append(bolsa);

    // Botón "Ver más": solo aparece si quedan noticias por mostrar
    if (botonVerMas) {
      const quedan = visibles.length - enPantalla.length;
      botonVerMas.hidden = quedan === 0;
      botonVerMas.textContent = 'Ver ' + Math.min(quedan, NOTICIAS_POR_TANDA) + ' noticias más';
    }

    // Avisa a main.js para que vigile las tarjetas nuevas
    document.dispatchEvent(new Event('contenido:cambio'));

    if (estado) {
      estado.textContent = visibles.length === 0
        ? 'No hay noticias en esta secci\u00F3n todav\u00EDa.'
        : '';
    }

    if (conteo) {
      conteo.textContent = enPantalla.length + ' de ' + visibles.length +
        (visibles.length === 1 ? ' noticia' : ' noticias');
    }
  }

  if (botonVerMas) {
    botonVerMas.addEventListener('click', function () {
      cuantasVisibles += NOTICIAS_POR_TANDA;
      dibujar();
      /* Devolvemos el foco a la primera tarjeta nueva: quien navega con
         teclado no debe perderse al final de la lista. */
      const nuevas = rejilla.children[cuantasVisibles - NOTICIAS_POR_TANDA];
      if (nuevas) {
        const enlace = nuevas.querySelector('a');
        if (enlace) enlace.focus({ preventScroll: true });
      }
    });
  }

  /* --- 3. Lo más leído ---
     En la portada son los más leídos de todo el periódico. En una página
     de sección también: al lector le interesa lo más leído del diario,
     no lo más leído de las cuatro noticias que ya tiene delante.
     Por eso se puede pasar una lista distinta con opciones.masLeidos. */
  dibujarMasLeido((opciones && opciones.masLeidos) || articulos);

  dibujar();
  return { dibujar: dibujar };
}

/* Los cinco artículos con más lecturas.
   slice() antes de sort() no es un capricho: sort MODIFICA el array
   original, y no queremos reordenar la lista que usa todo lo demás. */
function dibujarMasLeido(articulos) {
  const lista = document.getElementById('lista-mas-leido');
  if (!lista) return;

  const masLeidos = articulos
    .slice()
    .sort(function (a, b) { return b.lecturas - a.lecturas; })
    .slice(0, CUANTAS_MAS_LEIDAS);

  const bolsa = document.createDocumentFragment();

  masLeidos.forEach(function (articulo, i) {
    const fila = document.createElement('li');
    fila.className = 'mas-leido__fila';

    const numero = document.createElement('span');
    numero.className = 'mas-leido__numero';
    numero.textContent = String(i + 1).padStart(2, '0');   // 1 → "01"

    const enlace = document.createElement('a');
    enlace.className = 'mas-leido__enlace';
    enlace.href = rutas.articulo(articulo.slug);

    const titulo = document.createElement('span');
    titulo.className = 'mas-leido__texto';
    titulo.textContent = articulo.titulo;

    const meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = articulo.categoria + ' \u00B7 ' + fechaLegible(articulo.fecha);

    enlace.append(titulo, meta);
    fila.append(numero, enlace);
    bolsa.append(fila);
  });

  lista.innerHTML = '';
  lista.append(bolsa);
}

/* Rellena la franja de opinión con la columna más reciente */
export function dibujarOpinion(articulos) {
  const columna = articulos.find(function (a) { return a.categoria === 'Opinión'; });
  if (!columna) return;

  const destino = {
    titulo: elemento('[data-opinion-titulo]'),
    resumen: elemento('[data-opinion-resumen]'),
    autor: elemento('[data-opinion-autor]'),
    imagen: elemento('[data-opinion-imagen]'),
    enlace: elemento('[data-opinion-enlace]')
  };

  if (destino.titulo) destino.titulo.textContent = columna.titulo;
  if (destino.resumen) destino.resumen.textContent = columna.resumen;
  if (destino.autor) destino.autor.textContent = 'Por ' + columna.autor.nombre;
  if (destino.imagen) {
    destino.imagen.src = columna.imagen;
    destino.imagen.alt = columna.alt;
  }
  if (destino.enlace) destino.enlace.href = rutas.articulo(columna.slug);
}

/* ------------------------------------------------------------------
   localStorage: memoria del navegador que sobrevive al cerrar la pestaña.
   Guardamos SOLO la última categoría elegida: un dato sin ningún valor
   privado. Nunca guardes aquí contraseñas, tokens ni datos personales:
   cualquier script de la página puede leerlo.
   ------------------------------------------------------------------ */
function guardarCategoria(categoria) {
  try {
    localStorage.setItem(CLAVE_GUARDADA, categoria);
  } catch (error) {
    /* Falla en modo incógnito o si el usuario bloqueó el almacenamiento.
       No es grave: el sitio funciona igual, solo no recuerda la elección. */
  }
}

function recuperarCategoria() {
  try {
    const guardada = localStorage.getItem(CLAVE_GUARDADA);
    return CATEGORIAS.includes(guardada) ? guardada : 'Todas';
  } catch (error) {
    return 'Todas';
  }
}
