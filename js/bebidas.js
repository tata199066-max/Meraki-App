/*
  Meraki App — Bebidas / infusiones de autocuidado.

  Estas NO reemplazan tratamiento médico — siempre se muestran con la nota
  "si tienes dudas, consulta a tu médico". Se eligen según la categoría de
  necesidad y se filtran contra las condiciones de salud marcadas en el quiz.
  Nunca se repite la misma bebida dos días seguidos si hay más de una opción.

  Qué bebida se mostró hoy se recuerda en este navegador (no es información
  sensible), pero las respuestas del quiz que se usan para elegirla vienen
  de la base de datos real.
*/

const BEBIDAS = {
  hidratacion: [
    { id: 'limon', nombre: 'Agua con limón', detalle: 'Exprime medio limón en un vaso de agua. El músculo también se deshidrata, y mantenerte hidratada ayuda a que la técnica de hoy rinda más.', evitarSiCondiciones: [] },
    { id: 'pepino_menta', nombre: 'Agua con pepino y menta', detalle: 'Rodajas de pepino y unas hojas de menta en agua fría, reposar 15 minutos. Refrescante y ligera.', evitarSiCondiciones: [] },
    { id: 'coco', nombre: 'Agua de coco natural', detalle: 'Rica en electrolitos naturales, ideal después de mucho tiempo de pie.', evitarSiCondiciones: [] },
  ],
  relajacion: [
    { id: 'toronjil', nombre: 'Infusión de toronjil (melisa)', detalle: 'Una cucharadita de hojas secas en agua caliente, reposar 5 minutos. Tradicionalmente usada para bajar la ansiedad y relajar.', evitarSiCondiciones: ['embarazo'] },
    { id: 'tila', nombre: 'Infusión de tila', detalle: 'Reposar una cucharadita en agua caliente 5-10 minutos. Suave, apta para uso frecuente.', evitarSiCondiciones: [] },
    { id: 'manzanilla', nombre: 'Manzanilla', detalle: 'Una bolsita o una cucharadita de flor seca, 5 minutos en agua caliente.', evitarSiCondiciones: ['coagulacion', 'embarazo'] },
  ],
  sueno: [
    { id: 'tila_noche', nombre: 'Infusión de tila', detalle: 'Igual que la de tila, tomar 30-45 minutos antes de dormir.', evitarSiCondiciones: [] },
    { id: 'manzanilla_noche', nombre: 'Manzanilla', detalle: 'Igual que la de manzanilla, tomar antes de dormir.', evitarSiCondiciones: ['coagulacion', 'embarazo'] },
    { id: 'valeriana', nombre: 'Valeriana', detalle: 'Raíz en agua caliente, 10-15 minutos, tomar 30 min a 2 horas antes de dormir. Se recomienda solo para noches puntuales de más nerviosismo, no todos los días.', evitarSiCondiciones: ['embarazo'] },
  ],
  energia: [
    { id: 'menta', nombre: 'Infusión de menta', detalle: 'Hojas frescas o secas en agua caliente, 5 minutos. Refrescante, sin cafeína.', evitarSiCondiciones: [] },
    { id: 'jengibre', nombre: 'Agua con jengibre suave', detalle: 'Una rodaja pequeña de jengibre fresco en agua caliente, 5 minutos, cantidad moderada.', evitarSiCondiciones: ['hipertension', 'coagulacion', 'diabetes', 'embarazo'] },
    { id: 'hibisco', nombre: 'Infusión de hibisco (flor de Jamaica)', detalle: 'Cálices secos en agua caliente, 5-10 minutos, se puede tomar fría con hielo.', evitarSiCondiciones: ['hipertension', 'embarazo'] },
  ],
};

const ZONAS_HIDRATACION = ['pantorrillas', 'planta_pie'];

async function señalesDescansoEnergia(usuarioId) {
  const respuestas = await obtenerRespuestasQuiz(usuarioId);
  if (!respuestas || !Array.isArray(respuestas.descanso_energia)) return [];
  return respuestas.descanso_energia.filter(v => v !== 'normal');
}

/*
  Prioridad para elegir qué categoría de bebida mostrar:
  1. Hidratación, si la zona trabajada es de piernas/pies.
  2. Relajación, si la zona tiene conexión emocional (ver zonas.js).
  3. Sueño o Energía, según lo que la persona marcó en el quiz.
  4. Relajación general, como opción por defecto.
*/
async function categoriaParaZona(usuarioId, zona) {
  if (ZONAS_HIDRATACION.includes(zona.id)) return 'hidratacion';
  if (zona.categoriaEmocional) return 'relajacion';

  const señales = await señalesDescansoEnergia(usuarioId);
  if (señales.includes('sueno')) return 'sueno';
  if (señales.includes('energia')) return 'energia';

  return 'relajacion';
}

async function condicionesDelUsuario(usuarioId) {
  const respuestas = await obtenerRespuestasQuiz(usuarioId);
  if (!respuestas || !Array.isArray(respuestas.condiciones)) return [];
  return respuestas.condiciones.filter(c => c !== 'ninguna');
}

function bebidasDisponibles(categoria, condiciones) {
  const lista = BEBIDAS[categoria] || [];
  return lista.filter(b => !b.evitarSiCondiciones.some(c => condiciones.includes(c)));
}

async function elegirBebida(usuarioId, categoria) {
  const condiciones = await condicionesDelUsuario(usuarioId);
  const disponibles = bebidasDisponibles(categoria, condiciones);

  if (disponibles.length === 0) {
    return { id: 'agua_natural', nombre: 'Agua natural', detalle: 'Lo más seguro para ti hoy: agua natural, varias veces al día.', esFallback: true };
  }

  const claveUltima = 'meraki_ultima_bebida_' + usuarioId + '_' + categoria;
  const ultima = leerJSON(claveUltima, null);

  // Si ya se mostró una bebida hoy, se mantiene la misma (no cambia a mitad del día).
  if (ultima && ultima.fecha === hoyISO()) {
    const mismaSigueDisponible = disponibles.find(b => b.id === ultima.id);
    if (mismaSigueDisponible) return mismaSigueDisponible;
  }

  let opciones = disponibles;
  if (disponibles.length > 1 && ultima && ultima.fecha === hoyISOMenosUnDia()) {
    opciones = disponibles.filter(b => b.id !== ultima.id);
  }

  const elegida = opciones[Math.floor(Math.random() * opciones.length)];
  guardarJSON(claveUltima, { id: elegida.id, fecha: hoyISO() });
  return elegida;
}

function hoyISOMenosUnDia() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
