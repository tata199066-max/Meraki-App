/*
  Meraki App — Mi progreso: racha, resumen general, niveles completados
  por zona, historial de check-ins ("¿cómo te sentiste?") y notas personales.
*/

let usuarioProgreso = null;
const contenedorProgreso = document.getElementById('contenido-progreso');

function nombreDeItemCheckin(id) {
  const zona = obtenerZonaPorId(id);
  if (zona) return zona.nombre;
  const estiramiento = typeof obtenerEstiramientoPorId === 'function' ? obtenerEstiramientoPorId(id) : null;
  if (estiramiento) return estiramiento.nombre;
  return id;
}

function emojiCheckin(respuesta) {
  if (respuesta === 'mejor') return '🙂';
  if (respuesta === 'igual') return '😐';
  if (respuesta === 'peor') return '😕';
  return '';
}

function formatearFechaCorta(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

async function renderProgreso() {
  const racha = await obtenerRacha(usuarioProgreso.id);
  const nivelesPorZona = await obtenerTodoElProgreso(usuarioProgreso.id);

  let zonasIniciadas = 0;
  let nivelesCompletadosTotal = 0;
  ZONAS.forEach(zona => {
    const completados = Object.keys((nivelesPorZona[zona.id] || {}).completados || {});
    if (completados.length > 0) zonasIniciadas++;
    nivelesCompletadosTotal += completados.length;
  });

  const filasZonas = BLOQUES.map(bloque => {
    const zonasDelBloque = ZONAS.filter(z => z.bloque === bloque);
    const items = zonasDelBloque.map(zona => {
      const completados = Object.keys((nivelesPorZona[zona.id] || {}).completados || {}).length;
      const porcentaje = Math.round((completados / 5) * 100);
      return `
        <a href="zona.html?id=${zona.id}" class="tarjeta" style="display:block; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong>${zona.nombre}</strong>
            <span class="texto-suave">${completados}/5 niveles</span>
          </div>
          <div class="barra-progreso" style="margin-bottom:0;">
            <div class="barra-progreso-relleno" style="width:${porcentaje}%;"></div>
          </div>
        </a>
      `;
    }).join('');
    return `<h2 style="margin-top:22px;">${bloque}</h2>${items}`;
  }).join('');

  const todosLosCheckins = await obtenerCheckIns(usuarioProgreso.id);
  const checkins = todosLosCheckins.slice(-10).reverse();
  const historialHtml = checkins.length > 0
    ? checkins.map(c => `
        <div class="tarjeta" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <strong>${nombreDeItemCheckin(c.zona_id)}</strong>
            <div class="texto-suave">${formatearFechaCorta(c.fecha)}</div>
          </div>
          <div style="font-size:24px;">${emojiCheckin(c.respuesta)}</div>
        </div>
      `).join('')
    : `<p class="texto-suave">Todavía no tienes sesiones registradas. Completa una zona o un estiramiento para ver tu historial aquí.</p>`;

  const notaGuardada = await obtenerNota(usuarioProgreso.id);

  contenedorProgreso.innerHTML = `
    <div class="tarjeta tarjeta-lavanda" style="display:flex; align-items:center; gap:12px;">
      <div style="font-size:28px;">🔥</div>
      <div>
        <div style="font-weight:700; font-family:var(--fuente-titulo); font-size:20px;">${racha.dias_seguidos === 1 ? '1 día seguido' : racha.dias_seguidos + ' días seguidos'}</div>
        <div class="texto-suave">Sigue así, sin presión — lo importante es la constancia.</div>
      </div>
    </div>

    <div class="tarjeta" style="display:flex; gap:20px; justify-content:space-around; text-align:center;">
      <div>
        <div style="font-family:var(--fuente-titulo); font-size:26px; font-weight:600;">${zonasIniciadas}</div>
        <div class="texto-suave">zonas iniciadas</div>
      </div>
      <div>
        <div style="font-family:var(--fuente-titulo); font-size:26px; font-weight:600;">${nivelesCompletadosTotal}</div>
        <div class="texto-suave">niveles completados</div>
      </div>
    </div>

    <h2 style="margin-top:24px;">Historial reciente</h2>
    ${historialHtml}

    <h2 style="margin-top:24px;">Mis notas personales</h2>
    <div class="tarjeta">
      <p class="texto-suave" style="margin-bottom:10px;">Un espacio privado para anotar lo que quieras recordar — solo tú lo ves.</p>
      <textarea id="campo-notas" rows="5" style="width:100%; padding:14px 16px; border-radius:12px; border:1.5px solid #cfc7b8; font-family:var(--fuente-texto); font-size:15px; color:var(--negro);">${notaGuardada}</textarea>
      <div class="texto-suave" id="estado-guardado" style="margin-top:6px; height:16px;"></div>
    </div>

    <h2 style="margin-top:24px;">Progreso por zona</h2>
    ${filasZonas}
  `;

  const campoNotas = document.getElementById('campo-notas');
  const estadoGuardado = document.getElementById('estado-guardado');
  let temporizadorGuardado = null;
  campoNotas.addEventListener('input', () => {
    clearTimeout(temporizadorGuardado);
    temporizadorGuardado = setTimeout(async () => {
      await guardarNota(usuarioProgreso.id, campoNotas.value);
      estadoGuardado.textContent = 'Guardado ✓';
      setTimeout(() => { estadoGuardado.textContent = ''; }, 1500);
    }, 500);
  });
}

(async function iniciar() {
  usuarioProgreso = await requiereSesion();
  if (usuarioProgreso) await renderProgreso();
})();
