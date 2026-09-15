/*
  Meraki App — Utilidades compartidas de temporizador: formato de tiempo y
  los dos pitidos (inicio/fin), generados con código (Web Audio), sin
  archivos de audio. Usado por zona.js y por la pantalla de masaje en
  pareja.
*/

function formatearTiempo(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

let contextoAudio = null;
function reproducirTono(frecuencia, duracionMs, retrasoMs) {
  setTimeout(() => {
    try {
      if (!contextoAudio) contextoAudio = new (window.AudioContext || window.webkitAudioContext)();
      const osc = contextoAudio.createOscillator();
      const ganancia = contextoAudio.createGain();
      osc.type = 'sine';
      osc.frequency.value = frecuencia;
      ganancia.gain.setValueAtTime(0.15, contextoAudio.currentTime);
      ganancia.gain.exponentialRampToValueAtTime(0.001, contextoAudio.currentTime + duracionMs / 1000);
      osc.connect(ganancia);
      ganancia.connect(contextoAudio.destination);
      osc.start();
      osc.stop(contextoAudio.currentTime + duracionMs / 1000);
    } catch (e) { /* si el navegador bloquea el audio, seguimos sin sonido */ }
  }, retrasoMs || 0);
}
function sonarInicio() { reproducirTono(880, 150, 0); }
function sonarFin() { reproducirTono(660, 150, 0); reproducirTono(880, 250, 180); }
