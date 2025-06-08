// Service Worker para Matemágica PWA
// 🔄 VERSIÓN ACTUALIZADA para limpiar errores acumulativos
const CACHE_NAME = 'matematica-pwa-v4.0'; // ⬅️ NUEVA VERSIÓN FORZADA
const CACHE_OLD_NAMES = ['matematica-pwa-v1.0', 'matematica-pwa-v2.0', 'matematica-pwa-v3.0']; // Incluir v3.0 para eliminar

const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/integrated-auth.js',
    '/auth-manager.js',
    '/supabase-config.js',
    '/public/styles.css',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// 🧹 LIMPIEZA AUTOMÁTICA durante instalación
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Instalando versión actualizada...');
    
    event.waitUntil(
        (async () => {
            // 1. Limpiar caches antiguos
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(async cacheName => {
                    if (CACHE_OLD_NAMES.includes(cacheName)) {
                        console.log(`🗑️ Eliminando cache antiguo: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
            
            // 2. Crear nuevo cache
            const cache = await caches.open(CACHE_NAME);
            console.log('📦 Service Worker: Cacheando archivos...');
            return cache.addAll(urlsToCache);
        })()
    );
    
    // Forzar activación inmediata
    self.skipWaiting();
});

// Interceptar peticiones de red con mejor manejo de errores
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - devolver respuesta del cache
        if (response) {
          console.log('📦 Servido desde cache:', event.request.url);
          return response;
        }

        // Si no está en cache, intentar cargar desde red
        return fetch(event.request).then(
          (response) => {
            // Verificar que recibimos una respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              console.warn('⚠️ Respuesta no válida para:', event.request.url);
              return response;
            }

            // Solo cachear recursos de nuestro dominio
            const requestUrl = new URL(event.request.url);
            if (requestUrl.origin === location.origin) {
              // Clonar la respuesta para el cache
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                  console.log('💾 Cacheado:', event.request.url);
                });
            }

            return response;
          }
        ).catch((error) => {
          console.error('❌ Error de red para:', event.request.url, error);
          
          // Fallbacks específicos para diferentes tipos de recursos
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          } else if (event.request.url.includes('/icons/')) {
            // Si falla un icono, devolver un icono por defecto
            return caches.match('/icons/icon-192.png');
          } else if (event.request.url.includes('favicon.ico')) {
            return caches.match('/favicon.ico');
          }
          
          // Para otros recursos, devolver respuesta vacía
          return new Response('', { status: 404 });
        });
      })
  );
});

// Actualizar Service Worker y limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activando...');
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activado correctamente');
      return self.clients.claim();
    })
  );
});

// Manejo de sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Realizando sincronización en segundo plano');
    event.waitUntil(syncData());
  }
});

// Función para sincronizar datos guardados localmente
async function syncData() {
  try {
    // Aquí podrías sincronizar ejercicios guardados, progreso, etc.
    console.log('📊 Sincronizando datos locales...');
    
    // Ejemplo: enviar datos de progreso a Supabase
    const savedProgress = localStorage.getItem('exerciseHistory');
    if (savedProgress) {
      // Lógica de sincronización aquí
      console.log('💾 Datos de progreso encontrados para sincronizar');
    }
    
  } catch (error) {
    console.error('❌ Error sincronizando datos:', error);
  }
}

// Notificaciones push (para futuras funcionalidades)
self.addEventListener('push', (event) => {
  console.log('🔔 Notificación push recibida');
  
  const options = {
    body: event.data ? event.data.text() : '¡Tiempo de practicar matemáticas! 🧮',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: '/'
    },
    actions: [
      {
        action: 'practice',
        title: '🎯 Practicar Ahora'
      },
      {
        action: 'later',
        title: '⏰ Más Tarde'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Matemágica - ¡Hora de Practicar!', options)
  );
});

// Manejo de clic en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notificación clickeada:', event.action);
  event.notification.close();

  if (event.action === 'practice') {
    event.waitUntil(
      clients.openWindow('/?action=practice')
    );
  } else if (event.action === 'later') {
    // Programar recordatorio para más tarde
    console.log('⏰ Recordatorio programado para más tarde');
  } else {
    // Click en el cuerpo de la notificación
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Manejo de errores del Service Worker
self.addEventListener('error', (event) => {
  console.error('❌ Error en Service Worker:', event.error);
});

// Manejo de errores no capturados
self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rechazada no manejada en SW:', event.reason);
});

console.log('🚀 Service Worker cargado correctamente - Matemágica PWA');