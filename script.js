
'use strict';

/* =====================================================
   CONFIGURACIÓN DEL EVENTO
   ===================================================== */

const EVENTO = {
  quinceanera: 'Karlita',

  // Fecha de la misa: 21 de noviembre de 2026, 19:00.
  fecha: '2026-11-21T17:00:00-05:00',
  zonaHoraria: 'America/Guayaquil',

  lugar: {
    nombre: 'Parador Turístico Las Guaijas',
    hora:'19:00h',
    direccion: 'Vía Santa Ana - Poza Honda, Manabí',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Parador+Turistico+Las+Guaijas+Manabi'
  },

  horarios: {
    misa: '17:00',
    
  },

  vestimenta: {
    titulo: 'Formal '
  },

  // Verifica que este sea el número correcto.
  whatsapp: '593958821586',

  mensajeGenerico:
    'Y familia, nos encantaría que nos acompañes en este día tan especial.'
};

/* ===================================================== */

const $ = (id) => document.getElementById(id);
const fechaEvento = new Date(EVENTO.fecha);

/* ---------- FECHA Y FORMATO ---------- */

function fechaValida() {
  return !Number.isNaN(fechaEvento.getTime());
}

function formatoFecha(opciones, fecha = fechaEvento) {
  return new Intl.DateTimeFormat('es-EC', {
    timeZone: EVENTO.zonaHoraria,
    ...opciones
  }).format(fecha);
}

/* ---------- INVITADO PERSONALIZADO ---------- */

function normalizarNombre(valor) {
  return (valor || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 60);
}

function leerInvitado() {
  const parametros = new URLSearchParams(window.location.search);
  return normalizarNombre(parametros.get('invitado'));
}

/* ---------- NOMBRE DE LA QUINCEAÑERA ---------- */

function configurarNombre() {
  document.querySelectorAll('[data-quinceanera]').forEach((elemento) => {
    elemento.textContent = EVENTO.quinceanera;
  });

  const inicial = Array.from(EVENTO.quinceanera.trim())[0] || 'K';

  document.querySelectorAll('[data-inicial]').forEach((elemento) => {
    elemento.textContent = inicial;
  });

  document.title = `Mis quince años | ${EVENTO.quinceanera}`;
}

/* ---------- FECHA Y HORARIOS ---------- */

function configurarFecha() {
  if (!fechaValida()) {
    $('dia-semana').textContent = 'Fecha pendiente';
    $('dia-num').textContent = '—';
    $('mes-anio').textContent = '';
    $('hora').textContent = 'Actualiza la fecha en script.js';
    $('cuenta').hidden = true;
    return;
  }

  $('dia-semana').textContent = formatoFecha({
    weekday: 'long'
  });

  $('dia-num').textContent = formatoFecha({
    day: 'numeric'
  });

  $('mes-anio').textContent = formatoFecha({
    month: 'long',
    year: 'numeric'
  });

  // Los dos horarios fijos que aparecen sobre el contador.
  $('hora').textContent =
    `Misa: ${EVENTO.horarios.misa} h `;

  $('anio-final').textContent = formatoFecha({
    year: 'numeric'
  });
}

/* ---------- UBICACIÓN ---------- */

function configurarLugar() {
  const nombre = $('lugar-nombre');
  const direccion = $('lugar-dir');
  const maps = $('maps');

  if (nombre) nombre.textContent = EVENTO.lugar.nombre;
  if (direccion) direccion.textContent = EVENTO.lugar.direccion;
  if (!maps) return;

  try {
    const url = new URL(EVENTO.lugar.mapsUrl);

    if (
      url.protocol === 'https:' &&
      url.hostname === 'www.google.com'
    ) {
      maps.href = url.href;
      maps.target = '_blank';
      maps.rel = 'noopener noreferrer';
      maps.hidden = false;
    } else {
      maps.hidden = true; 
    }
  } catch {
    maps.hidden = true;
  }
}

/* ---------- OBSEQUIO: SOBRE CERRADO ---------- */

function configurarPrograma() {
  const contenedor = $('programa');
  if (!contenedor) return;

  contenedor.replaceChildren();

  const sobre = document.createElement('div');
  sobre.className = 'obsequio-sobre';
  sobre.setAttribute('role', 'img');
  sobre.setAttribute(
    'aria-label',
    'Sobre cerrado para el obsequio'
  );

  const icono = document.createElement('span');
  icono.className = 'obsequio-icono';
  icono.textContent = '✉';

  const texto = document.createElement('p');
  texto.className = 'obsequio-texto';
  texto.textContent = 'Se agradece obsequio en sobre cerrado.';

  sobre.append(icono, texto);
  contenedor.append(sobre);
}

/* ---------- CÓDIGO DE VESTIMENTA ---------- */

function configurarVestimenta() {
  const titulo = $('vest-titulo');
  const detalle = $('vest-detalle');
  const paleta = $('vest-paleta');

  if (titulo) {
    titulo.textContent = EVENTO.vestimenta.titulo;
  }

  if (detalle) detalle.hidden = true;
  if (paleta) paleta.hidden = true;
}

/* ---------- CONFIRMACIÓN POR WHATSAPP ---------- */

function configurarConfirmacion(invitado) {
  const texto = $('rsvp-texto');
  const enlace = $('whatsapp');

  if (!texto || !enlace) return;

  texto.textContent =
    'Confirma tu asistencia para ayudarnos a preparar cada detalle con cariño.';

  const numero = EVENTO.whatsapp.replace(/\D/g, '');

  if (!numero || numero.length < 10) {
    enlace.hidden = true;
    texto.textContent =
      'La confirmación por WhatsApp todavía no está configurada.';
    return;
  }

  const identidad = invitado ? `Soy ${invitado} y ` : '';

  const mensaje =
    `Hola, ${identidad}confirmo mi asistencia a los quince años de ${EVENTO.quinceanera}.`;

  enlace.href =
    `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  enlace.target = '_blank';
  enlace.rel = 'noopener noreferrer';
  enlace.hidden = false;
}

/* ---------- CUENTA REGRESIVA ---------- */

function iniciarCuenta() {
  const cuenta = $('cuenta');
  if (!cuenta) return;

  const ids = {
    d: $('c-d'),
    h: $('c-h'),
    m: $('c-m'),
    s: $('c-s')
  };

  let intervalo;

  function actualizar() {
    const diferencia = fechaEvento.getTime() - Date.now();

    if (diferencia <= 0) {
      if (intervalo) clearInterval(intervalo);

      cuenta.hidden = true;

      const hoy = formatoFecha(
        {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        },
        new Date()
      );

      const diaEvento = formatoFecha({
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      const cuentaFin = $('cuenta-fin');
      const eventoPasado = $('evento-pasado');

      if (hoy === diaEvento) {
        if (cuentaFin) cuentaFin.hidden = false;
      } else {
        if (eventoPasado) eventoPasado.hidden = false;
      }

      return;
    }

    if (ids.d) ids.d.textContent = Math.floor(diferencia / 86400000);
    if (ids.h) ids.h.textContent = Math.floor(diferencia / 3600000) % 24;
    if (ids.m) ids.m.textContent = Math.floor(diferencia / 60000) % 60;
    if (ids.s) ids.s.textContent = Math.floor(diferencia / 1000) % 60;
  }

  if (!fechaValida()) {
    cuenta.hidden = true;
    return;
  }

  actualizar();

  if (fechaEvento.getTime() > Date.now()) {
    intervalo = setInterval(actualizar, 1000);
  }
}

/* ---------- APERTURA DE LA INVITACIÓN ---------- */

function abrirInvitacion() {
  const portada = $('portada');
  const boton = $('abrir');
  const contenido = $('contenido');

  if (!portada || !boton || !contenido) return;

  const movimientoReducido = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  boton.disabled = true;
  portada.classList.add('abierta');

  function mostrarContenido() {
    portada.hidden = true;
    contenido.hidden = false;

    window.scrollTo(0, 0);

    const saludo = $('saludo');
    if (saludo) saludo.focus({ preventScroll: true });
  }

  if (movimientoReducido) {
    mostrarContenido();
    return;
  }

  setTimeout(() => portada.classList.add('saliendo'), 1100);
  setTimeout(mostrarContenido, 1750);
}

/* ---------- INICIALIZACIÓN ---------- */

function iniciar() {
  configurarNombre();

  const invitado = leerInvitado();
  const saludo = $('saludo');

  if (saludo) {
    saludo.textContent = invitado
      ? `${invitado}, nos encantaría que nos acompañes en este día tan especial.`
      : EVENTO.mensajeGenerico;

    saludo.setAttribute('tabindex', '-1');
  }

  const hero = document.querySelector('.hero');

  if (hero) {
    hero.setAttribute(
      'aria-label',
      `Invitación de ${EVENTO.quinceanera}`
    );
  }

  // Los nombres de los padres son opcionales.
  const padres = $('padres');

  if (padres) {
    padres.textContent = EVENTO.padres || '';
    padres.hidden = !EVENTO.padres;
  }

  configurarFecha();
  configurarLugar();
  configurarPrograma();
  configurarVestimenta();
  configurarConfirmacion(invitado);
  iniciarCuenta();

  const botonAbrir = $('abrir');

  if (botonAbrir) {
    botonAbrir.addEventListener(
      'click',
      abrirInvitacion,
      { once: true }
    );
  }
}

iniciar();
