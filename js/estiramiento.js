/*
  Meraki App — Detalle de un estiramiento: pasos con temporizador, y al
  terminar el mismo check-in "¿cómo te sentiste?" + descanso + bebida que
  ya se usa en las zonas de automasaje.

  Los pasos se piden en tiempo real a Supabase (tabla pasos_estiramiento).
*/

let usuarioEstiramiento = null;
const idEstiramiento = new URLSearchParams(window.location.search).get('id');
const estiramiento = obtenerEstiramientoPorId(idEstiramiento);

const contenedorEst = document.getElementById('contenido-estiramiento');

let pasosEst = [];
let pasoIndiceEst = 0;
let segundosRestantesEst = 0;
let temporizadorIdEst = null;
let enPausaEst = true;
let modoEst = 'pasos'; // pasos | checkin | descanso | final
let checkinRespuestaEst = null;
let bebidaElegidaEst = null;

function tieneAccesoEstiramiento() {
  return usuarioEstiramiento.rol === 'admin' || usuarioEstiramiento.estado_suscripcion === 'activo';
}

function puedeVerEstiramiento() {
  return !estiramiento.premium || tieneAccesoEstiramiento();
}

async function categoriaBebidaEstiramiento(usuarioId, item) {
  if (item.grupo === 'piernas') return 'hidratacion';
  const señales = await señalesDescansoEnergia(usuarioId);
  if (señales.includes('sueno')) return 'sueno';
  if (señales.includes('energia')) return 'energia';
  return 'relajacion';
}

async function renderEst() {
  if (!estiramiento) {
    contenedorEst.innerHTML = '<p>No encontramos este estiramiento.</p>';
    return;
  }

  document.getElementById('titulo-estiramiento').textContent = estiramiento.nombre;

  if (!puedeVerEstiramiento()) {
    renderCandadoEst();
    return;
  }

  if (modoEst === 'pasos') await renderPasosEst();
  else if (modoEst === 'checkin') renderCheckinEst();
  else if (modoEst === 'descanso') await renderDescansoEst();
  else if (modoEst === 'final') renderFinalEst();
}

function renderEncabezadoEst() {
  const etiqueta = estiramiento.premium
    ? '<span class="etiqueta etiqueta-premium">Premium</span>'
    : '<span class="etiqueta etiqueta-gratis">Gratis</span>';
  return `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
      <h1 style="margin-bottom:0;">${estiramiento.nombre}</h1>
      ${etiqueta}
    </div>
    <img src="${estiramiento.imagen}" alt="${estiramiento.nombre}" class="foto-tecnica" />
    <div class="tarjeta">
      <span class="etiqueta-info" style="font-weight:700; font-size:13px; text-transform:uppercase; color:#b3453e; display:block; margin-bottom:6px;">Cuándo evitarlo</span>
      <p style="margin-bottom:0;">${estiramiento.contraindicacion}</p>
    </div>
  `;
}

function renderCandadoEst() {
  contenedorEst.innerHTML = renderEncabezadoEst() + `
    <div class="tarjeta candado">
      <div class="icono-candado">🔒</div>
      <h3>Este estiramiento es Premium</h3>
      <p class="texto-suave">Suscríbete para desbloquearlo.</p>
      <button class="boton boton-primario" id="boton-suscribirse-est" style="margin-top:8px;">Quiero suscribirme</button>
    </div>
  `;
  document.getElementById('boton-suscribirse-est').addEventListener('click', () => {
    window.open('https://pay.hotmart.com/K107739272J', '_blank');
  });
}

async function renderPasosEst() {
  if (pasosEst.length === 0) {
    contenedorEst.innerHTML = renderEncabezadoEst() + `<p class="texto-suave" style="margin-top:20px;">Cargando la técnica...</p>`;
    pasosEst = await obtenerPasosEstiramiento(estiramiento.id);
    iniciarPasoActualEst();
  }

  const paso = pasosEst[pasoIndiceEst];
  const esUltimo = pasoIndiceEst === pasosEst.length - 1;

  contenedorEst.innerHTML = renderEncabezadoEst() + `
    <div class="tarjeta">
      <div class="paso-contador">Paso ${pasoIndiceEst + 1} de ${pasosEst.length}</div>
      <h3>${paso.titulo}</h3>
      <p>${paso.detalle}</p>
      <div class="temporizador" id="texto-temporizador-est">${formatearTiempoEst(segundosRestantesEst || paso.segundos)}</div>
      <div class="controles-paso" style="margin-bottom:10px;">
        <button class="boton boton-secundario" id="boton-pausa-est">${enPausaEst ? 'Iniciar' : 'Pausar'}</button>
        <button class="boton boton-secundario" id="boton-reiniciar-est">Reiniciar</button>
      </div>
      <button class="boton boton-primario" id="boton-siguiente-paso-est">${esUltimo ? 'Terminar' : 'Siguiente paso'}</button>
    </div>
  `;

  document.getElementById('boton-pausa-est').addEventListener('click', alternarPausaEst);
  document.getElementById('boton-reiniciar-est').addEventListener('click', reiniciarPasoEst);
  document.getElementById('boton-siguiente-paso-est').addEventListener('click', siguientePasoEst);
}

function formatearTiempoEst(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function iniciarPasoActualEst() {
  detenerTemporizadorEst();
  segundosRestantesEst = pasosEst[pasoIndiceEst].segundos;
  enPausaEst = true;
}

function detenerTemporizadorEst() {
  if (temporizadorIdEst) {
    clearInterval(temporizadorIdEst);
    temporizadorIdEst = null;
  }
}

function alternarPausaEst() {
  if (enPausaEst) {
    enPausaEst = false;
    document.getElementById('boton-pausa-est').textContent = 'Pausar';
    temporizadorIdEst = setInterval(() => {
      segundosRestantesEst--;
      const elTexto = document.getElementById('texto-temporizador-est');
      if (elTexto) elTexto.textContent = formatearTiempoEst(Math.max(segundosRestantesEst, 0));
      if (segundosRestantesEst <= 0) {
        detenerTemporizadorEst();
        enPausaEst = true;
      }
    }, 1000);
  } else {
    enPausaEst = true;
    detenerTemporizadorEst();
    document.getElementById('boton-pausa-est').textContent = 'Iniciar';
  }
}

function reiniciarPasoEst() {
  iniciarPasoActualEst();
  renderEst();
}

async function siguientePasoEst() {
  detenerTemporizadorEst();
  if (pasoIndiceEst < pasosEst.length - 1) {
    pasoIndiceEst++;
    iniciarPasoActualEst();
    await renderEst();
    window.scrollTo(0, 0);
  } else {
    await registrarSesionHoy(usuarioEstiramiento.id);
    modoEst = 'checkin';
    await renderEst();
    window.scrollTo(0, 0);
  }
}

function renderCheckinEst() {
  contenedorEst.innerHTML = `
    <h2 style="margin-top:20px;">¿Cómo te sentiste?</h2>
    <button class="opcion-checkin" data-valor="mejor">Mejor 🙂</button>
    <button class="opcion-checkin" data-valor="igual">Igual 😐</button>
    <button class="opcion-checkin" data-valor="peor">Con más molestia 😕</button>
  `;
  contenedorEst.querySelectorAll('.opcion-checkin').forEach(boton => {
    boton.addEventListener('click', async () => {
      checkinRespuestaEst = boton.dataset.valor;
      await guardarCheckIn(usuarioEstiramiento.id, estiramiento.id, 1, checkinRespuestaEst, null);
      modoEst = 'descanso';
      renderEst();
    });
  });
}

async function renderDescansoEst() {
  let mensajeMolestia = '';
  if (checkinRespuestaEst === 'peor') {
    mensajeMolestia = `<div class="mensaje-aviso">Eso puede pasar a veces. Si persiste en tu próxima sesión, considera bajar la intensidad o consultar a un profesional.</div>`;
  }

  if (!bebidaElegidaEst) {
    const categoria = await categoriaBebidaEstiramiento(usuarioEstiramiento.id, estiramiento);
    bebidaElegidaEst = await elegirBebida(usuarioEstiramiento.id, categoria);
  }

  contenedorEst.innerHTML = `
    ${mensajeMolestia}
    <div class="tarjeta">
      <span class="etiqueta-info" style="color:var(--verde-oscuro); font-weight:700; font-size:13px; text-transform:uppercase;">Antes de seguir</span>
      <p>Deja que el músculo se relaje ahora — evita forzar la misma zona en las próximas horas. Unas respiraciones profundas ayudan a que el efecto dure más.</p>
    </div>
    <div class="tarjeta tarjeta-lavanda">
      <span class="etiqueta-info" style="color:var(--negro); font-weight:700; font-size:13px; text-transform:uppercase;">Tip de autocuidado de hoy</span>
      <h3 style="margin-top:6px;">${bebidaElegidaEst.nombre}</h3>
      <p style="margin-bottom:6px;">${bebidaElegidaEst.detalle}</p>
      <p class="texto-suave" style="margin-bottom:0;">Esto no reemplaza tratamiento médico — si tienes dudas, consulta a tu médico.</p>
    </div>
    <button class="boton boton-primario" id="boton-continuar-est">Continuar</button>
  `;
  document.getElementById('boton-continuar-est').addEventListener('click', () => {
    modoEst = 'final';
    renderEst();
  });
}

function renderFinalEst() {
  contenedorEst.innerHTML = `
    <div class="tarjeta centrado" style="margin-top:40px;">
      <div style="font-size:40px;">✅</div>
      <h2>¡Listo!</h2>
      <p class="texto-suave">Completaste el estiramiento de ${estiramiento.nombre}. Recuerda escuchar a tu cuerpo y detenerte si algo no se siente bien.</p>
      <a href="inicio.html" class="boton boton-primario" style="margin-bottom:10px;">Volver a Inicio</a>
      <a href="estiramientos.html" class="boton boton-secundario">Ver otro estiramiento</a>
    </div>
  `;
}

/* ---------- Arranque ---------- */

(async function iniciar() {
  usuarioEstiramiento = await requiereSesion();
  if (!usuarioEstiramiento || !estiramiento) return;
  await renderEst();
})();
