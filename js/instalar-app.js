/*
  Meraki App — Botón "Descargar Aplicación Android".

  El navegador (Chrome en Android) avisa con el evento
  "beforeinstallprompt" cuando la app cumple los requisitos para
  instalarse (manifest.json + service worker + HTTPS). Guardamos ese
  evento y mostramos el botón solo cuando el navegador confirma que
  puede instalarse — en iPhone o en un navegador que no lo soporte,
  el botón simplemente nunca aparece.
*/

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

let eventoInstalacion = null;

window.addEventListener('beforeinstallprompt', (evento) => {
  evento.preventDefault();
  eventoInstalacion = evento;
  const boton = document.getElementById('boton-instalar-app');
  if (boton) boton.style.display = 'flex';
});

function configurarBotonInstalar(idBoton) {
  const boton = document.getElementById(idBoton);
  if (!boton) return;

  boton.addEventListener('click', async () => {
    if (!eventoInstalacion) return;
    eventoInstalacion.prompt();
    await eventoInstalacion.userChoice;
    eventoInstalacion = null;
    boton.style.display = 'none';
  });
}

window.addEventListener('appinstalled', () => {
  const boton = document.getElementById('boton-instalar-app');
  if (boton) boton.style.display = 'none';
});
