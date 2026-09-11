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

  const defs = `
    <marker id="${idFlecha}" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6" fill="none" stroke="${NEGRO}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
    </marker>
  `;

  let forma = '';
  if (tipoMovimiento === 'deslizar') {
    forma = `<path d="${trayectoOndulado(x1, y1, x2, y2, 7)}" fill="none" stroke="${NEGRO}" stroke-width="1.3" stroke-linecap="round" marker-end="url(#${idFlecha})" />`;
  } else if (tipoMovimiento === 'circular') {
    const r = Math.max(distancia(x1, y1, x2, y2) * 0.62, 10);
    forma = `<path d="M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}" fill="none" stroke="${NEGRO}" stroke-width="1.3" stroke-linecap="round" marker-end="url(#${idFlecha})" />`;
  } else if (tipoMovimiento === 'sostener') {
    forma = `<circle cx="${x2}" cy="${y2}" r="13" fill="none" stroke="${NEGRO}" stroke-width="1.3" stroke-dasharray="2.5 3.5" />`;
  } else {
    forma = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${NEGRO}" stroke-width="1.3" stroke-linecap="round" marker-end="url(#${idFlecha})" />`;
  }

  return { defs, forma };
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
    puntos: [
      { t: { x1: 90, y1: 111, x2: 120, y2: 160 }, tipo: 'circular' },   // "entre el cuello y el hombro"
      { t: { x1: 100, y1: 95, x2: 112, y2: 108 }, tipo: 'presionar' },  // "borde lateral, cerca del cuello"
      { t: { x1: 60, y1: 172, x2: 75, y2: 184 }, tipo: 'presionar' },   // "entre los omóplatos"
      { t: { x1: 42, y1: 192, x2: 58, y2: 203 }, tipo: 'presionar' },   // "borde interno del omóplato, más bajo"
    ],
    nivelPunto: [0, 1, 2, 3],
  },
  suboccipital: {
    imagen: 'images/musculo-suboccipital.png',
    puntos: [
      { t: { x1: 80, y1: 95, x2: 95, y2: 112 }, tipo: 'presionar' },    // borde óseo, base del cráneo
      { t: { x1: 100, y1: 98, x2: 112, y2: 110 }, tipo: 'presionar' },  // punto lateral, cerca de la base del cráneo
    ],
    nivelPunto: [0, 0, 1, 1],
  },
  temporal: {
    imagen: 'images/musculo-temporal.png',
    puntos: [
      { t: { x1: 45, y1: 95, x2: 90, y2: 112 }, tipo: 'circular' },     // recorrido cabello -> ojo
      { t: { x1: 30, y1: 98, x2: 45, y2: 108 }, tipo: 'presionar' },    // punto posterior, cerca de la línea del cabello
    ],
    nivelPunto: [0, 0, 1, 1],
  },
  mandibula: {
    imagen: 'images/musculo-mandibula.png',
    puntos: [
      { t: { x1: 45, y1: 95, x2: 60, y2: 125 }, tipo: 'presionar' },    // masetero superficial
      { t: { x1: 55, y1: 120, x2: 68, y2: 140 }, tipo: 'presionar' },   // punto profundo, ángulo de la mandíbula
    ],
    nivelPunto: [0, 0, 1, 1],
  },
  hombro: {
    imagen: 'images/musculo-hombro.png',
    puntos: [
      { t: { x1: 85, y1: 105, x2: 88, y2: 158 }, tipo: 'presionar' },   // fibras externas/medias
      { t: { x1: 70, y1: 95, x2: 75, y2: 125 }, tipo: 'presionar' },    // fibras anteriores (borde delantero del hombro)
      { t: { x1: 100, y1: 120, x2: 103, y2: 155 }, tipo: 'presionar' }, // fibras posteriores (borde trasero del hombro)
    ],
    nivelPunto: [0, 0, 1, 2],
  },
  omoplatos: {
    imagen: 'images/musculo-omoplatos.png',
    puntos: [
      { t: { x1: 25, y1: 80, x2: 68, y2: 172 }, tipo: 'presionar' },    // borde interno
      { t: { x1: 30, y1: 60, x2: 45, y2: 75 }, tipo: 'presionar' },     // punto superior
      { t: { x1: 35, y1: 35, x2: 48, y2: 50 }, tipo: 'presionar' },     // elevador de la escápula, hacia el cuello
    ],
    nivelPunto: [0, 0, 1, 2],
  },
  dorsal: {
    imagen: 'images/musculo-dorsal.png',
    puntos: [
      { t: { x1: 70, y1: 118, x2: 95, y2: 140 }, tipo: 'presionar' },   // zona alta general
      { t: { x1: 105, y1: 110, x2: 118, y2: 125 }, tipo: 'presionar' }, // borde externo, cerca de la axila
      { t: { x1: 80, y1: 150, x2: 92, y2: 162 }, tipo: 'presionar' },   // ángulo inferior del omóplato
    ],
    nivelPunto: [0, 0, 1, 2],
  },
  lumbar: {
    imagen: 'images/musculo-lumbar.png',
    puntos: [
      { t: { x1: 43, y1: 148, x2: 95, y2: 165 }, tipo: 'presionar' },   // a los lados de la columna
      { t: { x1: 35, y1: 170, x2: 50, y2: 182 }, tipo: 'presionar' },   // cerca de la cresta de la cadera
    ],
    nivelPunto: [0, 0, 1, 1],
  },
  piriforme: {
    imagen: 'images/musculo-piriforme.png',
    puntos: [
      { t: { x1: 65, y1: 100, x2: 70, y2: 113 }, tipo: 'presionar' },   // centro del glúteo
      { t: { x1: 85, y1: 75, x2: 95, y2: 85 }, tipo: 'presionar' },     // glúteo medio, punto alto
      { t: { x1: 85, y1: 95, x2: 95, y2: 105 }, tipo: 'presionar' },    // glúteo medio, punto medio
    ],
    nivelPunto: [0, 0, 1, 2],
  },
  pantorrillas: {
    imagen: 'images/musculo-pantorrillas.png',
    puntos: [
      { t: { x1: 90, y1: 160, x2: 70, y2: 110 }, tipo: 'deslizar' },    // ordeñe general, tobillo -> rodilla
      { t: { x1: 55, y1: 150, x2: 50, y2: 115 }, tipo: 'presionar' },   // gastrocnemio interno
      { t: { x1: 85, y1: 180, x2: 78, y2: 165 }, tipo: 'presionar' },   // sóleo, cerca del tendón de Aquiles
    ],
    nivelPunto: [0, 0, 1, 2],
  },
  planta_pie: {
    imagen: 'images/musculo-planta-pie.png',
    puntos: [
      { t: { x1: 90, y1: 150, x2: 75, y2: 65 }, tipo: 'deslizar' },     // talón -> dedos
      { t: { x1: 70, y1: 110, x2: 78, y2: 100 }, tipo: 'presionar' },   // centro del arco
      { t: { x1: 88, y1: 145, x2: 82, y2: 135 }, tipo: 'presionar' },   // combinado con la pantorrilla
    ],
    nivelPunto: [0, 0, 1, 2],
  },
  antebrazo: {
    imagen: 'images/musculo-antebrazo.png',
    puntos: [
      { t: { x1: 90, y1: 90, x2: 60, y2: 160 }, tipo: 'deslizar' },     // extensores y flexores, muñeca -> codo
      { t: { x1: 95, y1: 75, x2: 100, y2: 90 }, tipo: 'presionar' },    // codo externo ("codo de tenista")
      { t: { x1: 70, y1: 75, x2: 65, y2: 90 }, tipo: 'presionar' },     // codo interno ("codo de golfista")
    ],
    nivelPunto: [0, 0, 1, 2],
  },
  mano_muneca: {
    imagen: 'images/musculo-mano-muneca.png',
    puntos: [
      { t: { x1: 60, y1: 135, x2: 70, y2: 95 }, tipo: 'deslizar' },     // palma, centro -> dedos
      { t: { x1: 45, y1: 120, x2: 50, y2: 110 }, tipo: 'presionar' },   // base del pulgar
      { t: { x1: 65, y1: 80, x2: 75, y2: 75 }, tipo: 'presionar' },     // espacios entre los dedos, dorso de la mano
    ],
    nivelPunto: [0, 0, 1, 2],
  },
  pectorales: {
    imagen: 'images/musculo-pectorales.png',
    puntos: [
      { t: { x1: 75, y1: 115, x2: 105, y2: 100 }, tipo: 'presionar' },  // esternón -> costado
      { t: { x1: 70, y1: 75, x2: 95, y2: 68 }, tipo: 'presionar' },     // porción clavicular
      { t: { x1: 100, y1: 110, x2: 115, y2: 120 }, tipo: 'presionar' }, // pectoral menor, cerca de la axila
    ],
    nivelPunto: [0, 0, 1, 2],
  },
  abdomen: {
    imagen: 'images/musculo-abdomen.png',
    puntos: [
      { t: { x1: 83, y1: 83, x2: 95, y2: 108 }, tipo: 'circular' },     // círculos alrededor del ombligo
      { t: { x1: 75, y1: 55, x2: 85, y2: 65 }, tipo: 'presionar' },     // debajo del esternón
      { t: { x1: 75, y1: 115, x2: 85, y2: 125 }, tipo: 'presionar' },   // debajo del ombligo
    ],
    nivelPunto: [0, 0, 1, 2],
  },
};

function puntoParaNivel(cfg, numeroNivel) {
  const indice = cfg.nivelPunto[(numeroNivel || 1) - 1] ?? 0;
  return cfg.puntos[indice];
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
      const t = punto.t;
      const flecha = dibujarFlechaTrayecto(t.x1, t.y1, t.x2, t.y2, punto.tipo);
      defs += flecha.defs;
      capas += dibujarRegion(t.x1, t.y1, t.x2, t.y2, 0.22) + flecha.forma;
    });
  } else {
    const punto = puntoParaNivel(cfg, numeroNivel);
    const t = punto.t;
    const flecha = dibujarFlechaTrayecto(t.x1, t.y1, t.x2, t.y2, tipoMovimientoOverride || punto.tipo);
    defs = flecha.defs;
    capas = dibujarRegion(t.x1, t.y1, t.x2, t.y2) + flecha.forma;
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
