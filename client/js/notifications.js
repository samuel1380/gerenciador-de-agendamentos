// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('SW Registered'))
        .catch(err => console.error('SW Error', err));
}

// Request Permission Function (Must be triggered by user gesture)
async function requestNotificationPermission() {
    const result = await Notification.requestPermission();
    if (result === 'granted') {
        // Hide the banner if it exists
        const banners = document.querySelectorAll('.notif-permission-banner');
        banners.forEach(b => b.remove());

        // Try to trigger a test notification
        new Notification("Notificações Ativadas!", {
            body: "Você será avisado sobre seus agendamentos.",
            icon: "https://cdn-icons-png.flaticon.com/512/3652/3652191.png"
        });

        // Here we would normally subscribe to pushManager and send VAPID to server
        // navigator.serviceWorker.ready.then(reg => {
        //     reg.pushManager.subscribe(...)
        // })
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
let lastCount = -1;

async function checkNotifications() {
    try {
        const notifs = await api.get('/notifications');
        const unreadList = notifs.filter(n => !n.read);
        const unread = unreadList.length;

        const badge = document.getElementById('notifBadge');
        if (badge) {
            badge.textContent = unread;
            if (unread > 0) badge.classList.remove('hidden');
            else badge.classList.add('hidden');
        }

        // TRIGGER LOCAL NOTIFICATION IF NEW UNREAD DETECTED
        // On first load, lastCount is -1, so we don't spam.
        // We only notify if count Increased
        if (lastCount !== -1 && unread > lastCount && Notification.permission === 'granted') {
            const latest = unreadList[0]; // Assuming newest first
            if (latest) {
                // If on mobile/SW supported, try SW notification, else normal
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.showNotification('Novo Aviso', {
                            body: latest.message,
                            icon: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
                            tag: 'notif-' + Date.now() // unique tag
                        });
                    });
                } else {
                    new Notification('Novo Aviso', {
                        body: latest.message,
                        icon: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png'
                    });
                }
            }
        }

        lastCount = unread;

    } catch (e) {
        // Silent fail
    }
}

// Init
setInterval(checkNotifications, 5000);
checkNotifications();
setTimeout(checkPermissionStatus, 2000); // Ask after 2s
