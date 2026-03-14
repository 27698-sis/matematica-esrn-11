// Service Worker para Matemática ESRN N°11
// Versión del caché - incrementar cuando hay actualizaciones
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `matematica-esrn11-${CACHE_VERSION}`;

// Recursos críticos para cachear inmediatamente
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Recursos que se cachean a medida que se usan
const RUNTIME_CACHE = 'matematica-runtime';

// ============================================================
// INSTALACIÓN - Cachear recursos críticos
// ============================================================
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker versión', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando recursos críticos');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Recursos críticos cacheados');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch((error) => {
        console.error('[SW] Error al cachear recursos:', error);
      })
  );
});

// ============================================================
// ACTIVACIÓN - Limpiar cachés antiguos
// ============================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker versión', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Eliminando caché antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activado');
        return self.clients.claim(); // Tomar control inmediato
      })
  );
});

// ============================================================
// FETCH - Estrategia Cache First (ideal para app offline)
// ============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo cachear recursos del mismo origen
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] Sirviendo desde caché:', request.url);
          return cachedResponse;
        }
        
        // Si no está en caché, hacer fetch y cachear
        console.log('[SW] Descargando y cacheando:', request.url);
        return fetch(request)
          .then((response) => {
            // No cachear respuestas inválidas
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            
            // Clonar la respuesta porque es un stream de un solo uso
            const responseToCache = response.clone();
            
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('[SW] Error al hacer fetch:', error);
            
            // Retornar página offline si existe
            return caches.match('./offline.html')
              .then((offlineResponse) => {
                return offlineResponse || new Response(
                  'Sin conexión. Esta aplicación necesita conexión para cargar nuevos recursos.',
                  { 
                    status: 503,
                    statusText: 'Sin conexión',
                    headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
                  }
                );
              });
          });
      })
  );
});

// ============================================================
// MENSAJES - Comunicación con la app
// ============================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Mensaje recibido: SKIP_WAITING');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    console.log('[SW] Cacheando URLs adicionales:', event.data.urls);
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});

// ============================================================
// SYNC - Sincronización en segundo plano (opcional)
// ============================================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('[SW] Sincronización en segundo plano');
    event.waitUntil(
      // Aquí podrías sincronizar progreso del estudiante, etc.
      Promise.resolve()
    );
  }
});

console.log('[SW] Service Worker cargado - versión', CACHE_VERSION);

