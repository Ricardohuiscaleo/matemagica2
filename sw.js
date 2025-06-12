// Service Worker para Matemágica PWA - VERSIÓN SEGURA
// 🔄 Optimizado para el servidor backend seguro
const CACHE_NAME = 'matematica-pwa-v6.0-secure';
const CACHE_OLD_NAMES = ['matematica-pwa-v1.0', 'matematica-pwa-v2.0', 'matematica-pwa-v3.0', 'matematica-pwa-v4.0', 'matematica-pwa-v5.0'];

const urlsToCache = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/js/auth.js',
    '/js/dashboard.js',
    '/js/dashboard-auth.js',
    '/js/pdf-generator.js',
    '/js/math-modules/adicion-sustraccion.js',
    '/js/math-modules/mathematics-navigation.js',
    '/curriculum-segundo-basico.js',
    '/gemini-ai.js',
    '/math-mode-system.js',
    '/styles.css',
    '/manifest.json',
    '/favicon.ico',
    '/icons/icon-72.png',
    '/icons/icon-96.png',
    '/icons/icon-128.png',
    '/icons/icon-144.png',
    '/icons/icon-152.png',
    '/icons/icon-192.png',
    '/icons/icon-384.png',
    '/icons/icon-512.png',
    // CDN resources con fallback
    'https://unpkg.com/@supabase/supabase-js@2',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// 🧹 Instalación con limpieza mejorada
self.addEventListener('install', event => {
    console.log('🔧 SW Seguro: Instalando versión 6.0...');
    
    event.waitUntil(
        (async () => {
            try {
                // Limpiar caches antiguos
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(async cacheName => {
                        if (CACHE_OLD_NAMES.includes(cacheName)) {
                            console.log(`🗑️ Eliminando cache: ${cacheName}`);
                            return caches.delete(cacheName);
                        }
                    })
                );
                
                // Crear nuevo cache con manejo de errores
                const cache = await caches.open(CACHE_NAME);
                console.log('📦 SW: Cacheando recursos esenciales...');
                
                // Cachear recursos críticos primero
                const criticalResources = [
                    '/',
                    '/index.html',
                    '/dashboard.html',
                    '/styles.css',
                    '/manifest.json',
                    '/favicon.ico'
                ];
                
                await cache.addAll(criticalResources);
                console.log('✅ Recursos críticos cacheados');
                
                // Cachear recursos opcionales con manejo de errores
                for (const url of urlsToCache) {
                    if (!criticalResources.includes(url)) {
                        try {
                            await cache.add(url);
                        } catch (error) {
                            console.warn(`⚠️ No se pudo cachear: ${url}`, error.message);
                        }
                    }
                }
                
            } catch (error) {
                console.error('❌ Error durante instalación SW:', error);
            }
        })()
    );
    
    self.skipWaiting();
});

// 🌐 Interceptor de peticiones con mejor manejo SSL/CSP
self.addEventListener('fetch', (event) => {
    // No interceptar peticiones a APIs externas problemáticas
    const url = new URL(event.request.url);
    
    // Lista de dominios que pueden causar problemas SSL
    const problematicDomains = [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'accounts.google.com'
    ];
    
    if (problematicDomains.some(domain => url.hostname.includes(domain))) {
        // Dejar que el navegador maneje estas peticiones directamente
        return;
    }
    
    event.respondWith(
        (async () => {
            try {
                // Intentar obtener del cache primero
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    console.log('📦 Cache hit:', url.pathname);
                    return cachedResponse;
                }
                
                // Si no está en cache, intentar red
                console.log('🌐 Fetching:', url.pathname);
                const networkResponse = await fetch(event.request);
                
                // Verificar respuesta válida
                if (!networkResponse || networkResponse.status !== 200) {
                    console.warn('⚠️ Respuesta no válida:', networkResponse?.status);
                    return networkResponse || new Response('', { status: 404 });
                }
                
                // Solo cachear recursos del mismo origen
                if (url.origin === location.origin) {
                    try {
                        const cache = await caches.open(CACHE_NAME);
                        await cache.put(event.request, networkResponse.clone());
                        console.log('💾 Cacheado:', url.pathname);
                    } catch (cacheError) {
                        console.warn('⚠️ Error cacheando:', cacheError.message);
                    }
                }
                
                return networkResponse;
                
            } catch (error) {
                console.error('❌ Fetch error:', error.message);
                
                // Fallbacks específicos
                if (event.request.destination === 'document') {
                    const indexCache = await caches.match('/index.html');
                    if (indexCache) return indexCache;
                }
                
                if (url.pathname.includes('/icons/')) {
                    const defaultIcon = await caches.match('/icons/icon-192.png');
                    if (defaultIcon) return defaultIcon;
                }
                
                if (url.pathname === '/favicon.ico') {
                    const favicon = await caches.match('/favicon.ico');
                    if (favicon) return favicon;
                    // Generar favicon simple en caso de emergencia
                    return new Response(
                        new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
                        { headers: { 'Content-Type': 'image/png' } }
                    );
                }
                
                // Para CSS/JS críticos, devolver respuesta mínima
                if (url.pathname.endsWith('.css')) {
                    return new Response('/* Fallback CSS */', {
                        headers: { 'Content-Type': 'text/css' }
                    });
                }
                
                if (url.pathname.endsWith('.js')) {
                    return new Response('console.log("Fallback JS loaded");', {
                        headers: { 'Content-Type': 'application/javascript' }
                    });
                }
                
                return new Response('Resource not available', { status: 404 });
            }
        })()
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