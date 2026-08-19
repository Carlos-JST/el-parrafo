/* ==========================================================================
   componentes/buscador.js — búsqueda sobre los datos
   --------------------------------------------------------------------------
   Antes leíamos los títulos del HTML. Ahora buscamos directamente en la
   lista de artículos, así que también encuentra por AUTOR y por resumen,
   y encuentra noticias aunque no estén visibles por culpa de un filtro.
   ========================================================================== */

import { normalizar, elemento } from '../utilidades/texto.js';

export function iniciarBuscador(articulos) {
  const boton = elemento('.boton-buscar');
  const panel = document.getElementById('panel-busqueda');
  const forma = document.getElementById('forma-busqueda');
  const campo = document.getElementById('campo-busqueda');
  const botonLimpiar = document.getElementById('boton-limpiar');
  const aviso = document.getElementById('aviso-busqueda');
  const lista = document.getElementById('lista-resultados');
  if (!boton || !panel || !forma || !campo) return null;

  /* Índice: una versión "plana" de cada artículo con todo lo buscable
     junto y sin tildes. Se calcula UNA vez, no en cada tecla. */
  const indice = articulos.map(function (articulo) {
    return {
      articulo: articulo,
      texto: normalizar([
        articulo.titulo,
        articulo.categoria,
        articulo.autor.nombre,
        articulo.resumen
      ].join(' '))
    };
  });

  function buscar(consulta) {
    const termino = normalizar(consulta);
    if (termino === '') return [];

    return indice
      .filter(function (fila) { return fila.texto.includes(termino); })
      .map(function (fila) { return fila.articulo; });
  }

  function pintar(resultados, consulta) {
    lista.innerHTML = '';
    const limpia = consulta.trim();

    if (limpia === '') {
      aviso.textContent = '';
      return;
    }

    if (resultados.length === 0) {
      aviso.textContent = 'No encontramos noticias relacionadas con \u201C' + limpia + '\u201D.';
      return;
    }

    aviso.textContent = resultados.length === 1
      ? '1 resultado para \u201C' + limpia + '\u201D'
      : resultados.length + ' resultados para \u201C' + limpia + '\u201D';

    const bolsa = document.createDocumentFragment();

    resultados.slice(0, 8).forEach(function (articulo) {
      const fila = document.createElement('li');
      fila.className = 'resultados__fila';

      const enlace = document.createElement('a');
      enlace.className = 'resultados__enlace';
      enlace.href = '#';
      enlace.dataset.slug = articulo.slug;

      const categoria = document.createElement('span');
      categoria.className = 'resultados__categoria';
      categoria.textContent = articulo.categoria;

      const titulo = document.createElement('span');
      titulo.className = 'resultados__titulo';
      titulo.textContent = articulo.titulo;

      const autor = document.createElement('span');
      autor.className = 'meta';
      autor.textContent = 'Por ' + articulo.autor.nombre;

      enlace.append(categoria, titulo, autor);
      fila.append(enlace);
      bolsa.append(fila);
    });

    lista.append(bolsa);

    if (resultados.length > 8) {
      aviso.textContent += ' \u00B7 mostrando los 8 primeros';
    }
  }

  function actualizar() {
    const consulta = campo.value;
    botonLimpiar.hidden = consulta === '';
    pintar(buscar(consulta), consulta);
  }

  function estaAbierto() { return !panel.hidden; }

  function abrir() {
    panel.hidden = false;
    boton.setAttribute('aria-expanded', 'true');

    /* El panel vive encima de la navegación. Si la página está bajada, la
       cabecera está fija con su parte alta fuera de la pantalla y el panel
       no se vería: subimos primero al principio. */
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

  // 'submit': Enter no debe recargar la página
  forma.addEventListener('submit', function (evento) {
    evento.preventDefault();
    actualizar();
  });

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

  return { abrir: abrir, cerrar: cerrar, estaAbierto: estaAbierto };
}
