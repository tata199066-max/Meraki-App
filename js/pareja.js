/*
  Meraki App — Masajes en pareja (sección 9 del brief).
  El primero es gratis, el resto premium. Contenido descriptivo (postura de
  quien recibe, postura de quien da, tiempo, presión) — sin temporizador,
  ya que la técnica la guía la pareja, no un conteo automático.
*/

const MASAJES_PAREJA = [
  {
    id: 'cuello_hombros_pareja',
    nombre: 'Cuello y hombros',
    nivel: 'Básico',
    premium: false,
    tiempo: '10 minutos',
    imagen: 'images/pareja-cuello-hombros.png',
    posturaRecibe: 'Sentada en una silla o en el piso, con la espalda relajada y los hombros sueltos.',
    posturaDa: 'De pie o de rodillas detrás de quien recibe, con ambas manos libres para trabajar el cuello y los hombros.',
    presion: 'Firme pero cómoda — pregunta siempre "¿así está bien?" antes de subir la intensidad.',
  },
  {
    id: 'espalda_alta_pareja',
    nombre: 'Espalda alta / escápulas',
    nivel: 'Básico',
    premium: true,
    tiempo: '10 minutos',
    imagen: 'images/pareja-espalda-alta.png',
    posturaRecibe: 'Boca abajo en la cama o sentada inclinada hacia adelante, apoyada en una almohada.',
    posturaDa: 'De pie a un lado, o a horcajadas si es en la cama, con acceso cómodo a ambos omóplatos.',
    presion: 'Media, en círculos amplios sobre los omóplatos, nunca directo sobre el hueso.',
  },
  {
    id: 'espalda_baja_pareja',
    nombre: 'Espalda baja / lumbar',
    nivel: 'Intermedio',
    premium: true,
    tiempo: '10-12 minutos',
    imagen: 'images/pareja-espalda-baja.png',
    posturaRecibe: 'Boca abajo, con una almohada bajo el abdomen para aplanar la zona lumbar.',
    posturaDa: 'De rodillas a un lado, usando el peso del cuerpo en vez de solo la fuerza del brazo.',
    presion: 'Suave a media, siempre a los lados de la columna, nunca sobre ella.',
  },
  {
    id: 'piernas_pareja',
    nombre: 'Piernas cansadas',
    nivel: 'Básico',
    premium: true,
    tiempo: '8-10 minutos',
    imagen: 'images/pareja-piernas.png',
    posturaRecibe: 'Acostada boca arriba, con las piernas apoyadas sobre las piernas de quien da.',
    posturaDa: 'Sentada, con las piernas de la otra persona apoyadas de forma cómoda y estable.',
    presion: 'Deslizamiento firme desde el tobillo hacia la rodilla, siempre hacia arriba (ayuda a la circulación de retorno).',
  },
  {
    id: 'pies_pareja',
    nombre: 'Pies',
    nivel: 'Básico',
    premium: true,
    tiempo: '8-10 minutos',
    imagen: 'images/pareja-pies.png',
    posturaRecibe: 'Sentada o acostada, con el pie apoyado sobre las piernas de quien da.',
    posturaDa: 'Sentada frente a quien recibe, sosteniendo el pie con ambas manos.',
    presion: 'Firme con los pulgares, desde el talón hacia los dedos.',
  },
  {
    id: 'manos_pareja',
    nombre: 'Manos y antebrazos',
    nivel: 'Básico',
    premium: true,
    tiempo: '8 minutos',
    imagen: 'images/pareja-manos.png',
    posturaRecibe: 'Sentada, con el brazo apoyado y relajado sobre una mesa o sobre las piernas de quien da.',
    posturaDa: 'Sentada frente a quien recibe, sosteniendo la mano y el antebrazo con ambas manos.',
    presion: 'Suave a media, en círculos desde la muñeca hacia el codo, y en la palma hacia los dedos.',
  },
  {
    id: 'gluteo_cadera_pareja',
    nombre: 'Glúteo / cadera',
    nivel: 'Intermedio',
    premium: true,
    tiempo: '10 minutos',
    imagen: 'images/pareja-gluteo-cadera.png',
    posturaRecibe: 'Boca abajo, cómoda, habiendo hablado antes con claridad sobre qué zonas está bien tocar.',
    posturaDa: 'De rodillas a un lado, con las manos siempre visibles y los movimientos anunciados en voz alta.',
    presion: 'Suave a media, con los nudillos o la palma, deteniéndose de inmediato si la otra persona lo pide.',
    notaConsentimiento: 'Esta técnica requiere consentimiento explícito y comunicación constante durante toda la sesión: pregunta antes de empezar y detente en cualquier momento si te lo piden.',
  },
  {
    id: 'rutina_completa_pareja',
    nombre: 'Rutina completa',
    nivel: 'Avanzado',
    premium: true,
    tiempo: '20 minutos',
    imagen: 'images/pareja-rutina-completa.png',
    posturaRecibe: 'Boca abajo para la primera mitad (espalda, glúteo, piernas) y boca arriba para la segunda (pies, manos, cuello).',
    posturaDa: 'Alternando posición según la zona, siguiendo el mismo orden que en las técnicas individuales.',
    presion: 'La misma recomendada en cada técnica individual — ir de más suave a más firme conforme avanza la sesión.',
    detalle: 'Encadena, en este orden, las técnicas de: espalda alta, espalda baja, glúteo/cadera, piernas, pies, manos y cuello/hombros.',
  },
];

function obtenerMasajeParejaPorId(id) {
  return MASAJES_PAREJA.find(m => m.id === id) || null;
}
