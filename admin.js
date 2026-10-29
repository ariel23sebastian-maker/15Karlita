
'use strict';

/*
 * URL pública del sitio.
 * En producción puedes escribir, por ejemplo:
 * const SITE_URL = 'https://mis15.netlify.app/';
 *
 * Déjala vacía para detectar automáticamente la dirección
 * del sitio desde admin.html.
 */
const SITE_URL = 'https://ariel23sebastian-maker.github.io/15Karlita/';

const $ = (id) => document.getElementById(id);
const SALUDO = ', nos encantaría que nos acompañes en este día tan especial.';

function obtenerBase() {
  try {
    let url;

    if (SITE_URL.trim()) {
      url = new URL(SITE_URL.trim());

      if (!['http:', 'https:'].includes(url.protocol)) {
        return null;
      }

      // También admite que SITE_URL termine en admin.html.
      url.pathname = url.pathname.replace(/admin\.html$/i, '');
      url.search = '';
      url.hash = '';

      if (!url.pathname.endsWith('/')) {
        url.pathname += '/';
      }
    } else {
      // file:// no permite construir enlaces web compartibles.
      if (!['http:', 'https:'].includes(window.location.protocol)) {
        return null;
      }

      // Si admin.html está en una carpeta, conserva esa ruta.
      url = new URL('./', window.location.href);
      url.search = '';
      url.hash = '';
    }

    return url;
  } catch {
    return null;
  }
}

function construirEnlace(nombre) {
  const base = obtenerBase();
 
  if (!base) {
    return null;
  }

  base.searchParams.set('invitado', nombre);
  return base.href;
}

function mostrarError(mensaje) {
  $('error').textContent = mensaje;
}

function mostrarEstado(mensaje) {
  $('estado').textContent = mensaje;
}

$('form').addEventListener('submit', (event) => {
  event.preventDefault();

  const nombre = $('nombre').value.trim().replace(/\s+/g, ' ');

  mostrarError('');
  mostrarEstado('');

  if (!nombre) {
    mostrarError('Escribe el nombre del invitado.');
    $('nombre').focus();
    return;
  }

  const enlace = construirEnlace(nombre);

  if (!enlace) {
    mostrarError(
      'No se pudo determinar la dirección de la web. Abre el proyecto mediante un servidor local o configura SITE_URL con la dirección pública.'
    );
    return;
  }

  $('enlace').value = enlace;
  $('vista').textContent = nombre + SALUDO;

  const mensaje = `Hola ${nombre}, te compartimos tu invitación a los quince años: ${enlace}`;

  $('compartir').href =
    'https://wa.me/?text=' + encodeURIComponent(mensaje);

  $('resultado').hidden = false;

  if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
    mostrarEstado(
      'Enlace local de prueba. Para compartirlo con invitados, publica la web.'
    );
  } else {
    mostrarEstado('Enlace generado correctamente.');
  }
});

$('copiar').addEventListener('click', async () => {
  const campo = $('enlace');

  try {
    if (!navigator.clipboard) {
      throw new Error('Portapapeles no disponible');
    }

    await navigator.clipboard.writeText(campo.value);
    mostrarEstado('Enlace copiado correctamente.');
  } catch {
    campo.focus();
    campo.select();

    let copiado = false;

    try {
      copiado = document.execCommand('copy');
    } catch {
      copiado = false;
    }

    mostrarEstado(
      copiado
        ? 'Enlace copiado correctamente.'
        : 'No se pudo copiar automáticamente. Selecciona y copia el enlace.'
    );
  }
});

$('nuevo').addEventListener('click', () => {
  $('form').reset();
  $('resultado').hidden = true;
  $('enlace').value = '';
  $('compartir').removeAttribute('href');
  $('vista').textContent = '';
  mostrarError('');
  mostrarEstado('');
  $('nombre').focus();
});

function mostrarAvisoInicial() {
  const aviso = $('aviso-base');

  if (SITE_URL.trim()) {
    aviso.hidden = true;
    return;
  }

  if (window.location.protocol === 'file:') {
    aviso.hidden = false;
    aviso.textContent =
      'Estás abriendo el archivo directamente. Usa Live Server en VS Code para probar la web localmente, o publica el sitio para crear enlaces compartibles.';
    return;
  }

  if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
    aviso.hidden = false;
    aviso.textContent =
      'Modo de prueba local: los enlaces funcionarán en tu computadora, pero no estarán disponibles para otras personas.';
    return;
  }

  aviso.hidden = true;
}

mostrarAvisoInicial();
