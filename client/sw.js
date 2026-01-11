self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open('v3-performance').then((cache) => {
            return cache.addAll([
                './',
                'index.html',
                'home.html',
                'schedule.html',
                'my-appointment.html',
                'services.html',
                'profile.html',
                'notifications.html',
                'quiz.html',
                'manifest.json',
                'css/styles.css',
                'js/theme.js',
                'js/api.js',
                'js/notifications.js',
                'js/toast.js',
                'js/pages/my-appointment.js',
                'js/pages/profile.js',
                'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
                'https://unpkg.com/@phosphor-icons/web'
            ]);
        })
    );
});

const CACHE_VERSION = 'v3-performance';
const CACHE_WHITELIST = [CACHE_VERSION];

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        try {
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter(k => !CACHE_WHITELIST.includes(k))
                    .map(k => caches.delete(k))
            );
        } catch (e) { }
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    // API requests: Network only
    if (event.request.url.includes('/api/')) {
        return;
    }

    // Chrome Extensions / non-http schemes
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Strategy: Stale-While-Revalidate for HTML, Cache First for others
            const isHtml = event.request.destination === 'document' || event.request.url.endsWith('.html');

            if (isHtml) {
                // Return cached if available, but always fetch updates
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_VERSION).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // If network fails and no cache, maybe show offline page?
                    // For now, if no cache, fetch fails.
                });

                return cachedResponse || fetchPromise;
            } else {
                // Cache First for assets
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_VERSION).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return networkResponse;
                });
            }
        })
    );
});

self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Nova Notificação';
    const options = {
        body: data.body || 'Você tem uma nova mensagem.',
        icon: data.icon || '/client/icons/icon-192.png',
        badge: data.badge || '/client/icons/icon-96.png',
        tag: data.tag || 'agendamentos-general',
        renotify: typeof data.renotify === 'boolean' ? data.renotify : true,
        data: data.data || {}
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('./notifications.html');
        })
    );
});
