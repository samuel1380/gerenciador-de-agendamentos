self.addEventListener('install', (event) => {
    self.skipWaiting();
});

const CACHE_VERSION = 'v2-admin-notifications';
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
        } catch (e) {}
        await self.clients.claim();
    })());
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
