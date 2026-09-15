/*
  Meraki App — Diagrama ilustrado por nivel: una foto real del músculo
  trabajado (guardada en /images, generada sin marca de agua, tono cálido
  y humano) con una región y una flecha de trayecto dibujadas por código
  (SVG), nunca generadas por IA.

  Cada zona tiene varios "puntos" reales (uno por técnica distinta descrita
  en zonas.js/pasos_zona), y cada nivel usa el punto que le corresponde —
  así el dibujo cambia según el nivel en vez de repetir siempre la misma
  flecha. El Nivel 5 ("rutina completa") combina todos los puntos distintos
  de la zona en un solo dibujo, porque ese nivel junta todas las técnicas.

  El nombre de la zona va como título AFUERA del dibujo (en HTML), nunca
  como texto encima de las líneas.
*/

const VERDE = '#8BA886';
const NEGRO = '#1A1A1A';
const BEIGE = '#E8E0D5';

function precargarImagenesDiagrama() {
  return Promise.resolve();
}

/* ---------- Flechas muy delgadas, de un punto a otro ---------- */

function distancia(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/* Genera el trayecto ondulado (deslizar/frotar) entre dos puntos. */
function trayectoOndulado(x1, y1, x2, y2, amplitud) {
  const dx = x2 - x1, dy = y2 - y1;
  const nx = -dy, ny = dx;
  const largo = Math.sqrt(nx * nx + ny * ny) || 1;
  const ux = (nx / largo) * amplitud, uy = (ny / largo) * amplitud;
  const p = (t) => ({ x: x1 + dx * t, y: y1 + dy * t });
  const m1 = p(0.33), m2 = p(0.66);
  return `M${x1} ${y1} Q${m1.x + ux} ${m1.y + uy} ${p(0.5).x} ${p(0.5).y} Q${m2.x - ux} ${m2.y - uy} ${x2} ${y2}`;
}

/*
  Dibuja la flecha (muy delgada) que muestra de dónde a dónde va la
  técnica. El tipo cambia según la acción:
    · ondulada  -> deslizar / frotar (todo el trayecto)
    · curva     -> girar / círculos (arco entre los dos puntos)
    · punteada  -> sostener / mantener (marca el punto final, sin trayecto)
    · recta fina -> presionar hacia el punto
*/
function dibujarFlechaTrayecto(x1, y1, x2, y2, tipoMovimiento) {
  const idFlecha = 'flecha-' + Math.round(x1) + '-' + Math.round(y1) + '-' + Math.round(x2) + '-' + Math.round(y2) + '-' + tipoMovimiento;
  const idTrayecto = idFlecha + '-ruta';

  const defs = `
    <marker id="${idFlecha}" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6" fill="none" stroke="${NEGRO}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
    </marker>
  `;

  // Icono de mano muy simple (palma + 4 dedos), dibujado en código, sin foto
  // ni video — se anima recorriendo el trayecto (deslizar/circular) o
  // pulsando en el punto (presionar/sostener) para mostrar movimiento real
  // de la técnica sin costo de generar imágenes nuevas.
  const iconoMano = `
    <ellipse cx="0" cy="1.5" rx="2.6" ry="3.2" fill="none" stroke="${NEGRO}" stroke-width="1" />
    <line x1="-1.6" y1="-1.2" x2="-1.8" y2="-3.4" stroke="${NEGRO}" stroke-width="0.9" stroke-linecap="round" />
    <line x1="-0.4" y1="-1.8" x2="-0.5" y2="-4.2" stroke="${NEGRO}" stroke-width="0.9" stroke-linecap="round" />
    <line x1="0.8" y1="-1.8" x2="1.0" y2="-4.1" stroke="${NEGRO}" stroke-width="0.9" stroke-linecap="round" />
    <line x1="1.9" y1="-1.0" x2="2.6" y2="-2.8" stroke="${NEGRO}" stroke-width="0.9" stroke-linecap="round" />
  `;

  let forma = '';
  let mano = '';

  if (tipoMovimiento === 'deslizar') {
    forma = `<path id="${idTrayecto}" d="${trayectoOndulado(x1, y1, x2, y2, 7)}" fill="none" stroke="${NEGRO}" stroke-width="1.3" stroke-linecap="round" marker-end="url(#${idFlecha})" />`;
    mano = `<g opacity="0.85">${iconoMano}<animateMotion dur="2.4s" repeatCount="indefinite" rotate="auto"><mpath href="#${idTrayecto}" /></animateMotion></g>`;
  } else if (tipoMovimiento === 'circular') {
    const r = Math.max(distancia(x1, y1, x2, y2) * 0.62, 10);
    forma = `<path id="${idTrayecto}" d="M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}" fill="none" stroke="${NEGRO}" stroke-width="1.3" stroke-linecap="round" marker-end="url(#${idFlecha})" />`;
    mano = `<g opacity="0.85">${iconoMano}<animateMotion dur="2.2s" repeatCount="indefinite" rotate="auto"><mpath href="#${idTrayecto}" /></animateMotion></g>`;
  } else if (tipoMovimiento === 'sostener') {
    // "Sostener": pulso suave y parejo, como mantener la presión quieta.
    forma = `<circle cx="${x2}" cy="${y2}" r="13" fill="none" stroke="${NEGRO}" stroke-width="1.3" stroke-dasharray="2.5 3.5" />`;
    mano = `<g transform="translate(${x2} ${y2})"><g opacity="0.85">${iconoMano}<animateTransform attributeName="transform" type="scale" values="1;1.12;1" dur="1.8s" repeatCount="indefinite" /></g></g>`;
  } else {
    // "Presionar": la mano se aplana un poco hacia abajo, como si empujara
    // contra la piel, y luego se suelta — distinto del pulso parejo de
    // "sostener", para que se note que aquí sí hay presión activa.
    forma = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${NEGRO}" stroke-width="1.3" stroke-linecap="round" marker-end="url(#${idFlecha})" />`;
    mano = `<g transform="translate(${x2} ${y2})"><g opacity="0.85">${iconoMano}<animateTransform attributeName="transform" type="scale" values="1,1; 1.22,0.68; 1.22,0.68; 1,1" keyTimes="0; 0.35; 0.55; 1" dur="1.5s" repeatCount="indefinite" /></g></g>`;
  }

  return { defs, forma: forma + mano };
}

/* Línea de contexto: muy tenue y punteada, sin flecha protagonista, que
   muestra por dónde sigue el músculo completo (cuando es un músculo largo,
   como el trapecio o el dorsal) detrás del punto que se está trabajando
   en este nivel — para que quede claro que ese punto es parte de un
   músculo más grande, sin competir visualmente con el punto de hoy. */
function dibujarLineaContexto(puntos) {
  if (!puntos || puntos.length < 2) return '';
  let d = `M${puntos[0].x} ${puntos[0].y}`;
  for (let i = 1; i < puntos.length; i++) {
    d += ` L${puntos[i].x} ${puntos[i].y}`;
  }
  return `<path d="${d}" fill="none" stroke="${NEGRO}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 4" opacity="0.32" />`;
}

/* Región (óvalo) que resalta la zona trabajada por ese punto en concreto. */
function dibujarRegion(x1, y1, x2, y2, opacidad) {
  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
  const largo = distancia(x1, y1, x2, y2);
  const angulo = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  const rx = largo / 2 + 12, ry = 13;
  const op = opacidad ?? 0.28;
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${angulo} ${cx} ${cy})" fill="${VERDE}" fill-opacity="${op}" stroke="${VERDE}" stroke-width="1.3" stroke-opacity="0.7" />`;
}

/* ---------- Fotos con el músculo trabajado resaltado (una por zona) ----------
   Cada zona tiene su propia foto real donde el músculo que se trabaja se ve
   suavemente resaltado bajo la piel, en el sistema de coordenadas 0-150 /
   0-206 (proporcional a las fotos, todas de 864x1184).

   "puntos" son los lugares reales y distintos que describe la técnica de
   esa zona (releídos contra zonas.js / pasos_zona para que cada uno caiga
   exactamente donde dice el texto — ej. "borde lateral, cerca del cuello",
   "cerca de la cresta de la cadera", "debajo del ombligo"). "nivelPunto"
   dice qué punto usa cada nivel 1-4 (varios niveles pueden compartir punto
   cuando la técnica es la misma zona con más tiempo/profundidad). El Nivel
   5 (rutina completa) combina todos los puntos de la lista. */
const ZONA_MUSCULO = {
  trapecio: {
    imagen: 'images/musculo-trapecio.png',
    // Coordenadas verificadas pixel a pixel contra el resplandor real de la
    // foto (nunca a ojo): se mantienen siempre sobre el trapecio/occipital,
    // lejos de la oreja y del lateral del cuello, siguiendo la recomendación
    // de masoterapia de evitar el triángulo anterior/lateral (carótida,
    // yugular) y trabajar solo la zona posterior segura.
    puntos: [
      { t: { x1: 70, y1: 102, x2: 80, y2: 124 }, tipo: 'circular' },    // base del cráneo / trapecio superior, ya lejos de la oreja
      { t: { x1: 78, y1: 120, x2: 87, y2: 138 }, tipo: 'presionar' },   // trapecio superior, hacia el cuello pero sobre el músculo, no sobre la oreja
      { t: { x1: 88, y1: 139, x2: 96, y2: 157 }, tipo: 'presionar' },   // "entre los omóplatos" (trapecio medio, más abajo)
      { t: { x1: 94, y1: 154, x2: 102, y2: 173 }, tipo: 'presionar' },  // "borde interno del omóplato, más bajo" (trapecio inferior)
    ],
    nivelPunto: [0, 1, 2, 3],
    // El trapecio es un músculo grande: esta línea tenue muestra que sigue
    // desde la base del cráneo hasta la mitad de la espalda (paravertebral),
    // aunque cada nivel solo trabaje un punto de ese recorrido.
    contexto: [{ x: 75.5, y: 113 }, { x: 82.5, y: 128.7 }, { x: 92, y: 147.8 }, { x: 98.1, y: 163.5 }, { x: 106, y: 182 }],
  },
  suboccipital: {
    imagen: 'images/musculo-suboccipital.png',
    puntos: [
      { t: { x1: 70, y1: 90, x2: 78, y2: 102 }, tipo: 'presionar' },    // borde óseo, base del cráneo (nuca)
      { t: { x1: 88, y1: 98, x2: 96, y2: 108 }, tipo: 'presionar' },    // punto lateral, cerca de la base del cráneo
    ],
    nivelPunto: [0, 0, 1, 1],
  },
  temporal: {
    imagen: 'images/musculo-temporal.png',
    // El músculo temporal está solo en la sien (entre la oreja y la
    // esquina externa del ojo/ceja, dentro de la línea del cabello) — antes
    // la flecha cruzaba toda la cara hasta la esquina del ojo, saliéndose
    // del músculo y acercándose a la zona ocular, que no se debe presionar.
    puntos: [
      { t: { x1: 64, y1: 46, x2: 86, y2: 64 }, tipo: 'circular' },      // sien, dentro de la línea del cabello, lejos del ojo
      { t: { x1: 62, y1: 72, x2: 72, y2: 82 }, tipo: 'presionar' },     // punto posterior, justo encima de la oreja
    ],
    nivelPunto: [0, 0, 1, 1],
  },
  mandibula: {
    imagen: 'images/musculo-mandibula.png',
    puntos: [
      { t: { x1: 45, y1: 96, x2: 60, y2: 128 }, tipo: 'presionar' },    // masetero superficial (delante de la oreja -> debajo de la mandíbula)
      { t: { x1: 50, y1: 110, x2: 62, y2: 125 }, tipo: 'presionar' },   // punto profundo, ángulo de la mandíbula
    ],
    nivelPunto: [0, 0, 1, 1],
  },
  hombro: {
    imagen: 'images/musculo-hombro.png',
    puntos: [
      { t: { x1: 85, y1: 105, x2: 88, y2: 158 }, tipo: 'presionar' },   // fibras externas/medias (deltoides, arriba -> abajo)
      { t: { x1: 65, y1: 90, x2: 72, y2: 110 }, tipo: 'presionar' },    // fibras anteriores (borde delantero, cerca de la clavícula)
      { t: { x1: 100, y1: 125, x2: 103, y2: 155 }, tipo: 'presionar' }, // fibras posteriores (borde trasero, hacia el omóplato)
    ],
    nivelPunto: [0, 0, 1, 2],
  },
  omoplatos: {
    imagen: 'images/musculo-omoplatos.png',
    puntos: [
      { t: { x1: 40, y1: 138, x2: 58, y2: 148 }, tipo: 'presionar' },   // borde interno del omóplato, cerca de la columna
      { t: { x1: 45, y1: 125, x2: 60, y2: 133 }, tipo: 'presionar' },   // punto superior (romboides menor, cerca de la columna)
      { t: { x1: 55, y1: 95, x2: 68, y2: 105 }, tipo: 'presionar' },    // elevador de la escápula, hacia el cuello
    ],
    nivelPunto: [0, 0, 1, 2],
  },
  dorsal: {
    imagen: 'images/musculo-dorsal.png',
    puntos: [
      // "Zona alta general" cruzaba de un lado al otro pasando por encima de
      // la columna — se separó en dos flechas, una por lado, siguiendo la
      // fibra del dorsal ancho (de cerca de la columna hacia afuera y
      // arriba, hacia la axila), igual que se corrigió en la lumbar.
      {
        t: [
          { x1: 68, y1: 135, x2: 58, y2: 115 },
          { x1: 82, y1: 135, x2: 92, y2: 115 },
        ],
        tipo: 'presionar',
      },
      { t: { x1: 110, y1: 90, x2: 125, y2: 110 }, tipo: 'presionar' },  // borde externo, cerca de la axila
      { t: { x1: 78, y1: 135, x2: 90, y2: 148 }, tipo: 'presionar' },   // ángulo inferior del omóplato
    ],
    nivelPunto: [0, 0, 1, 2],
    contexto: [{ x: 117.5, y: 100 }, { x: 82.5, y: 129 }, { x: 84, y: 141.5 }],
  },
  lumbar: {
    imagen: 'images/musculo-lumbar.png',
    // Nunca una sola flecha cruzando por encima de la columna: cada lado se
    // trabaja por separado, con su propia flecha, siguiendo la dirección
    // real de las fibras (paravertebral: vertical, arriba/abajo; cuadrado
    // lumbar: hacia fuera, de la columna hacia la cadera). Verificado contra
    // fuentes de fisioterapia sobre automasaje lumbar.
    puntos: [
      {
        t: [
          { x1: 64, y1: 155, x2: 61, y2: 179 },   // paravertebral, lado izquierdo (de la persona)
          { x1: 82, y1: 155, x2: 85, y2: 179 },   // paravertebral, lado derecho — nunca cruza la columna
        ],
        tipo: 'presionar',
      },
      {
        t: [
          { x1: 68, y1: 178, x2: 58, y2: 189 },   // cuadrado lumbar, lado izquierdo, hacia la cresta ilíaca
          { x1: 78, y1: 178, x2: 88, y2: 189 },   // cuadrado lumbar, lado derecho
        ],
        tipo: 'presionar',
      },
    ],
    nivelPunto: [0, 0, 1, 1],
  },
  piriforme: {
    imagen: 'images/musculo-piriforme.png',
    // Ilustración anatómica real (no foto), sin texto, mostrando el
    // piriforme resaltado en naranja y el nervio ciático pasando justo por
    // debajo. Coordenadas medidas pixel a pixel sobre la franja naranja del
    // lado derecho de la imagen — con 3 puntos a lo largo del mismo músculo
    // (borde cerca del sacro, centro, borde cerca de la cadera), nunca
    // sobre el nervio.
    puntos: [
      { t: { x1: 98, y1: 85, x2: 106, y2: 95 }, tipo: 'presionar' },    // piriforme central
      { t: { x1: 94, y1: 80, x2: 101, y2: 90 }, tipo: 'presionar' },    // piriforme, borde superior (cerca del sacro)
      { t: { x1: 102, y1: 90, x2: 110, y2: 100 }, tipo: 'presionar' },  // piriforme, borde inferior (cerca del trocánter/cadera)
    ],
    nivelPunto: [0, 0, 1, 2],
  },
  pantorrillas: {
    imagen: 'images/musculo-pantorrillas.png',
    puntos: [
      { t: { x1: 90, y1: 160, x2: 70, y2: 110 }, tipo: 'deslizar' },    // ordeñe general, tobillo -> rodilla, siempre hacia arriba
      { t: { x1: 60, y1: 145, x2: 65, y2: 120 }, tipo: 'presionar' },   // gastrocnemio interno
      { t: { x1: 75, y1: 175, x2: 70, y2: 160 }, tipo: 'presionar' },   // sóleo, cerca del tendón de Aquiles
    ],
    nivelPunto: [0, 0, 1, 2],
    contexto: [{ x: 90, y: 160 }, { x: 72.5, y: 167.5 }, { x: 62.5, y: 132.5 }, { x: 70, y: 110 }],
  },
  planta_pie: {
    imagen: 'images/musculo-planta-pie.png',
    puntos: [
      { t: { x1: 88, y1: 155, x2: 78, y2: 75 }, tipo: 'deslizar' },     // talón -> dedos
      { t: { x1: 75, y1: 100, x2: 82, y2: 112 }, tipo: 'presionar' },   // centro del arco
      { t: { x1: 85, y1: 165, x2: 80, y2: 150 }, tipo: 'presionar' },   // combinado con la pantorrilla, cerca del talón/tobillo
    ],
    nivelPunto: [0, 0, 1, 2],
  },
  antebrazo: {
    imagen: 'images/musculo-antebrazo.png',
    // Los puntos de "codo" estaban puestos cerca de la muñeca (arriba en la
    // foto) en vez de cerca del codo (abajo) — se corrigieron para que
    // caigan justo en el codo, a cada lado, que es donde de verdad están
    // el epicóndilo externo e interno.
    puntos: [
      { t: { x1: 90, y1: 90, x2: 60, y2: 160 }, tipo: 'deslizar' },     // extensores y flexores, muñeca -> codo
      { t: { x1: 48, y1: 153, x2: 40, y2: 167 }, tipo: 'presionar' },   // codo externo ("codo de tenista")
      { t: { x1: 68, y1: 153, x2: 76, y2: 167 }, tipo: 'presionar' },   // codo interno ("codo de golfista")
    ],
    nivelPunto: [0, 0, 1, 2],
    contexto: [{ x: 60, y: 160 }, { x: 75, y: 122 }, { x: 91.5, y: 84 }],
  },
  mano_muneca: {
    imagen: 'images/musculo-mano-muneca.png',
    puntos: [
      { t: { x1: 60, y1: 135, x2: 70, y2: 95 }, tipo: 'deslizar' },     // palma, centro -> dedos
      { t: { x1: 92, y1: 115, x2: 102, y2: 130 }, tipo: 'presionar' },  // base del pulgar
      { t: { x1: 55, y1: 75, x2: 65, y2: 85 }, tipo: 'presionar' },     // espacios entre los dedos, base de los dedos
    ],
    nivelPunto: [0, 0, 1, 2],
  },
  pectorales: {
    imagen: 'images/musculo-pectorales.png',
    puntos: [
      { t: { x1: 75, y1: 115, x2: 105, y2: 100 }, tipo: 'presionar' },  // esternón -> costado
      { t: { x1: 75, y1: 45, x2: 90, y2: 55 }, tipo: 'presionar' },     // porción clavicular, parte alta
      { t: { x1: 110, y1: 100, x2: 122, y2: 112 }, tipo: 'presionar' }, // pectoral menor, cerca de la axila
    ],
    nivelPunto: [0, 0, 1, 2],
  },
  abdomen: {
    imagen: 'images/musculo-abdomen.png',
    puntos: [
      { t: { x1: 75, y1: 78, x2: 88, y2: 95 }, tipo: 'circular' },      // círculos alrededor del ombligo
      { t: { x1: 78, y1: 50, x2: 88, y2: 60 }, tipo: 'presionar' },     // debajo del esternón
      { t: { x1: 78, y1: 100, x2: 88, y2: 112 }, tipo: 'presionar' },   // debajo del ombligo
    ],
    nivelPunto: [0, 0, 1, 2],
  },
};

function puntoParaNivel(cfg, numeroNivel) {
  const indice = cfg.nivelPunto[(numeroNivel || 1) - 1] ?? 0;
  return cfg.puntos[indice];
}

/* Algunas técnicas necesitan más de una flecha en la misma foto (por
   ejemplo, trabajar los dos lados de la columna por separado, nunca
   cruzando por encima de ella) — `punto.t` puede ser un solo trayecto o
   una lista de trayectos, y aquí se dibujan todos juntos. */
function dibujarPunto(punto, opacidadRegion, tipoOverride) {
  const lista = Array.isArray(punto.t) ? punto.t : [punto.t];
  let defs = '';
  let capas = '';
  lista.forEach((t) => {
    const flecha = dibujarFlechaTrayecto(t.x1, t.y1, t.x2, t.y2, tipoOverride || punto.tipo);
    defs += flecha.defs;
    capas += dibujarRegion(t.x1, t.y1, t.x2, t.y2, opacidadRegion) + flecha.forma;
  });
  return { defs, capas };
}

function generarDiagramaMusculo(zonaId, numeroNivel, tipoMovimientoOverride) {
  const cfg = ZONA_MUSCULO[zonaId];
  if (!cfg) {
    return `<div class="diagrama-marco" style="aspect-ratio: 3 / 4;"></div>`;
  }

  let defs = '';
  let capas = '';

  const esRutinaCompleta = numeroNivel === 5;
  if (esRutinaCompleta) {
    // Rutina completa: se muestran todos los puntos distintos de la zona a la vez.
    cfg.puntos.forEach((punto) => {
      const dibujo = dibujarPunto(punto, 0.22);
      defs += dibujo.defs;
      capas += dibujo.capas;
    });
  } else {
    const punto = puntoParaNivel(cfg, numeroNivel);
    const dibujo = dibujarPunto(punto, undefined, tipoMovimientoOverride);
    defs = dibujo.defs;
    capas = dibujarLineaContexto(cfg.contexto) + dibujo.capas;
  }

  return `
    <div class="diagrama-marco" style="aspect-ratio: 864 / 1184;">
      <div class="diagrama-imagen-base" style="background-image:url('${cfg.imagen}'); background-size:cover; background-position:center;"></div>
      <svg class="diagrama-overlay" viewBox="0 0 150 206" preserveAspectRatio="none" role="img" aria-label="Diagrama con el músculo trabajado y el punto de la técnica de este nivel">
        <defs>${defs}</defs>
        ${capas}
      </svg>
    </div>
  `;
}

/*
  Punto de entrada del diagrama. `numeroNivel` (1 a 5) decide qué punto de
  la zona se muestra; `tipoMovimiento`, cuando se pasa, fuerza la forma de
  la flecha para el paso actual (calentamiento, círculos, sostener, etc.).
*/
function generarDiagramaCompleto(zonaId, numeroNivel, tipoMovimiento) {
  return generarDiagramaMusculo(zonaId, numeroNivel, tipoMovimiento);
}

/* Determina un tipo de movimiento simple a partir del texto del paso,
   solo para elegir qué flecha mostrar (no cambia el contenido del texto). */
function inferirTipoMovimiento(tituloPaso) {
  const t = tituloPaso.toLowerCase();
  if (t.includes('círculo') || t.includes('circular')) return 'circular';
  if (t.includes('desliz') || t.includes('calentamiento') || t.includes('ordeñ')) return 'deslizar';
  if (t.includes('sosten') || t.includes('respir') || t.includes('cierre') || t.includes('estiramiento')) return 'sostener';
  return 'presionar';
}
