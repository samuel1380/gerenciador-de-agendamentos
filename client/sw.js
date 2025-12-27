self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push Received.');
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        console.error('[Service Worker] Error parsing push data', e);
        data = { title: 'Nova Notificação', body: event.data ? event.data.text() : 'Você tem uma nova mensagem.' };
    }

    const title = data.title || 'Nova Notificação';
    const options = {
        body: data.body || 'Você tem uma nova mensagem.',
        icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || './notifications.html',
            id: data.id
        },
        tag: data.tag || 'general-notification',
        renotify: true
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
            .then(async () => {
                console.log('[Service Worker] Notification shown:', title);
                
                // Get subscription endpoint safely
                const sub = await self.registration.pushManager.getSubscription();
                const endpoint = sub ? sub.endpoint : 'unknown';

                // Track delivery
                return fetch('/api/push/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: 'delivered',
                        subscriptionEndpoint: endpoint,
                        notificationId: data.id || 'unknown',
                        timestamp: new Date().toISOString()
                    })
                }).catch(() => {}); // Ignore tracking errors
            })
            .catch(err => {
                console.error('[Service Worker] Error showing notification:', err);
            })
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification click Received.');
    event.notification.close();

    const targetUrl = event.notification.data.url || './notifications.html';
    const notificationId = event.notification.data.id || 'unknown';

    // Track click
    const trackClick = async () => {
        try {
            const sub = await self.registration.pushManager.getSubscription();
            const endpoint = sub ? sub.endpoint : 'unknown';

            await fetch('/api/push/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'clicked',
                    subscriptionEndpoint: endpoint,
                    notificationId: notificationId,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (e) {
            console.error('[Service Worker] Tracking click failed', e);
        }
    };

    const navigate = async () => {
        const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of clientList) {
            if (client.url.includes(targetUrl) && 'focus' in client) {
                return client.focus();
            }
        }
        if (clients.openWindow) {
            return clients.openWindow(targetUrl);
        }
    };

    event.waitUntil(
        Promise.all([
            trackClick(),
            navigate()
        ])
    );
});
