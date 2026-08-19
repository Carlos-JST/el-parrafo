/* ==========================================================================
   datos/articulos.js — de dónde salen las noticias
   --------------------------------------------------------------------------
   Este archivo es la ÚNICA puerta de entrada a los datos. Ningún otro
   módulo sabe si los artículos vienen de un archivo, de un servidor o de
   una base de datos: solo llaman a cargarArticulos() y reciben una lista.

   Hoy:      articulos.json  →  fetch  →  lista de objetos
   Mañana:   PostgreSQL      →  Supabase  →  la misma lista de objetos

   Cuando lleguemos a la Fase 7 solo cambiaremos lo de dentro de esta
   función. El resto del proyecto no se entera. A eso se le llama
   "separar la fuente de datos de la interfaz".
   ========================================================================== */

const RUTA_ARTICULOS = 'js/datos/articulos.json';
const RUTA_AUTORES = 'js/datos/autores.json';

/* async marca una función que tarda: no devuelve el resultado, devuelve
   la PROMESA de un resultado. Quien la llame tendrá que usar await. */
export async function cargarArticulos() {
  /* fetch pide un archivo por la red y tarda un tiempo impredecible.
     await significa "espera aquí a que llegue antes de seguir".
     Sin await tendríamos una promesa vacía en lugar de los datos. */
  const respuesta = await fetch(RUTA_ARTICULOS);

  /* fetch NO lanza error si el servidor responde 404 o 500: solo falla si
     no hubo conexión. Por eso comprobamos el estado a mano. */
  if (!respuesta.ok) {
    throw new Error('El servidor respondió ' + respuesta.status);
  }

  // El archivo llega como texto; .json() lo convierte en objetos de JavaScript
  const articulos = await respuesta.json();

  if (!Array.isArray(articulos)) {
    throw new Error('El archivo de noticias no tiene el formato esperado');
  }

  // Los más recientes primero, sin depender del orden del archivo
  return articulos.slice().sort(function (a, b) {
    return new Date(b.fecha) - new Date(a.fecha);
  });
}


/* Las fichas de los autores. Mismo patrón: hoy un JSON, mañana una tabla. */
export async function cargarAutores() {
  const respuesta = await fetch(RUTA_AUTORES);
  if (!respuesta.ok) throw new Error('El servidor respondió ' + respuesta.status);
  return respuesta.json();
}

/* find() devuelve el PRIMER elemento que cumpla la condición, o undefined
   si no hay ninguno. filter() devolvería una lista; aquí queremos uno solo. */
export function buscarPorSlug(articulos, slug) {
  return articulos.find(function (a) { return a.slug === slug; });
}

export function articulosDeAutor(articulos, slugAutor) {
  return articulos.filter(function (a) { return a.autor.slug === slugAutor; });
}

/* Artículos relacionados: misma categoría, sin repetir el que se está
   leyendo, los más recientes primero y como máximo tres. */
export function relacionados(articulos, articulo, cuantos) {
  return articulos
    .filter(function (a) {
      return a.categoria === articulo.categoria && a.slug !== articulo.slug;
    })
    .slice(0, cuantos || 3);
}
