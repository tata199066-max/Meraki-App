/*
  Meraki App — Quiz de ingreso (12 preguntas del documento + 1 pregunta corta
  de sueño/energía para poder elegir bien la bebida de autocuidado, + consentimiento).
  Las respuestas se guardan localmente por ahora (ver js/data.js).
*/

let usuarioQuiz = null;

const OPCIONES_ZONAS_DOLOR = [
  { valor: 'cuello', texto: 'Cuello' },
  { valor: 'cabeza', texto: 'Cabeza / sienes' },
  { valor: 'mandibula', texto: 'Mandíbula' },
  { valor: 'hombros', texto: 'Hombros' },
  { valor: 'espalda_alta', texto: 'Espalda alta (omóplatos)' },
  { valor: 'espalda_media', texto: 'Espalda media' },
  { valor: 'espalda_baja', texto: 'Espalda baja (lumbar)' },
  { valor: 'cadera', texto: 'Cadera' },
  { valor: 'gluteos', texto: 'Glúteos' },
  { valor: 'piernas', texto: 'Piernas (muslos)' },
  { valor: 'pantorrillas', texto: 'Pantorrillas' },
  { valor: 'pies', texto: 'Pies' },
  { valor: 'brazos', texto: 'Brazos' },
  { valor: 'antebrazos', texto: 'Antebrazos' },
  { valor: 'manos', texto: 'Manos y muñecas' },
  { valor: 'abdomen', texto: 'Abdomen' },
];

const OPCIONES_CONDICIONES = [
  { valor: 'hipertension', texto: 'Hipertensión' },
  { valor: 'diabetes', texto: 'Diabetes' },
  { valor: 'coagulacion', texto: 'Problemas de coagulación o anticoagulantes' },
  { valor: 'embarazo', texto: 'Embarazo' },
  { valor: 'cancer', texto: 'Cáncer o en tratamiento oncológico' },
  { valor: 'circulatorios', texto: 'Problemas circulatorios (varices, trombosis)' },
  { valor: 'osteoporosis', texto: 'Osteoporosis' },
  { valor: 'gripe', texto: 'Gripe, resfriado o fiebre actual' },
  { valor: 'infeccion_piel', texto: 'Infección de piel activa' },
  { valor: 'alergia_piel', texto: 'Alergias de piel activas' },
  { valor: 'ninguna', texto: 'Ninguna de las anteriores' },
];

const PASOS_QUIZ = [
  {
    id: 'edad', tipo: 'numero', pregunta: '¿Cuántos años tienes?', placeholder: 'Edad', obligatorio: true,
  },
  {
    id: 'sexo', tipo: 'radio', pregunta: '¿Cuál es tu sexo?', obligatorio: true,
    opciones: [
      { valor: 'hombre', texto: 'Hombre' },
      { valor: 'mujer', texto: 'Mujer' },
      { valor: 'prefiero_no_decir', texto: 'Prefiero no decirlo' },
    ],
  },
  {
    id: 'estatura_peso', tipo: 'estatura_peso', pregunta: 'Estatura y peso (opcional)', obligatorio: false,
  },
  {
    id: 'ocupacion', tipo: 'radio_otro', pregunta: '¿A qué te dedicas / cómo pasas la mayor parte del día?', obligatorio: true,
    opciones: [
      { valor: 'oficina', texto: 'Sentado en oficina/computadora' },
      { valor: 'de_pie', texto: 'De pie muchas horas' },
      { valor: 'esfuerzo_fisico', texto: 'Cargando peso o esfuerzo físico' },
      { valor: 'conduciendo', texto: 'Conduciendo mucho tiempo' },
      { valor: 'combinacion', texto: 'Combinación de varias' },
      { valor: 'otro', texto: 'Otro' },
    ],
  },
  {
    id: 'zonas_dolor', tipo: 'checkbox', pregunta: '¿Dónde sientes más tensión o dolor hoy?', ayuda: 'Puedes elegir varias.', obligatorio: true,
    opciones: OPCIONES_ZONAS_DOLOR,
  },
  {
    id: 'tiempo_molestia', tipo: 'radio', pregunta: '¿Hace cuánto tienes esta molestia?', obligatorio: true,
    opciones: [
      { valor: 'menos_semana', texto: 'Menos de una semana' },
      { valor: 'unas_semanas', texto: 'Unas semanas' },
      { valor: 'meses', texto: 'Meses' },
      { valor: 'recurrente', texto: 'Es algo recurrente de siempre' },
    ],
  },
  {
    id: 'intensidad', tipo: 'escala', pregunta: 'En una escala de 1 a 10, ¿qué tan fuerte es la molestia que tienes?', obligatorio: true,
  },
  {
    id: 'diagnostico', tipo: 'radio_especificar', pregunta: '¿Alguna vez un profesional de salud te diagnosticó algo relacionado con este dolor?', obligatorio: true,
    opciones: [
      { valor: 'si', texto: 'Sí' },
      { valor: 'no', texto: 'No' },
      { valor: 'no_seguro', texto: 'No estoy seguro' },
    ],
  },
  {
    id: 'condiciones', tipo: 'checkbox_exclusivo', pregunta: '¿Tienes alguna de estas condiciones?', ayuda: 'Puedes elegir varias.', obligatorio: true,
    opciones: OPCIONES_CONDICIONES, valorExclusivo: 'ninguna',
  },
  {
    id: 'condicion_controlada', tipo: 'radio', pregunta: '¿Tu condición está controlada con tratamiento médico?', obligatorio: true,
    opciones: [
      { valor: 'si_controlada', texto: 'Sí, controlada' },
      { valor: 'no_o_no_seguro', texto: 'No, o no estoy seguro' },
    ],
    mostrarSi: (r) => Array.isArray(r.condiciones) && r.condiciones.length > 0 && !r.condiciones.includes('ninguna'),
  },
  {
    id: 'duracion_preferida', tipo: 'radio', pregunta: '¿Prefieres rutinas cortas o sesiones más largas?', obligatorio: true,
    opciones: [
      { valor: 'cortas', texto: 'Rutinas cortas (5 min)' },
      { valor: 'largas', texto: 'Sesiones más largas (15-20 min)' },
    ],
  },
  {
    id: 'frecuencia', tipo: 'radio', pregunta: '¿Con qué frecuencia te gustaría practicar?', obligatorio: true,
    opciones: [
      { valor: 'todos_los_dias', texto: 'Todos los días' },
      { valor: 'dia_por_medio', texto: 'Día por medio' },
      { valor: 'cuando_sienta_molestia', texto: 'Cuando sienta molestia' },
    ],
  },
  {
    id: 'descanso_energia', tipo: 'checkbox_exclusivo', pregunta: '¿Cómo describirías tu descanso y energía últimamente?', ayuda: 'Puedes elegir varias.', obligatorio: true,
    opciones: [
      { valor: 'sueno', texto: 'Duermo mal o me cuesta conciliar el sueño' },
      { valor: 'energia', texto: 'Me siento con poca energía o cansada la mayor parte del día' },
      { valor: 'normal', texto: 'Duermo y me siento con energía normalmente' },
    ],
    valorExclusivo: 'normal',
  },
  {
    id: 'consentimiento', tipo: 'consentimiento',
    pregunta: 'Antes de terminar',
    obligatorio: true,
  },
];

let indicePaso = 0;
let respuestas = {};

function pasosVisibles() {
  return PASOS_QUIZ.filter(p => !p.mostrarSi || p.mostrarSi(respuestas));
}

function pasoActual() {
  return pasosVisibles()[indicePaso];
}

function renderPaso() {
  const paso = pasoActual();
  const contenedor = document.getElementById('contenedor-paso');
  document.getElementById('mensaje-error').style.display = 'none';

  const visibles = pasosVisibles();
  document.getElementById('barra-relleno').style.width = `${Math.round(((indicePaso + 1) / visibles.length) * 100)}%`;

  let html = '';

  if (paso.tipo !== 'consentimiento') {
    html += `<h2>${paso.pregunta}</h2>`;
    if (paso.ayuda) html += `<p class="texto-suave">${paso.ayuda}</p>`;
  }

  if (paso.tipo === 'numero') {
    html += `<div class="campo"><input type="number" id="input-valor" min="0" max="120" placeholder="${paso.placeholder}" value="${respuestas[paso.id] ?? ''}" /></div>`;
  } else if (paso.tipo === 'estatura_peso') {
    html += `
      <div class="campo"><label for="input-estatura">Estatura (cm)</label><input type="number" id="input-estatura" placeholder="Ej: 165" value="${respuestas.estatura ?? ''}" /></div>
      <div class="campo"><label for="input-peso">Peso (kg)</label><input type="number" id="input-peso" placeholder="Ej: 60" value="${respuestas.peso ?? ''}" /></div>
    `;
  } else if (paso.tipo === 'radio' || paso.tipo === 'radio_otro' || paso.tipo === 'radio_especificar') {
    const seleccion = respuestas[paso.id] || '';
    html += '<div class="opciones-lista">';
    for (const op of paso.opciones) {
      const marcada = seleccion === op.valor;
      html += `
        <label class="opcion ${marcada ? 'seleccionada' : ''}">
          <input type="radio" name="respuesta-radio" value="${op.valor}" ${marcada ? 'checked' : ''} />
          ${op.texto}
        </label>`;
    }
    html += '</div>';
    if (paso.tipo === 'radio_otro' && seleccion === 'otro') {
      html += `<div class="campo" style="margin-top:14px;"><input type="text" id="input-otro" placeholder="Cuéntanos brevemente" value="${respuestas.ocupacion_otro ?? ''}" /></div>`;
    }
    if (paso.tipo === 'radio_especificar' && seleccion === 'si') {
      html += `<div class="campo" style="margin-top:14px;"><input type="text" id="input-especificar" placeholder="¿Qué te diagnosticaron?" value="${respuestas.diagnostico_detalle ?? ''}" /></div>`;
    }
  } else if (paso.tipo === 'checkbox' || paso.tipo === 'checkbox_exclusivo') {
    const seleccionadas = respuestas[paso.id] || [];
    html += '<div class="opciones-lista">';
    for (const op of paso.opciones) {
      const marcada = seleccionadas.includes(op.valor);
      html += `
        <label class="opcion ${marcada ? 'seleccionada' : ''}">
          <input type="checkbox" data-valor="${op.valor}" ${marcada ? 'checked' : ''} />
          ${op.texto}
        </label>`;
    }
    html += '</div>';
  } else if (paso.tipo === 'escala') {
    const valor = respuestas[paso.id] || 5;
    html += `
      <div class="campo">
        <input type="range" id="input-escala" min="1" max="10" step="1" value="${valor}" style="width:100%;" />
        <p class="centrado" style="font-size:28px; font-weight:700; font-family:var(--fuente-titulo); margin-top:8px;" id="valor-escala">${valor}</p>
      </div>
      <div id="aviso-dolor-intenso" class="mensaje-aviso" style="${valor >= 8 ? '' : 'display:none;'}">
        Un dolor muy intenso puede necesitar evaluación profesional antes de un automasaje.
      </div>
    `;
  } else if (paso.tipo === 'consentimiento') {
    html += `
      <h2>Antes de terminar</h2>
      <label class="opcion" style="align-items:flex-start;">
        <input type="checkbox" id="input-consentimiento" ${respuestas.consentimiento ? 'checked' : ''} style="margin-top:3px;" />
        <span style="font-size:14px;">Entiendo que Meraki App ofrece técnicas de automasaje y bienestar, y que no reemplaza una consulta médica, fisioterapia ni ningún tratamiento profesional. Acepto usar la app bajo mi propia responsabilidad y sé que debo detenerme y consultar a un profesional si algo no se siente bien.</span>
      </label>
    `;
  }

  contenedor.innerHTML = html;

  const visiblesFinal = pasosVisibles();
  document.getElementById('boton-siguiente').textContent =
    indicePaso === visiblesFinal.length - 1 ? 'Terminar' : 'Siguiente';

  agregarListenersPaso(paso);
}

function agregarListenersPaso(paso) {
  if (paso.tipo === 'radio' || paso.tipo === 'radio_otro' || paso.tipo === 'radio_especificar') {
    document.querySelectorAll('input[name="respuesta-radio"]').forEach(input => {
      input.addEventListener('change', () => {
        respuestas[paso.id] = input.value;
        renderPaso();
      });
    });
  } else if (paso.tipo === 'checkbox' || paso.tipo === 'checkbox_exclusivo') {
    document.querySelectorAll('#contenedor-paso input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', () => {
        let seleccionadas = respuestas[paso.id] || [];
        const valor = input.dataset.valor;
        if (paso.tipo === 'checkbox_exclusivo' && valor === paso.valorExclusivo) {
          seleccionadas = input.checked ? [paso.valorExclusivo] : [];
        } else {
          seleccionadas = seleccionadas.filter(v => v !== paso.valorExclusivo);
          if (input.checked) {
            seleccionadas.push(valor);
          } else {
            seleccionadas = seleccionadas.filter(v => v !== valor);
          }
        }
        respuestas[paso.id] = seleccionadas;
        renderPaso();
      });
    });
  } else if (paso.tipo === 'escala') {
    const rango = document.getElementById('input-escala');
    rango.addEventListener('input', () => {
      document.getElementById('valor-escala').textContent = rango.value;
      document.getElementById('aviso-dolor-intenso').style.display = rango.value >= 8 ? 'block' : 'none';
    });
  }
}

function leerValoresDelPaso(paso) {
  if (paso.tipo === 'numero') {
    respuestas[paso.id] = document.getElementById('input-valor').value;
  } else if (paso.tipo === 'estatura_peso') {
    respuestas.estatura = document.getElementById('input-estatura').value;
    respuestas.peso = document.getElementById('input-peso').value;
  } else if (paso.tipo === 'radio_otro') {
    const otroInput = document.getElementById('input-otro');
    if (otroInput) respuestas.ocupacion_otro = otroInput.value;
  } else if (paso.tipo === 'radio_especificar') {
    const detalleInput = document.getElementById('input-especificar');
    if (detalleInput) respuestas.diagnostico_detalle = detalleInput.value;
  } else if (paso.tipo === 'escala') {
    respuestas[paso.id] = Number(document.getElementById('input-escala').value);
  } else if (paso.tipo === 'consentimiento') {
    respuestas.consentimiento = document.getElementById('input-consentimiento').checked;
  }
}

function pasoValido(paso) {
  if (paso.tipo === 'numero') {
    return !paso.obligatorio || (respuestas[paso.id] !== '' && respuestas[paso.id] !== undefined);
  }
  if (paso.tipo === 'estatura_peso') {
    return true; // opcional
  }
  if (paso.tipo === 'radio' || paso.tipo === 'radio_otro' || paso.tipo === 'radio_especificar') {
    return !paso.obligatorio || !!respuestas[paso.id];
  }
  if (paso.tipo === 'checkbox' || paso.tipo === 'checkbox_exclusivo') {
    return !paso.obligatorio || (respuestas[paso.id] && respuestas[paso.id].length > 0);
  }
  if (paso.tipo === 'escala') {
    return true;
  }
  if (paso.tipo === 'consentimiento') {
    return !!respuestas.consentimiento;
  }
  return true;
}

document.getElementById('boton-siguiente').addEventListener('click', async () => {
  const paso = pasoActual();
  leerValoresDelPaso(paso);

  if (!pasoValido(paso)) {
    const mensajeError = document.getElementById('mensaje-error');
    mensajeError.textContent = paso.tipo === 'consentimiento'
      ? 'Debes aceptar para continuar.'
      : 'Por favor responde esta pregunta para continuar.';
    mensajeError.style.display = 'block';
    return;
  }

  const visibles = pasosVisibles();
  if (indicePaso < visibles.length - 1) {
    indicePaso++;
    renderPaso();
    window.scrollTo(0, 0);
  } else {
    await guardarRespuestasQuiz(usuarioQuiz.id, respuestas);
    await registrarSesionHoy(usuarioQuiz.id);
    window.location.href = 'celebracion.html';
  }
});

document.getElementById('boton-atras').addEventListener('click', () => {
  if (indicePaso > 0) {
    indicePaso--;
    renderPaso();
    window.scrollTo(0, 0);
  } else {
    window.location.href = 'login.html';
  }
});

(async function iniciar() {
  usuarioQuiz = await requiereSesion();
  if (usuarioQuiz) {
    renderPaso();
  }
})();
