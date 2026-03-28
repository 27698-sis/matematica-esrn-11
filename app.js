let deferredPrompt;
const installCard = document.getElementById('install-card');
const installButton = document.getElementById('install-button');

// Escucha el evento que indica que la app puede instalarse
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installCard.classList.add('show'); // muestra la tarjeta
});

// Maneja el clic en el botón
installButton.addEventListener('click', async () => {
  installCard.classList.remove('show'); // oculta la tarjeta
  deferredPrompt.prompt(); // lanza el diálogo de instalación
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`Instalación: ${outcome}`);
  deferredPrompt = null;
});
