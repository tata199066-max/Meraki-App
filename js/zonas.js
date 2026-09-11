/*
  Meraki App — Datos de las 15 zonas de automasaje, cada una con 5 niveles.

  Desde que conectamos Supabase, los PASOS de cada nivel (el contenido
  premium que hay que proteger) ya no viven aquí: se cargan en tiempo real
  desde la base de datos (tabla pasos_zona, protegida con Row Level
  Security) — ver js/niveles.js, función obtenerPasosNivel().

  Lo que queda en este archivo es solo información que no es sensible
  (nombre, por qué se tensiona, dato clínico, y la estructura de los 5
  niveles) y que no cambia según si alguien está suscrita o no.

  Regla de marca (identidad profesional de Mary): la técnica principal SIEMPRE
  es con las manos. Herramientas como la pelota de tenis solo se mencionan
  como opción adicional (ver NOTA_HERRAMIENTA_OPCIONAL en zona.js), nunca como
  parte de los pasos numerados.
*/

const DIAS_NIVEL = [0, 3, 7, 14, 21]; // día en que se desbloquea cada nivel, contado desde que se completa el Nivel 1 de esa zona

const ZONAS = [
  // ===== BLOQUE 1 — Cuello y cabeza =====
  {
    id: 'trapecio', nombre: 'Trapecio', bloque: 'Cuello y cabeza', premium: false, categoriaEmocional: true,
    porQue: 'Pasar horas con la cabeza inclinada hacia adelante (celular, computadora) o con los hombros subidos por estrés satura este músculo, que va desde el cráneo hasta la mitad de la espalda. También es la zona clásica donde "guardamos" el estrés: el insomnio, la ansiedad o una época difícil pueden tensarla tanto como una mala postura.',
    datoClinico: 'Es uno de los músculos que más se contractura en el cuerpo, y su punto de tensión puede generar dolor de cabeza de tipo tensional que sube desde el cuello hacia la sien.',
    evitarSi: 'Hinchazón marcada, calor o enrojecimiento en la zona; dolor que baja disparado hacia el brazo.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Punto básico' },
      { numero: 2, diaOffset: 3, titulo: 'Borde lateral' },
      { numero: 3, diaOffset: 7, titulo: 'Punto medio', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Punto profundo', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa', esRutinaCompleta: true },
    ],
  },
  {
    id: 'suboccipital', nombre: 'Suboccipital / Nuca', bloque: 'Cuello y cabeza', premium: true, categoriaEmocional: true,
    porQue: 'Son músculos pequeños que sostienen la cabeza en posiciones finas. Mirar el celular hacia abajo o el estrés los acorta y tensiona. El estrés sostenido y la falta de sueño también los contraen, incluso sin una causa postural clara — muchas cefaleas tensionales aparecen así.',
    datoClinico: 'Generan un patrón de dolor referido muy característico: empieza en la nuca y sube hacia la frente o las sienes, muy similar a una cefalea tensional.',
    evitarSi: 'Mareo al presionar, dolor que se dispara con la presión, cualquier golpe reciente en la zona.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Borde óseo, primer contacto' },
      { numero: 2, diaOffset: 3, titulo: 'Profundizando en el mismo borde' },
      { numero: 3, diaOffset: 7, titulo: 'Punto lateral', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Punto lateral, más profundo', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (ambos lados)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'temporal', nombre: 'Cuero cabelludo / sien (temporal)', bloque: 'Cuello y cabeza', premium: true, categoriaEmocional: false,
    porQue: 'El músculo temporal, en el costado de la cabeza, ayuda a cerrar la mandíbula. Se sobrecarga por apretar los dientes o por tensión general del estrés.',
    datoClinico: 'Los dolores de cabeza tipo "banda de presión" en el costado de la cabeza suelen originarse en el temporal, no en el cuero cabelludo como tal.',
    evitarSi: 'Heridas o infecciones en el cuero cabelludo, dolor de cabeza súbito y muy intenso (requiere evaluación médica).',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Temporal, primer contacto' },
      { numero: 2, diaOffset: 3, titulo: 'Profundizando en la sien' },
      { numero: 3, diaOffset: 7, titulo: 'Punto posterior', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Sien + mandíbula combinadas', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (sien + mandíbula)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'mandibula', nombre: 'Mandíbula (ATM / masetero)', bloque: 'Cuello y cabeza', premium: true, categoriaEmocional: true,
    porQue: 'El estrés y el bruxismo (apretar o rechinar los dientes) sobrecargan el masetero, el músculo principal para cerrar la mandíbula. El bruxismo casi siempre tiene una raíz emocional: ansiedad, estrés acumulado o una etapa de mucha exigencia personal.',
    datoClinico: 'El automasaje no alcanza los músculos más profundos de la mandíbula, por eso si hay chasquidos, bloqueos o dolor fuerte al abrir la boca, se necesita evaluación profesional.',
    evitarSi: 'Chasquidos o bloqueo al abrir la boca, dolor dental agudo, cirugía dental reciente.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Masetero superficial' },
      { numero: 2, diaOffset: 3, titulo: 'Masetero, más tiempo' },
      { numero: 3, diaOffset: 7, titulo: 'Masetero profundo', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Punto profundo en movimiento', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (superficial + profundo + sien)', esRutinaCompleta: true },
    ],
  },

  // ===== BLOQUE 2 — Espalda =====
  {
    id: 'hombro', nombre: 'Hombro (deltoides)', bloque: 'Espalda', premium: true, categoriaEmocional: false,
    porQue: 'Los deltoides rodean la articulación del hombro y se sobrecargan al cargar peso o mantener los brazos elevados mucho tiempo.',
    datoClinico: 'Trabajar el deltoides de forma longitudinal y lento reduce la hiperactividad muscular y calma las señales de dolor.',
    evitarSi: 'Hombro congelado diagnosticado, luxación reciente, dolor agudo al levantar el brazo.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Fibras externas y medias' },
      { numero: 2, diaOffset: 3, titulo: 'Fibras medias, más tiempo' },
      { numero: 3, diaOffset: 7, titulo: 'Fibras anteriores', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Fibras posteriores', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (3 porciones)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'omoplatos', nombre: 'Omóplatos (romboides / escápula)', bloque: 'Espalda', premium: true, categoriaEmocional: false,
    porQue: 'Es la zona típica de "cargar la mochila del estrés" — se tensiona por mantener los hombros hacia adelante frente a la computadora.',
    datoClinico: 'Trabajar esta zona con las manos ayuda a liberar también estructuras cercanas al manguito rotador, mejorando la movilidad del hombro.',
    evitarSi: 'Nunca presionar directo sobre el borde óseo de la escápula, solo sobre el músculo.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Borde interno' },
      { numero: 2, diaOffset: 3, titulo: 'Borde interno, más presión' },
      { numero: 3, diaOffset: 7, titulo: 'Punto superior', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Elevador de la escápula', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (ambos puntos)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'dorsal', nombre: 'Dorsal / zona alta de la espalda', bloque: 'Espalda', premium: true, categoriaEmocional: false,
    porQue: 'Las horas de mala postura frente a la pantalla cargan esta zona ancha de la espalda, que conecta el hombro con la zona lumbar.',
    datoClinico: 'El automasaje de esta zona alcanza el redondo mayor y el dorsal ancho — trabajar despacio y profundo con los nudillos da mayor beneficio que un pase rápido.',
    evitarSi: 'Dolor agudo tipo "punzada" al respirar hondo (puede ser otra causa, no muscular).',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Primer contacto' },
      { numero: 2, diaOffset: 3, titulo: 'Profundizando' },
      { numero: 3, diaOffset: 7, titulo: 'Borde externo (cerca de la axila)', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Ángulo inferior del omóplato', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (3 puntos)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'lumbar', nombre: 'Lumbar (incluye cuadrado lumbar)', bloque: 'Espalda', premium: false, categoriaEmocional: true,
    porQue: 'Es de las zonas que más carga acumula por estar sentado muchas horas o cargar peso con mala postura. El cuadrado lumbar es el músculo detrás del típico "dolor de riñones". La tensión emocional sostenida (preocupación constante, ansiedad) también se acumula aquí, incluso sin haber cargado peso ni pasado horas sentada.',
    datoClinico: 'El automasaje lumbar se trabaja siempre a los lados de la columna (nunca sobre ella), con movimientos lentos, entre 3 y 6 minutos por lado.',
    evitarSi: 'Dolor que baja como un rayo hacia la pierna (posible compromiso del nervio ciático) — ahí no se automasajea, se consulta primero.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'A los lados de la columna' },
      { numero: 2, diaOffset: 3, titulo: 'Más tiempo por lado' },
      { numero: 3, diaOffset: 7, titulo: 'Punto cerca de la cadera', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Mismo punto, más profundo', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (ambos lados)', esRutinaCompleta: true },
    ],
  },

  // ===== BLOQUE 3 — Cadera y glúteo =====
  {
    id: 'piriforme', nombre: 'Glúteo / Piriforme', bloque: 'Cadera y glúteo', premium: false, categoriaEmocional: false,
    porQue: 'El piriforme es un músculo pequeño y profundo del glúteo. Al contracturarse, puede atrapar el nervio ciático.',
    datoClinico: 'Genera un patrón de dolor referido hacia la pierna muy parecido al de una hernia discal, sin serlo — se le conoce como "falsa ciática".',
    evitarSi: 'Dolor punzante y agudo al presionar (bajar la intensidad de inmediato), hernia discal sin autorización médica.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Piriforme central' },
      { numero: 2, diaOffset: 3, titulo: 'Piriforme central, más tiempo' },
      { numero: 3, diaOffset: 7, titulo: 'Glúteo medio, punto alto', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Glúteo medio, punto medio', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (3 puntos)', esRutinaCompleta: true },
    ],
  },

  // ===== BLOQUE 4 — Piernas y pies =====
  {
    id: 'pantorrillas', nombre: 'Pantorrillas', bloque: 'Piernas y pies', premium: false, categoriaEmocional: false,
    porQue: 'Estar mucho tiempo de pie o sentado hace que la circulación de retorno trabaje peor, y la pantorrilla es el músculo que más ayuda a bombear la sangre de vuelta al corazón.',
    datoClinico: 'Por esta función de bombeo se le conoce como "el segundo corazón" — trabajarla siempre en dirección ascendente ayuda a esa circulación de retorno.',
    evitarSi: 'Hinchazón marcada de un solo lado, calor local o dolor que no calza con cansancio normal — puede ser un tema circulatorio.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Gastrocnemio, ordeñe general' },
      { numero: 2, diaOffset: 3, titulo: 'Ordeñe, más tiempo' },
      { numero: 3, diaOffset: 7, titulo: 'Gastrocnemio interno', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Sóleo (más profundo)', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (3 puntos)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'planta_pie', nombre: 'Planta del pie', bloque: 'Piernas y pies', premium: true, categoriaEmocional: false,
    porQue: 'La fascia plantar sostiene el arco del pie y se sobrecarga por estar de pie muchas horas, calzado plano, o pantorrillas muy tensas.',
    datoClinico: 'Combinar el trabajo de la planta del pie con automasaje en la pantorrilla mejora el resultado, porque están conectadas.',
    evitarSi: 'Dolor agudo al primer paso de la mañana de forma repetida (trabajar con suavidad y consultar si no mejora).',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Talón hacia dedos' },
      { numero: 2, diaOffset: 3, titulo: 'Talón hacia dedos, más tiempo' },
      { numero: 3, diaOffset: 7, titulo: 'Centro del arco', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Combinado con pantorrilla', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (pie + pantorrilla)', esRutinaCompleta: true },
    ],
  },

  // ===== BLOQUE 5 — Brazo, antebrazo y mano =====
  {
    id: 'antebrazo', nombre: 'Antebrazo (extensores y flexores)', bloque: 'Brazo, antebrazo y mano', premium: false, categoriaEmocional: false,
    porQue: 'El uso de mouse y teclado sobrecarga el lado de arriba del antebrazo (extensores); escribir y cargar cosas sobrecarga el lado de abajo (flexores).',
    datoClinico: 'Cuando se inflama la inserción en el codo, del lado extensor es "codo de tenista" y del lado flexor es "codo de golfista" — son distintas y no se tratan igual.',
    evitarSi: 'Hormigueo, adormecimiento o "corrientazo" hacia los dedos (posible nervio comprometido).',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Extensores y flexores, general' },
      { numero: 2, diaOffset: 3, titulo: 'Extensores y flexores, más tiempo' },
      { numero: 3, diaOffset: 7, titulo: 'Codo externo ("codo de tenista")', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Codo interno ("codo de golfista")', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (4 puntos)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'mano_muneca', nombre: 'Mano y muñeca', bloque: 'Brazo, antebrazo y mano', premium: true, categoriaEmocional: false,
    porQue: 'El uso constante del celular y el teclado sobrecarga los músculos pequeños de la palma y los dedos.',
    datoClinico: 'El hormigueo hacia pulgar/índice/medio puede indicar compromiso del nervio mediano en la muñeca — ahí no se automasajea, se consulta.',
    evitarSi: 'Hormigueo o adormecimiento hacia los dedos, hinchazón marcada en la muñeca.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Palma general' },
      { numero: 2, diaOffset: 3, titulo: 'Palma, más tiempo' },
      { numero: 3, diaOffset: 7, titulo: 'Base del pulgar', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Entre los huesos de los dedos', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (mano y muñeca)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'pectorales', nombre: 'Pectorales', bloque: 'Brazo, antebrazo y mano', premium: true, categoriaEmocional: false,
    porQue: 'Mantener los hombros hacia adelante frente a la pantalla tensiona y acorta este músculo.',
    datoClinico: 'Está muy relacionado con el dolor de hombro y la postura general — trabajarlo ayuda también a mejorar dolores cervicales.',
    evitarSi: 'Cualquier dolor en el pecho que no sea claramente muscular (opresión, falta de aire) requiere atención médica inmediata, no automasaje.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Amasamiento general' },
      { numero: 2, diaOffset: 3, titulo: 'Amasamiento, más tiempo' },
      { numero: 3, diaOffset: 7, titulo: 'Porción clavicular (parte alta)', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Pectoral menor (más profundo)', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (3 puntos)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'abdomen', nombre: 'Abdomen', bloque: 'Brazo, antebrazo y mano', premium: true, categoriaEmocional: true,
    porQue: 'El estrés y estar sentado muchas horas afectan también el tránsito intestinal. Las emociones que se "guardan" sin procesar —ansiedad, preocupación, tristeza— afectan directamente la digestión: es una de las zonas donde el cuerpo somatiza de forma más clara.',
    datoClinico: 'El masaje abdominal es una herramienta real usada en fisioterapia para el estreñimiento, siguiendo el sentido del colon (como una "C" invertida), con presión suave.',
    evitarSi: 'Embarazo, dolor abdominal agudo, justo después de comer (esperar 1-2 horas), cualquier diagnóstico digestivo sin autorización médica.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Círculos generales' },
      { numero: 2, diaOffset: 3, titulo: 'Círculos, más tiempo' },
      { numero: 3, diaOffset: 7, titulo: 'Debajo del esternón', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Debajo del ombligo', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (3 puntos)', esRutinaCompleta: true },
    ],
  },
];

const BLOQUES = [
  'Cuello y cabeza',
  'Espalda',
  'Cadera y glúteo',
  'Piernas y pies',
  'Brazo, antebrazo y mano',
];

function obtenerZonaPorId(id) {
  return ZONAS.find(z => z.id === id) || null;
}

/* Mapa simple entre lo que se marca en la pregunta 5 del quiz
   (zonas de dolor) y el id de zona correspondiente, para poder
   recomendar algo relacionado en Inicio. */
const MAPA_DOLOR_A_ZONA = {
  cuello: 'trapecio',
  cabeza: 'temporal',
  mandibula: 'mandibula',
  hombros: 'hombro',
  espalda_alta: 'omoplatos',
  espalda_media: 'dorsal',
  espalda_baja: 'lumbar',
  cadera: 'piriforme',
  gluteos: 'piriforme',
  piernas: 'pantorrillas',
  pantorrillas: 'pantorrillas',
  pies: 'planta_pie',
  brazos: 'antebrazo',
  antebrazos: 'antebrazo',
  manos: 'mano_muneca',
  abdomen: 'abdomen',
};
