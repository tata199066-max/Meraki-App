/*
  Meraki App — Diagrama ilustrado único por paso: una sola ilustración con
  la silueta base (imagen real, sin marca de agua, guardada en /images),
  recoloreada por código a un tono normal (no negro), con la zona resaltada
  como una región y una flecha muy delgada que recorre el trayecto real de
  la técnica (de dónde a dónde), no solo un punto.

  El nombre de la zona va como título AFUERA del dibujo (en HTML), nunca
  como texto encima de las líneas.
*/

const VERDE = '#8BA886';
const NEGRO = '#1A1A1A';
const BEIGE = '#E8E0D5';
const CUERPO_COLOR = '#9C9186'; // tono normal/suave para la silueta (no negro)

const ZONAS_CABEZA_CUELLO = ['trapecio', 'suboccipital', 'temporal', 'mandibula'];

/* Trayecto de cada zona de cabeza/cuello: de dónde (x1,y1) a dónde (x2,y2)
   va la técnica, en el sistema de coordenadas del recorte (viewBox 0 0 150 200)
   sobre la mitad derecha de la imagen base. */
const TRAYECTO_CABEZA_CUELLO = {
  temporal: { x1: 122, y1: 68, x2: 103, y2: 48 },
  mandibula: { x1: 112, y1: 108, x2: 92, y2: 92 },
  suboccipital: { x1: 60, y1: 126, x2: 78, y2: 112 },
  trapecio: { x1: 133, y1: 150, x2: 96, y2: 128 },
};

/* ---------- Imagen base ya recoloreada (archivo real, no en tiempo real) ----------
   Antes esto se recoloreaba con canvas cada vez que se abría la pantalla, pero
   eso falla si la persona abre el archivo con doble clic (sin servidor) — el
   navegador bloquea leer los píxeles de una imagen local por seguridad, y la
   silueta se quedaba negra. Por eso ahora se usa un archivo PNG ya recoloreado
   una sola vez y guardado en /images, que funciona igual abriendo el archivo
   directo o desde un servidor. */
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
  const idFlecha = 'flecha-' + Math.round(x1) + '-' + Math.round(y1) + '-' + Math.round(x2) + '-' + tipoMovimiento;

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

/* Región (óvalo) que resalta toda la zona trabajada, no solo un punto,
   calculada a partir del trayecto de la técnica. */
function dibujarRegion(x1, y1, x2, y2) {
  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
  const largo = distancia(x1, y1, x2, y2);
  const angulo = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  const rx = largo / 2 + 12, ry = 13;
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${angulo} ${cx} ${cy})" fill="${VERDE}" fill-opacity="0.28" stroke="${VERDE}" stroke-width="1.3" stroke-opacity="0.7" />`;
}

/* Diagrama para zonas de cabeza/cuello: imagen real recortada a la cabeza
   de la derecha, recoloreada a un tono normal, con la región y la flecha
   de trayecto encima, en un SVG transparente. */
function generarDiagramaCabezaCuello(zonaId, tipoMovimiento) {
  const t = TRAYECTO_CABEZA_CUELLO[zonaId];
  const flecha = dibujarFlechaTrayecto(t.x1, t.y1, t.x2, t.y2, tipoMovimiento || 'presionar');
  const region = dibujarRegion(t.x1, t.y1, t.x2, t.y2);

  return `
    <div class="diagrama-marco" style="aspect-ratio: 3 / 4;">
      <div class="diagrama-imagen-base" style="background-image:url('images/base-cabeza-hombros-normal.png'); background-size:200% 100%; background-position:100% 0%;"></div>
      <svg class="diagrama-overlay" viewBox="0 0 150 200" preserveAspectRatio="none" role="img" aria-label="Diagrama de cabeza y cuello con la zona y el trayecto de la técnica">
        <defs>${flecha.defs}</defs>
        ${region}
        ${flecha.forma}
      </svg>
    </div>
  `;
}

/* ---------- Resto del cuerpo: recorte real sobre la foto de cuerpo completo ----------
   La imagen base-cuerpo-completo-normal.png tiene dos figuras de pie, brazos
   abiertos: la de la izquierda de frente, la de la derecha de espalda. Para
   cada zona se recorta (con matemática de background-size/position) solo la
   parte del cuerpo relevante, en vez de mostrar el cuerpo completo. */

const IMG_CUERPO = 'images/base-cuerpo-completo-normal.png';

const FIGURA_FRENTE = { x0: 0.010, x1: 0.479 };
const FIGURA_ESPALDA = { x0: 0.520, x1: 0.989 };

/* Para cada zona: en qué figura cae (frente/espalda), qué recorte local
   (0 a 1, dentro de esa figura) se muestra, y el trayecto de la técnica en
   coordenadas 0-100 dentro de ese recorte ya mostrado. */
const ZONA_CUERPO = {
  hombro: { figura: FIGURA_FRENTE, local: { x0: 0.56, x1: 0.84, y0: 0.15, y1: 0.27 }, t: { x1: 30, y1: 80, x2: 70, y2: 25 } },
  pectorales: { figura: FIGURA_FRENTE, local: { x0: 0.28, x1: 0.72, y0: 0.19, y1: 0.33 }, t: { x1: 78, y1: 55, x2: 25, y2: 45 } },
  abdomen: { figura: FIGURA_FRENTE, local: { x0: 0.30, x1: 0.70, y0: 0.33, y1: 0.49 }, t: { x1: 30, y1: 70, x2: 70, y2: 35 } },
  antebrazo: { figura: FIGURA_FRENTE, local: { x0: 0.74, x1: 1.0, y0: 0.30, y1: 0.49 }, t: { x1: 25, y1: 10, x2: 75, y2: 90 } },
  mano_muneca: { figura: FIGURA_FRENTE, local: { x0: 0.84, x1: 1.0, y0: 0.44, y1: 0.58 }, t: { x1: 30, y1: 20, x2: 60, y2: 85 } },
  pantorrillas: { figura: FIGURA_FRENTE, local: { x0: 0.30, x1: 0.70, y0: 0.76, y1: 0.92 }, t: { x1: 50, y1: 88, x2: 50, y2: 12 } },
  planta_pie: { figura: FIGURA_FRENTE, local: { x0: 0.15, x1: 0.85, y0: 0.90, y1: 0.965 }, t: { x1: 15, y1: 50, x2: 85, y2: 50 } },
  omoplatos: { figura: FIGURA_ESPALDA, local: { x0: 0.22, x1: 0.52, y0: 0.20, y1: 0.33 }, t: { x1: 25, y1: 80, x2: 75, y2: 25 } },
  dorsal: { figura: FIGURA_ESPALDA, local: { x0: 0.28, x1: 0.72, y0: 0.30, y1: 0.44 }, t: { x1: 25, y1: 75, x2: 75, y2: 30 } },
  lumbar: { figura: FIGURA_ESPALDA, local: { x0: 0.30, x1: 0.70, y0: 0.43, y1: 0.57 }, t: { x1: 50, y1: 88, x2: 50, y2: 15 } },
  piriforme: { figura: FIGURA_ESPALDA, local: { x0: 0.30, x1: 0.70, y0: 0.55, y1: 0.67 }, t: { x1: 30, y1: 80, x2: 70, y2: 25 } },
};

/* Convierte un recorte (fracciones 0-1 sobre la imagen completa) en los
   valores de background-size / background-position que muestran justo esa
   ventana dentro del contenedor. */
function calcularRecorte(x0, x1, y0, y1) {
  const anchoRecorte = x1 - x0;
  const altoRecorte = y1 - y0;
  const sizeX = 100 / anchoRecorte;
  const sizeY = 100 / altoRecorte;
  const posX = (x0 / (1 - anchoRecorte)) * 100;
  const posY = (y0 / (1 - altoRecorte)) * 100;
  return { sizeX, sizeY, posX, posY };
}

function generarDiagramaCuerpo(zonaId, tipoMovimiento) {
  const cfg = ZONA_CUERPO[zonaId];
  if (!cfg) {
    return `<div class="diagrama-marco" style="aspect-ratio: 1 / 1;"></div>`;
  }

  const absX0 = cfg.figura.x0 + cfg.local.x0 * (cfg.figura.x1 - cfg.figura.x0);
  const absX1 = cfg.figura.x0 + cfg.local.x1 * (cfg.figura.x1 - cfg.figura.x0);
  const absY0 = cfg.local.y0;
  const absY1 = cfg.local.y1;
  const r = calcularRecorte(absX0, absX1, absY0, absY1);

  const t = cfg.t;
  const flecha = dibujarFlechaTrayecto(t.x1, t.y1, t.x2, t.y2, tipoMovimiento || 'presionar');
  const region = dibujarRegion(t.x1, t.y1, t.x2, t.y2);

  return `
    <div class="diagrama-marco" style="aspect-ratio: 1 / 1;">
      <div class="diagrama-imagen-base" style="background-image:url('${IMG_CUERPO}'); background-size:${r.sizeX}% ${r.sizeY}%; background-position:${r.posX}% ${r.posY}%;"></div>
      <svg class="diagrama-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Diagrama del cuerpo con la zona y el trayecto de la técnica">
        <defs>${flecha.defs}</defs>
        ${region}
        ${flecha.forma}
      </svg>
    </div>
  `;
}

/* ---------- Fotos con el músculo trabajado resaltado (una por zona) ----------
   Cada zona tiene su propia foto real (generada, sin marca de agua, tono
   cálido y humano) donde el músculo que se trabaja se ve suavemente
   resaltado bajo la piel. Encima se dibuja la misma región + flecha de
   siempre, en el sistema de coordenadas compartido 0-150 / 0-206
   (proporcional a las fotos, que son todas de 864x1184). */
/* Cada trayecto (x1,y1 -> x2,y2) se releyó contra el paso a paso real del
   Nivel 1 de esa zona en zonas.js, para que la flecha vaya en la dirección
   exacta que describe la técnica (ej. "del talón hacia los dedos", "de la
   muñeca hacia el codo", "siempre hacia arriba") y termine sobre el punto
   de presión/dolor de referencia que se menciona en el texto. */
const ZONA_MUSCULO = {
  // "coloca las yemas de los dedos entre el cuello y el hombro"
  trapecio: { imagen: 'images/musculo-trapecio.png', t: { x1: 90, y1: 111, x2: 120, y2: 160 } },
  // "el borde justo donde termina el cráneo y empieza el cuello, a los costados de la columna"
  suboccipital: { imagen: 'images/musculo-suboccipital.png', t: { x1: 80, y1: 95, x2: 95, y2: 112 } },
  // "desde la línea del cabello hacia adelante, hasta la esquina externa del ojo"
  temporal: { imagen: 'images/musculo-temporal.png', t: { x1: 45, y1: 95, x2: 90, y2: 112 } },
  // "delante de las orejas" -> "debajo del hueso de la mandíbula"
  mandibula: { imagen: 'images/musculo-mandibula.png', t: { x1: 45, y1: 95, x2: 60, y2: 125 } },
  // "la parte externa del hombro" ... "de arriba hacia abajo"
  hombro: { imagen: 'images/musculo-hombro.png', t: { x1: 85, y1: 105, x2: 88, y2: 158 } },
  // "el borde interno del omóplato"
  omoplatos: { imagen: 'images/musculo-omoplatos.png', t: { x1: 25, y1: 80, x2: 68, y2: 172 } },
  // "la mano por encima del hombro contrario hacia la zona alta de la espalda"
  dorsal: { imagen: 'images/musculo-dorsal.png', t: { x1: 70, y1: 118, x2: 95, y2: 140 } },
  // "uno a cada lado de la columna" (bilateral, a la altura lumbar)
  lumbar: { imagen: 'images/musculo-lumbar.png', t: { x1: 43, y1: 148, x2: 95, y2: 165 } },
  // "en el centro del glúteo"
  piriforme: { imagen: 'images/musculo-piriforme.png', t: { x1: 65, y1: 100, x2: 70, y2: 113 } },
  // "desde el tobillo hacia la rodilla, siempre hacia arriba"
  pantorrillas: { imagen: 'images/musculo-pantorrillas.png', t: { x1: 90, y1: 160, x2: 70, y2: 110 } },
  // "desde el talón hacia los dedos"
  planta_pie: { imagen: 'images/musculo-planta-pie.png', t: { x1: 90, y1: 150, x2: 75, y2: 65 } },
  // "desde la muñeca hasta el codo"
  antebrazo: { imagen: 'images/musculo-antebrazo.png', t: { x1: 90, y1: 90, x2: 60, y2: 160 } },
  // "desde el centro de la palma hacia los dedos"
  mano_muneca: { imagen: 'images/musculo-mano-muneca.png', t: { x1: 60, y1: 135, x2: 70, y2: 95 } },
  // "desde el esternón hacia el costado"
  pectorales: { imagen: 'images/musculo-pectorales.png', t: { x1: 75, y1: 115, x2: 105, y2: 100 } },
  // "en sentido de las agujas del reloj", alrededor del ombligo
  abdomen: { imagen: 'images/musculo-abdomen.png', t: { x1: 83, y1: 83, x2: 95, y2: 108 } },
};

function generarDiagramaMusculo(zonaId, tipoMovimiento) {
  const cfg = ZONA_MUSCULO[zonaId];
  if (!cfg) {
    return `<div class="diagrama-marco" style="aspect-ratio: 3 / 4;"></div>`;
  }
  const t = cfg.t;
  const flecha = dibujarFlechaTrayecto(t.x1, t.y1, t.x2, t.y2, tipoMovimiento || 'presionar');
  const region = dibujarRegion(t.x1, t.y1, t.x2, t.y2);

  return `
    <div class="diagrama-marco" style="aspect-ratio: 864 / 1184;">
      <div class="diagrama-imagen-base" style="background-image:url('${cfg.imagen}'); background-size:cover; background-position:center;"></div>
      <svg class="diagrama-overlay" viewBox="0 0 150 206" preserveAspectRatio="none" role="img" aria-label="Diagrama con el músculo trabajado, la región y el trayecto de la técnica">
        <defs>${flecha.defs}</defs>
        ${region}
        ${flecha.forma}
      </svg>
    </div>
  `;
}

/*
  Punto de entrada: elige la base correcta según la zona.
*/
function generarDiagramaCompleto(zonaId, tipoMovimiento) {
  if (ZONA_MUSCULO[zonaId]) {
    return generarDiagramaMusculo(zonaId, tipoMovimiento);
  }
  if (ZONAS_CABEZA_CUELLO.includes(zonaId)) {
    return generarDiagramaCabezaCuello(zonaId, tipoMovimiento);
  }
  return generarDiagramaCuerpo(zonaId, tipoMovimiento);
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
