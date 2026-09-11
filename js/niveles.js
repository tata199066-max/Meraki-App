/*
  Meraki App — Sistema de niveles con candado por zona, guardado en Supabase
  (tabla progreso_niveles), y lectura de los pasos reales de cada nivel desde
  la base de datos (tabla pasos_zona, protegida con Row Level Security).

  Regla: el Nivel 1 de cada zona siempre está disponible. Al completarlo,
  se guarda esa fecha, y los siguientes niveles se desbloquean cuando pasan
  los días indicados en DIAS_NIVEL (0, 3, 7, 14, 21) contados desde esa fecha.

  Una cuenta "admin" ve todos los niveles desbloqueados de inmediato, para
  que Mary pueda revisar todo el contenido.
*/

/*
  Los 75 niveles (15 zonas x 5 niveles) se guardaron en Supabase con ids
  explícitos del 1 al 75, en el mismo orden que aparecen en ZONAS (ver
  js/zonas.js). Por eso el id de un nivel se puede calcular así, sin
  necesidad de otra consulta a la base de datos.
*/
function obtenerNivelId(zonaId, numero) {
  const indice = ZONAS.findIndex(z => z.id === zonaId);
  if (indice === -1) return null;
  return indice * 5 + numero;
}

async function obtenerPasosNivel(zonaId, numero) {
  const nivelId = obtenerNivelId(zonaId, numero);
  if (!nivelId) return [];
  const { data, error } = await supabase
    .from('pasos_zona')
    .select('titulo, detalle, segundos')
    .eq('nivel_id', nivelId)
    .order('orden', { ascending: true });
  if (error || !data) return [];
  return data;
}

async function obtenerEstadoZonaCompleto(usuarioId, zonaId) {
  const { data, error } = await supabase
    .from('progreso_niveles')
    .select('fecha_nivel1, completados')
    .eq('usuario_id', usuarioId)
    .eq('zona_id', zonaId)
    .maybeSingle();
  if (error || !data) return { fechaNivel1: null, completados: {} };
  return { fechaNivel1: data.fecha_nivel1, completados: data.completados || {} };
}

async function guardarEstadoZona(usuarioId, zonaId, estado) {
  await supabase.from('progreso_niveles').upsert({
    usuario_id: usuarioId,
    zona_id: zonaId,
    fecha_nivel1: estado.fechaNivel1,
    completados: estado.completados,
  });
}

function diasEntre(fechaA, fechaB) {
  const msPorDia = 1000 * 60 * 60 * 24;
  const a = new Date(fechaA + 'T00:00:00');
  const b = new Date(fechaB + 'T00:00:00');
  return Math.floor((b - a) / msPorDia);
}

/*
  Devuelve, para cada nivel de la zona, si está disponible, completado,
  y cuántos días faltan para desbloquearse.
*/
async function obtenerEstadoNiveles(usuario, zona) {
  const estado = await obtenerEstadoZonaCompleto(usuario.id, zona.id);
  const esAdmin = usuario.rol === 'admin';
  const hoy = hoyISO();

  return zona.niveles.map((nivel, indice) => {
    const completado = !!estado.completados[nivel.numero];
    let disponible;
    let diasFaltantes = 0;

    if (esAdmin || nivel.numero === 1) {
      disponible = true;
    } else if (!estado.fechaNivel1) {
      disponible = false;
      diasFaltantes = DIAS_NIVEL[indice];
    } else {
      const diasPasados = diasEntre(estado.fechaNivel1, hoy);
      const faltan = DIAS_NIVEL[indice] - diasPasados;
      disponible = faltan <= 0;
      diasFaltantes = Math.max(faltan, 0);
    }

    return { nivel, indice, completado, disponible, diasFaltantes };
  });
}

async function marcarNivelCompletado(usuarioId, zonaId, numeroNivel) {
  const estado = await obtenerEstadoZonaCompleto(usuarioId, zonaId);
  if (numeroNivel === 1 && !estado.fechaNivel1) {
    estado.fechaNivel1 = hoyISO();
  }
  estado.completados[numeroNivel] = hoyISO();
  await guardarEstadoZona(usuarioId, zonaId, estado);
}

/* ---------- Progreso general (para rutinas combinadas e hitos) ---------- */

async function obtenerTodoElProgreso(usuarioId) {
  const { data, error } = await supabase
    .from('progreso_niveles')
    .select('zona_id, completados')
    .eq('usuario_id', usuarioId);
  if (error || !data) return {};
  const todo = {};
  data.forEach(fila => { todo[fila.zona_id] = { completados: fila.completados || {} }; });
  return todo;
}

async function contarZonasConNivel(usuarioId, numeroMinimo) {
  const todo = await obtenerTodoElProgreso(usuarioId);
  return Object.keys(todo).filter(zonaId => {
    const completados = Object.keys(todo[zonaId].completados || {}).map(Number);
    return completados.some(n => n >= numeroMinimo);
  }).length;
}
