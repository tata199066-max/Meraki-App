/*
  Meraki App — Estiramientos rápidos.
  El primero es gratis, el resto premium (misma lógica de acceso que las zonas).

  Los pasos de cada estiramiento ya no viven aquí: se cargan desde Supabase
  (tabla pasos_estiramiento, protegida con Row Level Security) — ver
  js/estiramiento.js.
*/

const ESTIRAMIENTOS = [
  {
    id: 'cuello_hombros_est',
    nombre: 'Cuello y hombros',
    premium: false,
    grupo: 'general',
    imagen: 'images/est-cuello-hombros.png',
    contraindicacion: 'Evita si sientes mareo o vértigo al mover el cuello, o dolor que se dispara hacia el brazo.',
  },
  {
    id: 'espalda_alta_est',
    nombre: 'Espalda alta — torsión suave',
    premium: true,
    grupo: 'general',
    imagen: 'images/est-espalda-alta.png',
    contraindicacion: 'Evita si tienes una lesión reciente en la columna o dolor agudo al girar el torso.',
  },
  {
    id: 'isquiotibiales_est',
    nombre: 'Parte de atrás del muslo',
    premium: true,
    grupo: 'piernas',
    imagen: 'images/est-isquiotibiales.png',
    contraindicacion: 'Evita si tienes una lesión muscular reciente en esa zona o dolor agudo tipo punzada.',
  },
  {
    id: 'cadera_est',
    nombre: 'Cadera — figura 4 sentado',
    premium: true,
    grupo: 'general',
    imagen: 'images/est-cadera.png',
    contraindicacion: 'Evita si tienes una cirugía reciente de cadera o dolor agudo al cruzar la pierna.',
  },
  {
    id: 'pecho_est',
    nombre: 'Pecho — marco de puerta',
    premium: true,
    grupo: 'general',
    imagen: 'images/est-pecho.png',
    contraindicacion: 'Evita si tienes una lesión reciente de hombro.',
  },
  {
    id: 'pantorrilla_est',
    nombre: 'Pantorrilla contra la pared',
    premium: true,
    grupo: 'piernas',
    imagen: 'images/est-pantorrilla.png',
    contraindicacion: 'Evita si tienes hinchazón marcada o dolor que no calza con cansancio normal en la pantorrilla.',
  },
];

function obtenerEstiramientoPorId(id) {
  return ESTIRAMIENTOS.find(e => e.id === id) || null;
}

async function obtenerPasosEstiramiento(estiramientoId) {
  const { data, error } = await supabase
    .from('pasos_estiramiento')
    .select('titulo, detalle, segundos')
    .eq('estiramiento_id', estiramientoId)
    .order('orden', { ascending: true });
  if (error || !data) return [];
  return data;
}
