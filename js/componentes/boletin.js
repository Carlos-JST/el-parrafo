/* ==========================================================================
   componentes/boletin.js — formulario de suscripción
   --------------------------------------------------------------------------
   Todavía no envía nada: no tenemos servidor. Sirve para practicar
   eventos, validación y mensajes de error.
   ========================================================================== */

export function iniciarBoletin() {
  const forma = document.getElementById('forma-boletin');
  const campo = document.getElementById('campo-correo');
  const aviso = document.getElementById('aviso-boletin');
  if (!forma || !campo || !aviso) return;

  /* 'submit' se dispara al pulsar el botón o al pulsar Enter dentro del
     campo. Escuchar el submit del formulario cubre los dos casos; escuchar
     solo el click del botón dejaría fuera el Enter. */
  forma.addEventListener('submit', function (evento) {
    // Sin esto el navegador recargaría la página, su comportamiento por defecto
    evento.preventDefault();

    const correo = campo.value.trim();

    if (correo === '') {
      fallar('Escribe tu correo para suscribirte.');
      return;
    }

    /* Comprobación mínima: algo, una arroba, algo, un punto y al menos
       dos letras. Validar correos "de verdad" es imposible desde el
       navegador; lo único que confirma que existe es enviarle un mensaje. */
    const pareceCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo);

    if (!pareceCorreo) {
      fallar('Ese correo no parece válido. Prueba con nombre@dominio.com');
      return;
    }

    aviso.textContent = 'Listo. Guardaremos ' + correo + ' cuando conectemos el servidor.';
    aviso.classList.remove('es-error');
    campo.classList.remove('tiene-error');
    forma.reset();
  });

  function fallar(mensaje) {
    aviso.textContent = mensaje;
    aviso.classList.add('es-error');
    campo.classList.add('tiene-error');
    campo.focus();
  }

  // Al escribir de nuevo, limpiamos el estado de error
  campo.addEventListener('input', function () {
    campo.classList.remove('tiene-error');
    aviso.classList.remove('es-error');
  });
}
