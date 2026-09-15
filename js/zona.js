/*
  Meraki App — Pantalla de detalle de zona: niveles con candado, diagramas,
  temporizador, gráfico de estrés (solo zonas emocionales), y el check-in
  de "¿cómo te sentiste?" + descanso + bebida al terminar cada nivel.

  Los pasos de cada nivel se piden en tiempo real a Supabase (tabla
  pasos_zona). Si la zona es premium y la persona no tiene acceso, la base
  de datos simplemente no entrega esos pasos (Row Level Security) — esta
  pantalla además evita mostrar el candado equivocado revisando el acceso
  antes de pedirlos.
*/

let usuarioZona = null;
const idZona = new URLSearchParams(window.location.search).get('id');
const zona = obtenerZonaPorId(idZona);

const contenedor = document.getElementById('contenido-zona');

let nivelIndice = 0;
let nivelCargadoIndice = -1;
let pasosActuales = [];
let pasoIndice = 0;
let segundosRestantes = 0;
let temporizadorId = null;
let enPausa = true;
let modo = 'niveles'; // niveles | checkin | checkinExtra | descanso | final
let checkinRespuestaTemp = null;
let bebidaElegida = null;

/* ---------- Guía general de la técnica, según el tipo de movimiento ----------
   No repite lo que ya dice el paso específico — explica de forma general
   qué es un punto gatillo y cómo se siente, y cómo ejecutar cada tipo de
   movimiento (por qué calentar, cómo sostener la presión y soltar, cómo
   deslizar con presión media y cuántas veces repetir). */
const GUIA_TECNICA = {
  deslizar: '<strong>¿Por qué calentar primero?</strong> Deslizar antes de presionar prepara el músculo, mejora la circulación y hace que el punto de tensión duela menos al trabajarlo después. Desliza con una presión media y pareja, sin detenerte todavía en ningún punto — puedes repetir el recorrido 3 a 5 veces.',
  circular: '<strong>¿Qué es un punto gatillo?</strong> Es una zona pequeña del músculo que se siente como una bolita o un nudo tenso al tocarla — ahí se concentra la tensión. Con las yemas de los dedos, haz círculos pequeños y firmes justo sobre ese punto, sin deslizarte hacia otro lado.',
  sostener: '<strong>Cómo sostener la presión:</strong> cuando sientas la bolita o el punto tenso, presiona firme pero sin llegar a un dolor agudo — debe sentirse como "duele bien". Mantén esa presión contando los segundos del temporizador, y suelta poco a poco, sin quitar la mano de golpe.',
  presionar: '<strong>Cómo hacer esta presión:</strong> baja con una presión media y constante hasta sentir el punto de tensión, sostén un momento ahí, y suelta despacio. Repite el mismo recorrido 3 a 5 veces, bajando la intensidad si sientes una molestia que se dispara hacia otra parte del cuerpo.',
};

/* El formato de tiempo y los pitidos de inicio/fin viven en
   js/temporizador.js (compartido con la pantalla de masaje en pareja). */

function tieneAccesoPremium() {
  return usuarioZona.rol === 'admin' || usuarioZona.estado_suscripcion === 'activo';
}

/*
  FASE DE PRUEBA GRATUITA: mientras se está probando la app con gente
  conocida (antes de conectar el cobro), todas las zonas quedan abiertas
  para que puedan ver la técnica completa y dar su opinión — en vez de
  toparse con la pantalla de "Quiero suscribirme".

  Cuando llegue el momento de activar el cobro de verdad: cambiar esta
  función para que vuelva a usar tieneAccesoPremium(), y en Supabase
  volver a poner tiene_suscripcion_activa() con su lógica real (ver
  supabase/01_esquema_y_seguridad.sql).
*/
function puedeVerZona() {
  return true;
}

async function render() {
  if (!zona) {
    contenedor.innerHTML = '<p>No encontramos esta zona.</p>';
    return;
  }

  document.getElementById('titulo-zona').textContent = zona.nombre;

  if (!puedeVerZona()) {
    renderCandado();
    return;
  }

  if (modo === 'niveles') {
    await renderPrincipal();
  } else if (modo === 'checkin') {
    renderCheckin();
  } else if (modo === 'checkinExtra') {
    renderCheckinExtra();
  } else if (modo === 'descanso') {
    await renderDescansoBebida();
  } else if (modo === 'final') {
    renderFinal();
  }
}

function renderTarjetasInfo() {
  const etiqueta = zona.premium
    ? '<span class="etiqueta etiqueta-premium">Premium</span>'
    : '<span class="etiqueta etiqueta-gratis">Gratis</span>';

  const avisoPremium = zona.premium
    ? `<div class="tarjeta-guia-tecnica" style="background:var(--dorado, #e8c874); opacity:0.85;">🔓 Esta zona pasará a ser de pago más adelante — por ahora la estás viendo gratis mientras probamos la app. Cuéntanos qué te parece.</div>`
    : '';

  let grafico = '';
  if (zona.categoriaEmocional) {
    grafico = `
      <div class="tarjeta">
        <span class="etiqueta-info" style="color:var(--verde-oscuro);">Conexión con el estrés</span>
        ${generarGraficoEmocional()}
        <p class="texto-suave" style="margin-top:6px; margin-bottom:0;">Cuando el estrés se sostiene en el tiempo, la tensión muscular en esta zona tiende a subir mientras la sensación de calma baja — trabajar la zona ayuda a revertir esa curva.</p>
      </div>
    `;
  }

  return `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
      <h1 style="margin-bottom:0;">${zona.nombre}</h1>
      ${etiqueta}
    </div>
    ${avisoPremium}
    <div class="tarjeta info-tarjeta">
      <span class="etiqueta-info">Por qué se tensiona</span>
      <p style="margin-bottom:0;">${zona.porQue}</p>
    </div>
    <div class="tarjeta info-tarjeta">
      <span class="etiqueta-info">Dato clínico</span>
      <p style="margin-bottom:0;">${zona.datoClinico}</p>
    </div>
    <div class="tarjeta info-tarjeta evitar">
      <span class="etiqueta-info">Cuándo evitarla</span>
      <p style="margin-bottom:0;">${zona.evitarSi}</p>
    </div>
    ${grafico}
  `;
}

function generarGraficoEmocional() {
  return `
    <svg class="grafico-emocional" viewBox="0 0 260 110" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="12" font-size="10" fill="${NEGRO}" font-family="Manrope, sans-serif">Tensión muscular</text>
      <path d="M10 70 C 80 60, 140 30, 250 15" fill="none" stroke="#b3453e" stroke-width="3" stroke-linecap="round" />
      <text x="0" y="105" font-size="10" fill="${NEGRO}" font-family="Manrope, sans-serif">Calma</text>
      <path d="M10 40 C 80 55, 140 85, 250 95" fill="none" stroke="${VERDE}" stroke-width="3" stroke-linecap="round" />
      <text x="150" y="10" font-size="9" fill="#5a5a5a" font-family="Manrope, sans-serif">estrés sostenido en el tiempo →</text>
    </svg>
  `;
}

function renderCandado() {
  contenedor.innerHTML = renderTarjetasInfo() + `
    <div class="tarjeta candado">
      <div class="icono-candado">🔒</div>
      <h3>Esta zona es Premium</h3>
      <p class="texto-suave">Suscríbete para desbloquearla y ver la técnica paso a paso.</p>
      <button class="boton boton-primario" id="boton-suscribirse" style="margin-top:8px;">Quiero suscribirme</button>
    </div>
  `;
  document.getElementById('boton-suscribirse').addEventListener('click', () => {
    alert('La suscripción de pago todavía no está activa en esta versión de prueba. Se conecta más adelante.');
  });
}

function renderCaminoNiveles(estadoNiveles) {
  const botones = estadoNiveles.map(({ nivel, indice, completado, disponible, diasFaltantes }) => {
    let clase = 'nivel-boton';
    let icono = nivel.numero;
    let dia = `Día ${DIAS_NIVEL[indice]}`;
    if (completado) { clase += ' completado'; icono = '✅'; }
    else if (!disponible) { clase += ' bloqueado'; icono = '🔒'; dia = `en ${diasFaltantes}d`; }
    else if (indice === nivelIndice) { clase += ' activo'; }
    return `
      <button class="${clase}" data-indice="${indice}" ${disponible ? '' : 'disabled'}>
        <span class="icono-estado">${icono}</span>
        <span class="num">Nivel ${nivel.numero}</span>
        <span class="dia">${dia}</span>
      </button>
    `;
  }).join('');

  return `<div class="camino-niveles">${botones}</div>`;
}

async function renderPrincipal() {
  const estadoNiveles = await obtenerEstadoNiveles(usuarioZona, zona);
  const nivelInfo = estadoNiveles[nivelIndice];
  const nivel = nivelInfo.nivel;

  let contenidoNivel = '';
  if (!nivelInfo.disponible) {
    contenidoNivel = `
      <div class="tarjeta candado">
        <div class="icono-candado">🔒</div>
        <h3>Disponible en ${nivelInfo.diasFaltantes} día${nivelInfo.diasFaltantes === 1 ? '' : 's'}</h3>
        <p class="texto-suave">Este nivel se desbloquea cuando llevas más días trabajando esta zona. La constancia es parte de la técnica.</p>
      </div>
    `;
  } else {
    if (nivelCargadoIndice !== nivelIndice) {
      contenedor.innerHTML = renderTarjetasInfo() + `<h2 style="margin-top:8px; margin-bottom:0;">Niveles</h2>${renderCaminoNiveles(estadoNiveles)}<p class="texto-suave" style="margin-top:20px;">Cargando la técnica...</p>`;
      pasosActuales = await obtenerPasosNivel(zona.id, nivel.numero);
      nivelCargadoIndice = nivelIndice;
      pasoIndice = 0;
      iniciarPasoActual();
    }

    const paso = pasosActuales[pasoIndice];
    const esUltimo = pasoIndice === pasosActuales.length - 1;
    const tipoMovimiento = inferirTipoMovimiento(paso.titulo);
    contenidoNivel = `
      <h2 style="margin-top:8px;">${nivel.titulo}${nivel.avanzado ? ' <span class="etiqueta etiqueta-premium">Avanzado</span>' : ''}</h2>
      <div class="tarjeta">
        <div class="paso-contador">Paso ${pasoIndice + 1} de ${pasosActuales.length}</div>
        <div class="diagrama-unico">
          <div class="diagrama-titulo">${zona.nombre}</div>
          ${generarDiagramaCompleto(zona.id, nivel.numero, tipoMovimiento)}
        </div>
        <h3>${paso.titulo}</h3>
        <p>${paso.detalle}</p>
        <div class="tarjeta-guia-tecnica">${GUIA_TECNICA[tipoMovimiento]}</div>
        <div class="temporizador" id="texto-temporizador">${formatearTiempo(segundosRestantes || paso.segundos)}</div>
        <div class="controles-paso" style="margin-bottom:10px;">
          <button class="boton boton-secundario" id="boton-pausa">${enPausa ? 'Iniciar' : 'Pausar'}</button>
          <button class="boton boton-secundario" id="boton-reiniciar">Reiniciar</button>
        </div>
        <button class="boton boton-primario" id="boton-siguiente-paso">${esUltimo ? 'Terminar nivel' : 'Siguiente paso'}</button>
      </div>
    `;
  }

  contenedor.innerHTML = renderTarjetasInfo() + `
    <h2 style="margin-top:8px; margin-bottom:0;">Niveles</h2>
    ${renderCaminoNiveles(estadoNiveles)}
    ${contenidoNivel}
  `;

  contenedor.querySelectorAll('.nivel-boton[data-indice]').forEach(boton => {
    boton.addEventListener('click', () => {
      detenerTemporizador();
      nivelIndice = Number(boton.dataset.indice);
      segundosRestantes = 0;
      enPausa = true;
      render();
    });
  });

  if (nivelInfo.disponible) {
    document.getElementById('boton-pausa').addEventListener('click', alternarPausa);
    document.getElementById('boton-reiniciar').addEventListener('click', reiniciarPaso);
    document.getElementById('boton-siguiente-paso').addEventListener('click', siguientePaso);
  }
}


function nivelActual() {
  return zona.niveles[nivelIndice];
}

function iniciarPasoActual() {
  detenerTemporizador();
  segundosRestantes = pasosActuales[pasoIndice].segundos;
  enPausa = true;
}

function detenerTemporizador() {
  if (temporizadorId) {
    clearInterval(temporizadorId);
    temporizadorId = null;
  }
}

function alternarPausa() {
  if (enPausa) {
    enPausa = false;
    sonarInicio();
    document.getElementById('boton-pausa').textContent = 'Pausar';
    temporizadorId = setInterval(() => {
      segundosRestantes--;
      const elTexto = document.getElementById('texto-temporizador');
      if (elTexto) elTexto.textContent = formatearTiempo(Math.max(segundosRestantes, 0));
      if (segundosRestantes <= 0) {
        detenerTemporizador();
        enPausa = true;
        sonarFin();
        const elBoton = document.getElementById('boton-pausa');
        if (elBoton) elBoton.textContent = 'Iniciar';
      }
    }, 1000);
  } else {
    enPausa = true;
    detenerTemporizador();
    document.getElementById('boton-pausa').textContent = 'Iniciar';
  }
}

function reiniciarPaso() {
  iniciarPasoActual();
  render();
}

async function siguientePaso() {
  detenerTemporizador();
  const nivel = nivelActual();
  if (pasoIndice < pasosActuales.length - 1) {
    pasoIndice++;
    iniciarPasoActual();
    await render();
    window.scrollTo(0, 0);
  } else {
    await marcarNivelCompletado(usuarioZona.id, zona.id, nivel.numero);
    await registrarSesionHoy(usuarioZona.id);
    modo = 'checkin';
    await render();
    window.scrollTo(0, 0);
  }
}

/* ---------- Check-in + descanso + bebida ---------- */

function renderCheckin() {
  contenedor.innerHTML = `
    <h2 style="margin-top:20px;">¿Cómo te sentiste?</h2>
    <button class="opcion-checkin" data-valor="mejor">Mejor 🙂</button>
    <button class="opcion-checkin" data-valor="igual">Igual 😐</button>
    <button class="opcion-checkin" data-valor="peor">Con más molestia 😕</button>
  `;
  contenedor.querySelectorAll('.opcion-checkin').forEach(boton => {
    boton.addEventListener('click', async () => {
      checkinRespuestaTemp = boton.dataset.valor;
      const nivel = nivelActual();
      if (nivel.preguntaExtra) {
        modo = 'checkinExtra';
      } else {
        await guardarCheckIn(usuarioZona.id, zona.id, nivel.numero, checkinRespuestaTemp, null);
        modo = 'descanso';
      }
      render();
    });
  });
}

function renderCheckinExtra() {
  contenedor.innerHTML = `
    <h2 style="margin-top:20px;">Una pregunta más</h2>
    <p class="texto-suave">¿Sentiste el efecto en un lugar distinto al de niveles anteriores?</p>
    <button class="opcion-checkin" data-valor="si">Sí, algo distinto</button>
    <button class="opcion-checkin" data-valor="no">No, se sintió parecido</button>
  `;
  contenedor.querySelectorAll('.opcion-checkin').forEach(boton => {
    boton.addEventListener('click', async () => {
      const nivel = nivelActual();
      await guardarCheckIn(usuarioZona.id, zona.id, nivel.numero, checkinRespuestaTemp, boton.dataset.valor);
      modo = 'descanso';
      render();
    });
  });
}

async function renderDescansoBebida() {
  let mensajeMolestia = '';
  if (checkinRespuestaTemp === 'peor') {
    mensajeMolestia = `<div class="mensaje-aviso">Eso puede pasar a veces. Si persiste en tu próxima sesión, considera bajar la intensidad o consultar a un profesional.</div>`;
  }

  if (!bebidaElegida) {
    const categoria = await categoriaParaZona(usuarioZona.id, zona);
    bebidaElegida = await elegirBebida(usuarioZona.id, categoria);
  }

  contenedor.innerHTML = `
    ${mensajeMolestia}
    <div class="tarjeta">
      <span class="etiqueta-info" style="color:var(--verde-oscuro); font-weight:700; font-size:13px; text-transform:uppercase;">Antes de seguir</span>
      <p>Deja que el músculo se relaje ahora — evita repetir esta misma zona con fuerza en las próximas horas. Unas respiraciones profundas ayudan a que el efecto dure más.</p>
    </div>
    <div class="tarjeta tarjeta-lavanda">
      <span class="etiqueta-info" style="color:var(--negro); font-weight:700; font-size:13px; text-transform:uppercase;">Tip de autocuidado de hoy</span>
      <h3 style="margin-top:6px;">${bebidaElegida.nombre}</h3>
      <p style="margin-bottom:6px;">${bebidaElegida.detalle}</p>
      <p class="texto-suave" style="margin-bottom:0;">Esto no reemplaza tratamiento médico — si tienes dudas, consulta a tu médico.</p>
    </div>
    <button class="boton boton-primario" id="boton-continuar">Continuar</button>
  `;
  document.getElementById('boton-continuar').addEventListener('click', () => {
    modo = 'final';
    render();
  });
}

function renderFinal() {
  const nivel = nivelActual();
  let botonCalificacion = '';

  if (nivel.avanzado) {
    const claveOfrecida = 'meraki_calificacion_ofrecida_' + usuarioZona.id;
    if (!localStorage.getItem(claveOfrecida)) {
      localStorage.setItem(claveOfrecida, '1');
      botonCalificacion = `<a href="calificacion.html" class="boton boton-secundario" style="margin-bottom:10px;">¿Cómo calificarías tu experiencia? →</a>`;
    }
  }

  contenedor.innerHTML = `
    <div class="tarjeta centrado" style="margin-top:40px;">
      <div style="font-size:40px;">✅</div>
      <h2>¡Listo!</h2>
      <p class="texto-suave">Completaste el ${nivel.esRutinaCompleta ? 'nivel de rutina completa' : 'Nivel ' + nivel.numero} de ${zona.nombre}. Recuerda escuchar a tu cuerpo y detenerte si algo no se siente bien.</p>
      ${botonCalificacion}
      <a href="inicio.html" class="boton boton-primario" style="margin-bottom:10px;">Volver a Inicio</a>
      <a href="automasaje.html" class="boton boton-secundario">Ver otra zona</a>
    </div>
  `;
}

/* ---------- Arranque ---------- */

(async function iniciar() {
  usuarioZona = await requiereSesion();
  if (!usuarioZona || !zona) return;

  if (!puedeVerZona()) {
    render();
    return;
  }

  const estadoInicial = await obtenerEstadoNiveles(usuarioZona, zona);
  const primerNoCompletado = estadoInicial.find(e => e.disponible && !e.completado);
  nivelIndice = primerNoCompletado ? primerNoCompletado.indice : 0;
  await render();
  precargarImagenesDiagrama().then(() => render());
})();
