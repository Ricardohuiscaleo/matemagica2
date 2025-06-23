// Service Worker actualizado para evitar problemas de caché
const CACHE_NAME = 'matemagica-pwa-v' + Date.now(); // ✅ Versión dinámica para forzar actualización
const CACHE_VERSION = '2.1.0'; // Incrementar cuando haya cambios críticos

// ✅ RECURSOS CRÍTICOS QUE SIEMPRE DEBEN ACTUALIZARSE
const CRITICAL_RESOURCES = [
    '/',
    '/index.html',
    '/buscar-teachers.html',
    '/dashboard.html',
    '/js/auth.js',
    '/js/config-service.js', 
    '/js/skills-config.js',
    '/js/skills-service.js',
    '/test-sincronizacion.html'
];

// ✅ RECURSOS ESTÁTICOS QUE PUEDEN CACHEARSE
const STATIC_RESOURCES = [
    '/styles.css',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// ✅ INSTALACIÓN: Cachear solo recursos estáticos
self.addEventListener('install', event => {
    console.log('🔧 SW: Instalando nueva versión', CACHE_NAME);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 SW: Cacheando recursos estáticos');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('✅ SW: Recursos estáticos cacheados');
                return self.skipWaiting(); // Activar inmediatamente
            })
    );
});

// ✅ ACTIVACIÓN: Limpiar cachés antiguos
self.addEventListener('activate', event => {
    console.log('🚀 SW: Activando nueva versión');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                const deletePromises = cacheNames
                    .filter(cacheName => {
                        // Eliminar cachés que no sean la versión actual
                        return cacheName.startsWith('matemagica-pwa-v') && cacheName !== CACHE_NAME;
                    })
                    .map(cacheName => {
                        console.log('🗑️ SW: Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    });
                
                return Promise.all(deletePromises);
            })
            .then(() => {
                console.log('✅ SW: Cachés antiguos eliminados');
                return self.clients.claim(); // Tomar control inmediatamente
            })
    );
});

// ✅ FETCH: Estrategia Network-First para recursos críticos
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    
    // Solo manejar requests del mismo origen
    if (requestUrl.origin !== location.origin) {
        return;
    }
    
    // Estrategia para recursos críticos: SIEMPRE desde red primero
    const isCritical = CRITICAL_RESOURCES.some(resource => 
        requestUrl.pathname === resource || requestUrl.pathname.endsWith(resource)
    );
    
    if (isCritical) {
        event.respondWith(networkFirstStrategy(event.request));
    } else {
        event.respondWith(cacheFirstStrategy(event.request));
    }
});

// ✅ ESTRATEGIA NETWORK-FIRST: Para recursos críticos
async function networkFirstStrategy(request) {
    try {
        console.log('🌐 SW: Network-first para:', request.url);
        
        // Intentar obtener desde la red primero
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Si es exitoso, actualizar caché
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            console.log('✅ SW: Actualizado en caché:', request.url);
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('⚠️ SW: Red falló, intentando caché:', request.url);
        
        // Si la red falla, intentar caché
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('📦 SW: Servido desde caché:', request.url);
            return cachedResponse;
        }
        
        // Si no hay caché, devolver error básico
        return new Response('Recurso no disponible offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// ✅ ESTRATEGIA CACHE-FIRST: Para recursos estáticos
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        console.log('📦 SW: Cache-first servido:', request.url);
        return cachedResponse;
    }
    
    try {
        console.log('🌐 SW: No en caché, obteniendo de red:', request.url);
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('❌ SW: Error en cache-first:', request.url, error);
        return new Response('Recurso no disponible', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

// ✅ MENSAJE: Manejar mensajes del cliente
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('🧹 SW: Recibida solicitud de limpiar caché');
        
        event.waitUntil(
            caches.keys()
                .then(cacheNames => {
                    return Promise.all(
                        cacheNames.map(cacheName => {
                            console.log('🗑️ SW: Eliminando caché:', cacheName);
                            return caches.delete(cacheName);
                        })
                    );
                })
                .then(() => {
                    console.log('✅ SW: Todos los cachés eliminados');
                    event.ports[0].postMessage({ success: true });
                })
        );
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ 
            version: CACHE_VERSION,
            cacheName: CACHE_NAME
        });
    }
});

console.log('🚀 Service Worker cargado - Versión:', CACHE_VERSION);