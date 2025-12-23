// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('SW Registered'))
        .catch(err => console.error('SW Error', err));
}

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Request Permission & Subscribe to Push
async function requestNotificationPermission() {
    const result = await Notification.requestPermission();
    if (result === 'granted') {
        const banners = document.querySelectorAll('.notif-permission-banner');
        banners.forEach(b => b.remove());

        // 1. Get Public Key and Subscribe
        try {
            const config = await api.get('/push/config');
            if (config.publicKey) {
                const reg = await navigator.serviceWorker.ready;
                const subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(config.publicKey)
                });

                // 2. Send subscription to server
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                await api.post('/push/subscribe', {
                    subscription: subscription,
                    userId: user.id
                });

                console.log('Push Subscribed!');
            }
        } catch (e) {
            console.error('Push Subscription Failed', e);
        }

        // Test Local Notification
        new Notification("Notificações Ativadas!", {
            body: "Você será avisado sobre seus agendamentos.",
            icon: "https://cdn-icons-png.flaticon.com/512/3652/3652191.png"
        });
    }
}

// Check if we need to show the permission banner
function checkPermissionStatus() {
    // Only show if supported and not yet granted/denied
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
        const existing = document.querySelector('.notif-permission-banner');
        if (!existing) {
            const banner = document.createElement('div');
            banner.className = 'notif-permission-banner fade-in-up';
            banner.style.position = 'fixed';
            banner.style.top = '20px';
            banner.style.left = '50%';
            banner.style.transform = 'translateX(-50%)';
            banner.style.background = 'var(--primary)';
            banner.style.color = 'white';
            banner.style.padding = '12px 20px';
            banner.style.borderRadius = '30px';
            banner.style.zIndex = '10000';
            banner.style.boxShadow = 'var(--shadow-lg)';
            banner.style.display = 'flex';
            banner.style.alignItems = 'center';
            banner.style.gap = '10px';
            banner.style.cursor = 'pointer';
            banner.style.width = '90%';
            banner.style.maxWidth = '350px';

            banner.innerHTML = `
                <span style="font-size: 1.2rem;">🔔</span>
                <span style="flex: 1; font-size: 0.9rem; font-weight: 500;">Ative as notificações para não perder agendamentos!</span>
                <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem;">Ativar</span>
            `;

            banner.onclick = requestNotificationPermission;
            document.body.appendChild(banner);
        }
    }
}

// Polling for notifications (and simulating push if permission granted)
let knownNotificationIds = new Set();
let isFirstLoad = true;

async function checkNotifications() {
    try {
        const notifs = await api.get('/notifications');
        const unreadList = notifs.filter(n => !n.read);

        // Sort by ID descending (newest first)
        unreadList.sort((a, b) => b.id - a.id);

        const unreadCount = unreadList.length;

        const badge = document.getElementById('notifBadge');
        if (badge) {
            badge.textContent = unreadCount;
            if (unreadCount > 0) badge.classList.remove('hidden');
            else badge.classList.add('hidden');
        }

        // Detect NEW notifications by ID
        const currentIds = new Set(unreadList.map(n => n.id));

        if (!isFirstLoad && Notification.permission === 'granted') {
            // Find IDs that are in currentIds but NOT in knownNotificationIds
            const newIds = [...currentIds].filter(id => !knownNotificationIds.has(id));

            // Trigger notification for each new message
            newIds.forEach(id => {
                const notif = unreadList.find(n => n.id === id);
                if (notif) {
                    // If on mobile/SW supported, try SW notification for better behavior
                    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                        navigator.serviceWorker.ready.then(reg => {
                            reg.showNotification('Nova Mensagem', {
                                body: notif.message,
                                icon: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
                                tag: 'notif-' + notif.id // ensure no duplicate stacking
                            });
                        });
                    } else {
                        new Notification('Nova Mensagem', {
                            body: notif.message,
                            icon: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png'
                        });
                    }
                }
            });
        }

        // Update known list
        knownNotificationIds = currentIds;
        isFirstLoad = false;

    } catch (e) {
        // Silent fail
        console.error(e);
    }
}

// Init
setInterval(checkNotifications, 5000);
checkNotifications();
setTimeout(checkPermissionStatus, 2000); // Ask after 2s
