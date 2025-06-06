const CACHE_NAME = 'matematica-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Pacifico&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - devolver respuesta del cache
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Verificar que recibimos una respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANTE: Clonar la respuesta. Una respuesta es un stream
            // y como queremos que el navegador consuma la respuesta
            // así como el cache la consuma, necesitamos clonarla
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // Si falla la red y no está en cache, mostrar página offline
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Actualizar Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Manejo de sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Realizando sincronización en segundo plano');
    // Aquí podrías sincronizar datos guardados localmente
  }
});

// Notificaciones push (para futuras funcionalidades)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de Matemágica',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Matemágica', options)
  );
});

// Manejo de clic en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Notificación clickeada: ', event);
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});