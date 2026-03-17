const CACHE_NAME = 'matematica-esrn-11-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ─── PWA Install Prompt — Versión Debugging ─────────────────
let deferredPrompt = null;
const installCard = document.getElementById('installCard');
const installBtn = document.getElementById('installBtn');
const installLater = document.getElementById('installLater');
const installClose = document.getElementById('installClose');

console.log('🔍 PWA Install: Card element:', installCard);
console.log('🔍 PWA Install: Button element:', installBtn);

// Función para mostrar la tarjeta manualmente (fallback)
function showInstallCard() {
  if (installCard) {
    console.log('✅ Mostrando tarjeta de instalación');
    installCard.hidden = false;
    // Forzar reflow
    void installCard.offsetWidth;
    installCard.classList.add('show');
    announce('Podés instalar esta aplicación para acceder sin navegador.');
    return true;
  } else {
    console.error('❌ No se encontró el elemento installCard');
    return false;
  }
}

// Función para ocultar la tarjeta
function hideInstallCard() {
  if (installCard) {
    console.log('❌ Ocultando tarjeta de instalación');
    installCard.classList.remove('show');
    setTimeout(() => { installCard.hidden = true; }, 400);
  }
}

// Escuchar evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('📲 Evento beforeinstallprompt disparado');
  e.preventDefault();
  deferredPrompt = e;
  
  // Mostrar tarjeta después de 3 segundos
  setTimeout(() => {
    console.log('⏰ Intentando mostrar tarjeta...');
    showInstallCard();
  }, 3000);
});

// Evento: app instalada
window.addEventListener('appinstalled', () => {
  console.log('✅ App instalada exitosamente');
  hideInstallCard();
  showToast('¡Matemática ESRN-11 instalada correctamente!');
  announce('Aplicación instalada. Ahora podés usarla sin conexión.');
});

// Botón Instalar
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    console.log('🔘 Click en botón Instalar');
    if (deferredPrompt) {
      console.log('✅ deferredPrompt disponible, mostrando prompt nativo');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('📊 Resultado:', outcome);
      
      if (outcome === 'accepted') {
        console.log('✅ Usuario aceptó instalar');
        announce('Instalación iniciada. La app aparecerá en tu pantalla de inicio.');
        showToast('¡App instalada! Disfrutá la experiencia nativa.');
      } else {
        console.log('❌ Usuario canceló la instalación');
        announce('Instalación cancelada. Podés instalarla después desde el menú del navegador.');
      }
      
      deferredPrompt = null;
      hideInstallCard();
    } else {
      console.warn('⚠️ No hay deferredPrompt disponible');
      showToast('La instalación no está disponible en este momento. Intentá desde el menú del navegador.');
    }
  });
} else {
  console.error('❌ No se encontró installBtn');
}

// Botón Después
if (installLater) {
  installLater.addEventListener('click', () => {
    console.log('⏭ Usuario eligió "Después"');
    hideInstallCard();
    announce('Podés instalar la app después desde el menú del navegador.');
    try { localStorage.setItem('installDismissed', 'true'); } catch(e) {}
  });
}

// Botón Cerrar
if (installClose) {
  installClose.addEventListener('click', () => {
    console.log('❌ Usuario cerró la tarjeta');
    hideInstallCard();
  });
}

// Verificar si ya está instalada
if ('matchMedia' in window) {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  console.log('📱 Modo standalone:', isStandalone);
  if (isStandalone && installCard) {
    console.log('✅ App ya está instalada, ocultando tarjeta');
    installCard.hidden = true;
  }
}

// Botón manual de instalación (fallback) - Agregar en toolbar
function createManualInstallButton() {
  // Crear botón en la toolbar de accesibilidad
  const toolbar = document.querySelector('.a11y-toolbar');
  if (toolbar) {
    const manualBtn = document.createElement('button');
    manualBtn.id = 'manual-install-btn';
    manualBtn.type = 'button';
    manualBtn.innerHTML = '📥 Instalar';
    manualBtn.title = 'Instalar aplicación';
    manualBtn.onclick = () => {
      console.log('🔘 Click en botón manual de instalación');
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        // Mostrar tarjeta si no hay deferredPrompt
        showInstallCard();
      }
    };
    toolbar.appendChild(manualBtn);
    console.log('✅ Botón manual de instalación agregado');
  }
}

// Agregar botón manual después de cargar el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createManualInstallButton);
} else {
  createManualInstallButton();
}

// Verificación de requisitos PWA
function checkPWARequirements() {
  console.log('🔍 Verificando requisitos PWA...');
  
  // HTTPS
  const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  console.log('🔒 HTTPS:', isSecure);
  
  // Service Worker
  const hasSW = 'serviceWorker' in navigator;
  console.log('👷 Service Worker disponible:', hasSW);
  
  // Manifest
  const hasManifest = !!document.querySelector('link[rel="manifest"]');
  console.log('📄 Manifest presente:', hasManifest);
  
  if (isSecure && hasSW && hasManifest) {
    console.log('✅ Todos los requisitos PWA cumplidos');
  } else {
    console.warn('⚠️ Faltan requisitos PWA. La instalación puede no funcionar.');
  }
}

// Ejecutar verificación
setTimeout(checkPWARequirements, 1000);

// Toast notification
function showToast(message) {
  console.log('🍞 Toast:', message);
  announce(message);
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 10000;
    background: var(--ink); color: var(--paper);
    border: 2px solid var(--gold); border-radius: 8px;
    padding: 12px 20px; font-family: var(--font-body);
    font-size: 0.9rem; box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  if (!document.getElementById('toast-keyframes')) {
    const style = document.createElement('style');
    style.id = 'toast-keyframes';
    style.textContent = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
    document.head.appendChild(style);
  }
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ─── Service Worker Registration ──────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('✅ SW registrado:', reg.scope);
      })
      .catch(err => {
        console.error('❌ SW error:', err);
      });
  });
}
