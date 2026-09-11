/*
  Meraki App — Capa de datos real (Supabase).

  Estas funciones hablan con la base de datos real en vez de guardar todo
  en el navegador. Por eso ahora son "async": hay que usar await al
  llamarlas. La seguridad del contenido premium vive en las políticas de
  Row Level Security de la base de datos (ver /supabase/01_esquema_y_seguridad.sql),
  no en este archivo.

  Algunas cosas pequeñas que no son sensibles (por ejemplo "¿ya le mostré
  esta calificación a esta persona?") siguen guardándose en el navegador
  con leerJSON/guardarJSON, solo por simplicidad.
*/

function leerJSON(clave, porDefecto) {
  try {
    const valor = localStorage.getItem(clave);
    return valor ? JSON.parse(valor) : porDefecto;
  } catch (e) {
    return porDefecto;
  }
}

function guardarJSON(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ---------- Usuarios / sesión (Supabase Auth) ---------- */

async function obtenerPerfilUsuario(id) {
  const { data, error } = await supabase.from('usuarios').select('*').eq('id', id).single();
  if (error || !data) return null;
  return {
    id: data.id,
    nombre: data.nombre,
    email: data.email,
    edad: data.edad,
    sexo: data.sexo,
    estatura: data.estatura,
    peso: data.peso,
    ocupacion: data.ocupacion,
    rol: data.rol,
    estado_suscripcion: data.estado_suscripcion,
    fecha_registro: data.fecha_registro,
  };
}

async function registrarUsuario({ nombre, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre: nombre || '' } },
  });

  if (error) {
    if (error.message && error.message.toLowerCase().includes('already registered')) {
      return { error: 'Ya existe una cuenta con ese correo.' };
    }
    return { error: error.message };
  }

  if (!data.session) {
    return { error: 'Revisa la configuración de confirmación de correo en Supabase (debe estar desactivada para esta app de prueba).' };
  }

  // Pequeña espera para que el disparador de la base de datos cree el perfil.
  let usuario = await obtenerPerfilUsuario(data.user.id);
  let intentos = 0;
  while (!usuario && intentos < 5) {
    await new Promise(r => setTimeout(r, 300));
    usuario = await obtenerPerfilUsuario(data.user.id);
    intentos++;
  }

  return usuario ? { usuario } : { error: 'No se pudo crear el perfil. Intenta de nuevo.' };
}

async function iniciarSesion({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: 'Correo o contraseña incorrectos.' };
  }
  const usuario = await obtenerPerfilUsuario(data.user.id);
  if (!usuario) {
    return { error: 'No se encontró el perfil de este usuario.' };
  }
  return { usuario };
}

async function cerrarSesion() {
  await supabase.auth.signOut();
}

async function obtenerUsuarioActual() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  return obtenerPerfilUsuario(data.session.user.id);
}

async function requiereSesion() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) {
    window.location.href = 'login.html';
    return null;
  }
  return usuario;
}

async function actualizarEstadoSuscripcion(usuarioId, nuevoEstado) {
  await supabase.from('usuarios').update({ estado_suscripcion: nuevoEstado }).eq('id', usuarioId);
}

async function obtenerUsuarios() {
  const { data, error } = await supabase.from('usuarios').select('*');
  if (error || !data) return [];
  return data;
}

/* ---------- Quiz ---------- */

async function guardarRespuestasQuiz(usuarioId, respuestas) {
  await supabase.from('respuestas_quiz').upsert({ usuario_id: usuarioId, respuestas });
}

async function obtenerRespuestasQuiz(usuarioId) {
  const { data, error } = await supabase.from('respuestas_quiz').select('respuestas').eq('usuario_id', usuarioId).maybeSingle();
  if (error || !data) return null;
  return data.respuestas;
}

/* ---------- Racha ---------- */

async function obtenerRacha(usuarioId) {
  const { data, error } = await supabase.from('racha').select('*').eq('usuario_id', usuarioId).maybeSingle();
  if (error || !data) return { dias_seguidos: 0, ultima_sesion: null };
  return data;
}

async function registrarSesionHoy(usuarioId) {
  const racha = await obtenerRacha(usuarioId);
  const hoy = hoyISO();
  if (racha.ultima_sesion === hoy) {
    return racha; // ya contó hoy
  }
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const ayerStr = ayer.toISOString().slice(0, 10);

  const nuevaRacha = {
    usuario_id: usuarioId,
    dias_seguidos: racha.ultima_sesion === ayerStr ? racha.dias_seguidos + 1 : 1,
    ultima_sesion: hoy,
  };
  await supabase.from('racha').upsert(nuevaRacha);
  return nuevaRacha;
}

/* ---------- Check-ins (¿cómo te sentiste?) ---------- */

async function guardarCheckIn(usuarioId, zonaId, numeroNivel, respuesta, respuestaExtra) {
  await supabase.from('checkins').insert({
    usuario_id: usuarioId,
    zona_id: zonaId,
    nivel: numeroNivel,
    respuesta: respuesta,
    respuesta_extra: respuestaExtra || null,
  });
}

async function obtenerCheckIns(usuarioId) {
  const { data, error } = await supabase.from('checkins').select('*').eq('usuario_id', usuarioId).order('fecha', { ascending: true });
  if (error || !data) return [];
  return data;
}

/* ---------- Notas personales ---------- */

async function obtenerNota(usuarioId) {
  const { data, error } = await supabase.from('notas_personales').select('texto').eq('usuario_id', usuarioId).maybeSingle();
  if (error || !data) return '';
  return data.texto || '';
}

async function guardarNota(usuarioId, texto) {
  await supabase.from('notas_personales').upsert({ usuario_id: usuarioId, texto });
}

/* ---------- Calificaciones ---------- */

async function guardarCalificacion(usuarioId, estrellas, comentario, autorizaCompartir) {
  await supabase.from('calificaciones').insert({
    usuario_id: usuarioId,
    estrellas,
    comentario: comentario || '',
    autoriza_compartir: !!autorizaCompartir,
  });
}
