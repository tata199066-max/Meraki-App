/*
  Meraki App — Datos de las 15 zonas de automasaje, cada una con 5 niveles.

  Desde que conectamos Supabase, los PASOS de cada nivel (el contenido
  premium que hay que proteger) ya no viven aquí: se cargan en tiempo real
  desde la base de datos (tabla pasos_zona, protegida con Row Level
  Security) — ver js/niveles.js, función obtenerPasosNivel().

  Lo que queda en este archivo es solo información que no es sensible
  (nombre, por qué se tensiona, lo que conviene saber, y la estructura de los 5
  niveles) y que no cambia según si alguien está suscrita o no.

  Los textos están escritos en palabras sencillas, sin tecnicismos: la
  persona que usa la app no tiene por qué saber anatomía.

  Regla de marca (identidad profesional de Mary): la técnica principal SIEMPRE
  es con las manos.
*/

const DIAS_NIVEL = [0, 3, 7, 14, 21]; // día en que se desbloquea cada nivel, contado desde que se completa el Nivel 1 de esa zona

const ZONAS = [
  // ===== BLOQUE 1 — Cuello y cabeza =====
  {
    id: 'trapecio', nombre: 'Trapecio (cuello y hombros)', bloque: 'Cuello y cabeza', premium: false, categoriaEmocional: true,
    porQue: 'Pasar horas con la cabeza inclinada hacia adelante (celular, computadora) o con los hombros subidos por estrés cansa este músculo, que va desde la base de la cabeza hasta la mitad de la espalda. También es la zona donde "guardamos" el estrés: el insomnio, la ansiedad o una época difícil pueden tensarla tanto como una mala postura.',
    datoClinico: 'Es uno de los músculos que más se pone duro en el cuerpo. Cuando está muy tenso, es común sentir una molestia que sube desde el cuello hacia la sien, como un dolor de cabeza de tensión.',
    evitarSi: 'Hinchazón marcada, calor o enrojecimiento en la zona; dolor que baja disparado hacia el brazo.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Punto del hombro' },
      { numero: 2, diaOffset: 3, titulo: 'Borde del cuello' },
      { numero: 3, diaOffset: 7, titulo: 'Mitad de la espalda', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Punto más profundo', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa', esRutinaCompleta: true },
    ],
  },
  {
    id: 'suboccipital', nombre: 'Nuca (base del cráneo)', bloque: 'Cuello y cabeza', premium: true, categoriaEmocional: true,
    porQue: 'Son músculos pequeños, justo donde la cabeza se une al cuello, que sostienen la cabeza en posiciones finas. Mirar el celular hacia abajo o el estrés los acorta y los pone duros. El estrés sostenido y la falta de sueño también los tensan, incluso sin una mala postura clara.',
    datoClinico: 'Cuando se tensan, es común sentir una molestia que empieza en la nuca y sube hacia la frente o las sienes, parecida al dolor de cabeza de tensión.',
    evitarSi: 'Mareo al presionar, dolor que se dispara con la presión, cualquier golpe reciente en la zona.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Borde del cráneo, primer contacto' },
      { numero: 2, diaOffset: 3, titulo: 'Mismo borde, con círculos' },
      { numero: 3, diaOffset: 7, titulo: 'Punto del lado', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Punto del lado, con movimiento', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (ambos lados)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'temporal', nombre: 'Sien y cuero cabelludo', bloque: 'Cuello y cabeza', premium: true, categoriaEmocional: false,
    porQue: 'El músculo del costado de la cabeza, justo encima de la oreja, ayuda a cerrar la mandíbula al masticar. Se cansa por apretar los dientes o por la tensión general del estrés.',
    datoClinico: 'Muchos dolores de cabeza "como una banda apretada" en el costado de la cabeza vienen de este músculo, y no del cuero cabelludo.',
    evitarSi: 'Heridas o infecciones en el cuero cabelludo, dolor de cabeza súbito y muy intenso (requiere evaluación médica).',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Sien, primer contacto' },
      { numero: 2, diaOffset: 3, titulo: 'Sien, presión punto por punto' },
      { numero: 3, diaOffset: 7, titulo: 'Punto de atrás de la sien', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Sien y mandíbula juntas', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (sien y mandíbula)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'mandibula', nombre: 'Mandíbula', bloque: 'Cuello y cabeza', premium: false, categoriaEmocional: true,
    porQue: 'El estrés y apretar o rechinar los dientes cansan el músculo de la mejilla que usas para cerrar la boca. Apretar los dientes casi siempre tiene una raíz emocional: ansiedad, estrés acumulado o una etapa de mucha exigencia.',
    datoClinico: 'El automasaje no llega a los músculos más profundos de la mandíbula. Por eso, si te suena o se te traba al abrir la boca, o duele fuerte, conviene que te revise un profesional.',
    evitarSi: 'Chasquidos o bloqueo al abrir la boca, dolor dental agudo, cirugía dental reciente.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Mejilla (parte de arriba)' },
      { numero: 2, diaOffset: 3, titulo: 'Mejilla, presionando y soltando' },
      { numero: 3, diaOffset: 7, titulo: 'Esquina de la mandíbula', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Esquina de la mandíbula, con movimiento', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (mejilla, mandíbula y sien)', esRutinaCompleta: true },
    ],
  },

  // ===== BLOQUE 2 — Espalda =====
  {
    id: 'hombro', nombre: 'Hombro', bloque: 'Espalda', premium: true, categoriaEmocional: false,
    porQue: 'El músculo redondo que cubre el hombro se cansa al cargar peso o al mantener los brazos arriba mucho tiempo.',
    datoClinico: 'Trabajarlo despacio y siguiendo la línea del músculo ayuda a que se relaje y a que el hombro se sienta más suelto.',
    evitarSi: 'Hombro congelado diagnosticado, luxación reciente, dolor agudo al levantar el brazo.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Parte de afuera del hombro' },
      { numero: 2, diaOffset: 3, titulo: 'Parte de afuera, amasando' },
      { numero: 3, diaOffset: 7, titulo: 'Parte de adelante', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Parte de atrás', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (3 partes)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'omoplatos', nombre: 'Espalda alta (entre los omóplatos)', bloque: 'Espalda', premium: true, categoriaEmocional: false, alcanceDificil: true,
    porQue: 'Es la zona típica de "cargar la mochila del estrés": se pone dura por mantener los hombros hacia adelante frente a la computadora.',
    datoClinico: 'Trabajar esta zona con las manos ayuda a que el hombro se mueva con más libertad.',
    evitarSi: 'Nunca presionar directo sobre el hueso del omóplato, solo sobre el músculo.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Borde del omóplato' },
      { numero: 2, diaOffset: 3, titulo: 'Borde del omóplato, con vaivén' },
      { numero: 3, diaOffset: 7, titulo: 'Punto de arriba', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Músculo hacia el cuello', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (ambos puntos)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'dorsal', nombre: 'Espalda alta y costados', bloque: 'Espalda', premium: true, categoriaEmocional: false, alcanceDificil: true,
    porQue: 'Las horas de mala postura frente a la pantalla cansan esta zona ancha de la espalda, que une el hombro con la espalda baja.',
    datoClinico: 'Se alcanza con la mano por encima del hombro. Trabajarla despacio y con los nudillos sirve más que pasar la mano rápido.',
    evitarSi: 'Dolor agudo tipo "punzada" al respirar hondo (puede tener otra causa, no muscular).',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Primer contacto' },
      { numero: 2, diaOffset: 3, titulo: 'Primer contacto, con amasamiento' },
      { numero: 3, diaOffset: 7, titulo: 'Borde de afuera (cerca de la axila)', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Punta de abajo del omóplato', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (3 puntos)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'lumbar', nombre: 'Espalda baja (lumbar)', bloque: 'Espalda', premium: false, categoriaEmocional: true, alcanceDificil: true,
    porQue: 'Es de las zonas que más carga acumula por estar sentado muchas horas o cargar peso con mala postura. La tensión emocional sostenida (preocupación constante, ansiedad) también se acumula aquí, incluso sin haber cargado peso ni pasado horas sentada.',
    datoClinico: 'El automasaje de la espalda baja se hace siempre a los lados de la columna (nunca sobre ella), con movimientos lentos.',
    evitarSi: 'Dolor que baja como un rayo hacia la pierna (puede ser un nervio): ahí no se automasajea, primero se consulta.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'A los lados de la columna' },
      { numero: 2, diaOffset: 3, titulo: 'A los lados de la columna, presionando y soltando' },
      { numero: 3, diaOffset: 7, titulo: 'Punto cerca de la cadera', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Punto cerca de la cadera, con movimiento', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (ambos lados)', esRutinaCompleta: true },
    ],
  },

  // ===== BLOQUE 3 — Cadera y glúteo =====
  {
    id: 'piriforme', nombre: 'Piriforme (falsa ciática)', bloque: 'Cadera y glúteo', premium: true, categoriaEmocional: false, alcanceDificil: true,
    porQue: 'El piriforme es un músculo pequeño y profundo del glúteo, justo al lado de un nervio grande que baja por la pierna. Pasar muchas horas sentada, cruzar la pierna seguido o el estrés acumulado en la cadera lo ponen duro, y eso puede dar una molestia que baja por el glúteo y la pierna.',
    datoClinico: 'Esa molestia en el glúteo y la pierna se parece a la de la ciática, y mucha gente la confunde. Por eso se le conoce como "falsa ciática". Si el dolor es muy fuerte o no mejora, consulta a un profesional.',
    evitarSi: 'Dolor punzante y agudo al presionar (bajar la intensidad de inmediato), hernia discal sin autorización médica.',
    notaFotos: 'Esta técnica se hace con una pelota de tenis: con la mano sola no se alcanza el músculo. Cada paso trae su foto. Si te duele demasiado con la pierna cruzada, bájala y siéntate igual sobre la pelota.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Soltar: poco peso y luego quieta' },
      { numero: 2, diaOffset: 3, titulo: 'Profundizar: todo el peso, presiona y suelta' },
      { numero: 3, diaOffset: 7, titulo: 'Punto de arriba, hacia la espalda baja', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Punto de abajo, abriendo las rodillas', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (3 puntos y recorrido)', esRutinaCompleta: true },
    ],
  },

  // ===== BLOQUE 4 — Piernas y pies =====
  {
    id: 'pantorrillas', nombre: 'Pantorrillas', bloque: 'Piernas y pies', premium: false, categoriaEmocional: false,
    porQue: 'Estar mucho tiempo de pie o sentado hace que la circulación de las piernas trabaje peor, y la pantorrilla es el músculo que más ayuda a que la sangre suba de vuelta al corazón.',
    datoClinico: 'Por eso se le llama "el segundo corazón". Masajearla siempre de abajo hacia arriba ayuda a esa circulación.',
    evitarSi: 'Hinchazón marcada de un solo lado, calor local o dolor que no parece cansancio normal: puede ser un tema circulatorio.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Deslizar de abajo hacia arriba' },
      { numero: 2, diaOffset: 3, titulo: 'Amasando la pantorrilla' },
      { numero: 3, diaOffset: 7, titulo: 'Lado de adentro', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Parte de abajo (más profunda)', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (3 puntos)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'planta_pie', nombre: 'Planta del pie', bloque: 'Piernas y pies', premium: true, categoriaEmocional: false,
    porQue: 'La banda gruesa que sostiene el arco de la planta del pie se cansa por estar de pie muchas horas, usar calzado plano o tener las pantorrillas muy duras.',
    datoClinico: 'Trabajar la planta del pie junto con la pantorrilla da mejor resultado, porque están conectadas.',
    evitarSi: 'Dolor agudo al dar el primer paso de la mañana, de forma repetida (trabajar con suavidad y consultar si no mejora).',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Del talón a los dedos' },
      { numero: 2, diaOffset: 3, titulo: 'Del talón a los dedos, con círculos' },
      { numero: 3, diaOffset: 7, titulo: 'Centro del arco', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Junto con la pantorrilla', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (pie y pantorrilla)', esRutinaCompleta: true },
    ],
  },

  // ===== BLOQUE 5 — Brazo, antebrazo y mano =====
  {
    id: 'antebrazo', nombre: 'Antebrazo', bloque: 'Brazo, antebrazo y mano', premium: false, categoriaEmocional: false,
    porQue: 'Usar mouse y teclado cansa la parte de arriba del antebrazo, y escribir o cargar cosas cansa la parte de abajo.',
    datoClinico: 'Cuando duele el codo, puede venir del lado de afuera ("codo de tenista") o del lado de adentro ("codo de golfista"). Son distintos y no se trabajan igual.',
    evitarSi: 'Hormigueo, adormecimiento o "corrientazo" hacia los dedos (puede ser un nervio).',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Parte de arriba y de abajo, general' },
      { numero: 2, diaOffset: 3, titulo: 'Parte de arriba y de abajo, con vaivén' },
      { numero: 3, diaOffset: 7, titulo: 'Codo, lado de afuera', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Codo, lado de adentro', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (4 puntos)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'mano_muneca', nombre: 'Mano y muñeca', bloque: 'Brazo, antebrazo y mano', premium: true, categoriaEmocional: false,
    porQue: 'Usar mucho el celular y el teclado cansa los músculos pequeños de la palma y los dedos.',
    datoClinico: 'Si sientes hormigueo hacia el pulgar, el índice o el dedo del medio, puede ser un nervio de la muñeca: ahí no se automasajea, se consulta.',
    evitarSi: 'Hormigueo o adormecimiento hacia los dedos, hinchazón marcada en la muñeca.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Palma de la mano' },
      { numero: 2, diaOffset: 3, titulo: 'Palma, presionando y soltando' },
      { numero: 3, diaOffset: 7, titulo: 'Base del pulgar', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Entre los huesos de los dedos', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (mano y muñeca)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'pectorales', nombre: 'Pecho', bloque: 'Brazo, antebrazo y mano', premium: true, categoriaEmocional: false,
    porQue: 'Mantener los hombros hacia adelante frente a la pantalla pone duro y acorta el músculo del pecho.',
    datoClinico: 'Está muy ligado al dolor de hombro y a la postura. Trabajarlo ayuda también a que el cuello y la espalda se sientan menos cargados.',
    evitarSi: 'Cualquier dolor en el pecho que no sea claramente muscular (opresión, falta de aire) requiere atención médica inmediata, no automasaje.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Amasamiento general' },
      { numero: 2, diaOffset: 3, titulo: 'Puntos concretos del pecho' },
      { numero: 3, diaOffset: 7, titulo: 'Parte alta (cerca de la clavícula)', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Cerca de la axila (más profundo)', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (3 puntos)', esRutinaCompleta: true },
    ],
  },
  {
    id: 'abdomen', nombre: 'Abdomen', bloque: 'Brazo, antebrazo y mano', premium: true, categoriaEmocional: true,
    porQue: 'El estrés y estar sentado muchas horas afectan también la digestión. Las emociones que se "guardan" sin procesar (ansiedad, preocupación, tristeza) se sienten mucho en el abdomen: es una de las zonas donde el cuerpo las muestra con más claridad.',
    datoClinico: 'El masaje abdominal suave es una herramienta que se usa para ayudar a la digestión y al estreñimiento. Se hace en el sentido de las agujas del reloj, con presión suave.',
    evitarSi: 'Embarazo, dolor abdominal agudo, justo después de comer (esperar 1 o 2 horas), cualquier problema digestivo sin autorización médica.',
    niveles: [
      { numero: 1, diaOffset: 0, titulo: 'Círculos generales' },
      { numero: 2, diaOffset: 3, titulo: 'Cuatro puntos alrededor del ombligo' },
      { numero: 3, diaOffset: 7, titulo: 'Debajo del pecho', preguntaExtra: true },
      { numero: 4, diaOffset: 14, titulo: 'Debajo del ombligo', avanzado: true, preguntaExtra: true },
      { numero: 5, diaOffset: 21, titulo: 'Rutina completa (3 puntos)', esRutinaCompleta: true },
    ],
  },
];

/* Fotos paso a paso para las zonas más difíciles de explicar. Clave: id de la
   zona -> número de nivel -> número de paso -> foto. Si un paso no tiene foto
   aquí, se sigue mostrando el dibujo de siempre. */
const FOTOS_PASOS = {
  // piriforme: fotos del punto del centro (con pelota / sin pelota), la posición
  // y el calentamiento. Los niveles 3 y 4 siguen con el dibujo hasta tener fotos.
  piriforme: {
    1: { 2: 'images/piriforme-n1p2.jpg', 3: 'images/piriforme-n1p3.jpg', 4: 'images/piriforme-n1p4.jpg' },
    2: { 2: 'images/piriforme-n2p2.jpg', 3: 'images/piriforme-n2p3.jpg', 4: 'images/piriforme-n2p4.jpg' },
    3: { 2: 'images/piriforme-n3.jpg', 3: 'images/piriforme-n3.jpg' },
    4: { 2: 'images/piriforme-n4p2.jpg', 3: 'images/piriforme-n4p3.jpg' },
    5: { 2: 'images/piriforme-n1p4.jpg', 3: 'images/piriforme-n3.jpg', 4: 'images/piriforme-n4p3.jpg', 5: 'images/piriforme-n5.jpg' },
  },
};

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
