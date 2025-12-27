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

function isIos() {
    const ua = window.navigator.userAgent || '';
    return /iphone|ipad|ipod/i.test(ua);
}

function isStandalone() {
    const mm = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const iosStandalone = window.navigator.standalone === true;
    return mm || iosStandalone;
}

function showInstallBannerIfNeeded() {
    if (!isIos()) return;
    if (isStandalone()) return;
    const existing = document.querySelector('.install-pwa-banner');
    if (existing) return;

    const banner = document.createElement('div');
    banner.className = 'install-pwa-banner fade-in-up';
    banner.style.position = 'fixed';
    banner.style.top = '16px';
    banner.style.left = '16px';
    banner.style.right = '16px';
    banner.style.background = 'var(--primary)';
    banner.style.color = 'white';
    banner.style.padding = '12px 16px';
    banner.style.borderRadius = '16px';
    banner.style.zIndex = '10000';
    banner.style.boxShadow = 'var(--shadow-lg)';
    banner.style.display = 'flex';
    banner.style.alignItems = 'flex-start';
    banner.style.gap = '10px';
    banner.style.cursor = 'pointer';
    banner.style.boxSizing = 'border-box';
    banner.style.maxWidth = '480px';
    banner.style.margin = '0 auto';
    banner.style.right = '16px';
    banner.style.left = '16px';
    banner.style.flexWrap = 'wrap';

    banner.innerHTML = `
        <span style="font-size: 1.2rem;">📱</span>
        <span style="flex: 1; font-size: 0.9rem; font-weight: 500;">
            Adicione o app à tela inicial: toque em compartilhar e depois "Tela de Início".
        </span>
    `;

    banner.onclick = function () {
        banner.remove();
        const header = document.querySelector('.home-header');
        if (header) {
            header.style.marginTop = '';
        }
    };
    document.body.appendChild(banner);
    requestAnimationFrame(() => {
        const header = document.querySelector('.home-header');
        if (header) {
            const h = banner.offsetHeight || 0;
            header.style.marginTop = (h + 16) + 'px';
        }
    });
}

function showNotificationBannerIfNeeded() {
    if (!('Notification' in window)) return;

    const standalone = isStandalone();
    const ios = isIos();

    if (ios && !standalone) {
        showInstallBannerIfNeeded();
        return;
    }

    if (Notification.permission === 'default') {
            const existing = document.querySelector('.notif-permission-banner');
            if (!existing) {
                const banner = document.createElement('div');
                banner.className = 'notif-permission-banner fade-in-up';
                banner.style.position = 'fixed';
                banner.style.top = '16px';
                banner.style.left = '16px';
                banner.style.right = '16px';
            banner.style.background = 'var(--primary)';
            banner.style.color = 'white';
            banner.style.padding = '12px 16px';
            banner.style.borderRadius = '16px';
            banner.style.zIndex = '10000';
            banner.style.boxShadow = 'var(--shadow-lg)';
            banner.style.display = 'flex';
            banner.style.alignItems = 'center';
            banner.style.gap = '10px';
            banner.style.cursor = 'pointer';
            banner.style.boxSizing = 'border-box';
            banner.style.maxWidth = '480px';
            banner.style.margin = '0 auto';
            banner.style.flexWrap = 'wrap';

            banner.innerHTML = `
                <span style="font-size: 1.2rem;">🔔</span>
                <span style="flex: 1; min-width: 0; font-size: 0.9rem; font-weight: 500; line-height: 1.4;">
                    Ative as notificações para não perder agendamentos!
                </span>
                <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 999px; font-size: 0.8rem; white-space: nowrap;">
                    Ativar
                </span>
            `;

            banner.onclick = () => {
                requestNotificationPermission();
                const header = document.querySelector('.home-header');
                if (header) {
                    header.style.marginTop = '';
                }
            };
            document.body.appendChild(banner);
            requestAnimationFrame(() => {
                const header = document.querySelector('.home-header');
                if (header) {
                    const h = banner.offsetHeight || 0;
                    header.style.marginTop = (h + 16) + 'px';
                }
            });
        }
    }
}

// Polling for notifications (and simulating push if permission granted)
let knownNotificationIds = new Set();
let isFirstLoad = true;

async function checkNotifications() {
    try {
        const notifs = await api.get('/notifications');

        const seenMaxIdStr = localStorage.getItem('notificationsSeenMaxId');
        const seenMaxId = seenMaxIdStr ? parseInt(seenMaxIdStr, 10) || 0 : 0;

        const unreadList = notifs
            .filter(n => {
                const id = typeof n.id === 'number' ? n.id : parseInt(n.id, 10) || 0;
                const isUnreadServer = !n.read;
                if (!isUnreadServer) return false;
                return id > seenMaxId;
            })
            .sort((a, b) => b.id - a.id);

        const unreadCount = unreadList.length;

        const badge = document.getElementById('notifBadge');
        if (badge) {
            badge.textContent = unreadCount;
            if (unreadCount > 0) badge.classList.remove('hidden');
            else badge.classList.add('hidden');
        }

        localStorage.setItem('notificationsBadgeCount', String(unreadCount));

        const maxId = notifs.reduce((max, n) => {
            const id = typeof n.id === 'number' ? n.id : parseInt(n.id, 10) || 0;
            return id > max ? id : max;
        }, 0);
        localStorage.setItem('notificationsLastKnownMaxId', String(maxId));

        const currentIds = new Set(unreadList.map(n => n.id));

        if (!isFirstLoad && Notification.permission === 'granted') {
            const newIds = [...currentIds].filter(id => !knownNotificationIds.has(id));

            newIds.forEach(id => {
                const notif = unreadList.find(n => n.id === id);
                if (notif) {
                    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                        navigator.serviceWorker.ready.then(reg => {
                            reg.showNotification('Nova Mensagem', {
                                body: notif.message,
                                icon: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
                                tag: 'notif-' + notif.id
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

        knownNotificationIds = currentIds;
        isFirstLoad = false;

        const needsSync = localStorage.getItem('notificationsNeedsSync');
        if (needsSync === '1') {
            try {
                await api.post('/notifications/mark-read', {});
                localStorage.removeItem('notificationsNeedsSync');
            } catch (e) {
            }
        }

    } catch (e) {
        console.error(e);
        const badge = document.getElementById('notifBadge');
        if (badge) {
            const stored = localStorage.getItem('notificationsBadgeCount');
            if (stored !== null) {
                const count = parseInt(stored, 10) || 0;
                badge.textContent = count;
                if (count > 0) badge.classList.remove('hidden');
                else badge.classList.add('hidden');
            }
        }
    }
}

// Init
setInterval(checkNotifications, 5000);
checkNotifications();

document.addEventListener('DOMContentLoaded', () => {
    const badge = document.getElementById('notifBadge');
    if (badge) {
        const stored = localStorage.getItem('notificationsBadgeCount');
        if (stored !== null) {
            const count = parseInt(stored, 10) || 0;
            badge.textContent = count;
            if (count > 0) badge.classList.remove('hidden');
            else badge.classList.add('hidden');
        }
    }

    const notifLink = document.getElementById('notificationsLink');
    if (notifLink) {
        notifLink.addEventListener('click', () => {
            const lastKnownStr = localStorage.getItem('notificationsLastKnownMaxId');
            if (lastKnownStr) {
                localStorage.setItem('notificationsSeenMaxId', lastKnownStr);
            }
            localStorage.setItem('notificationsBadgeCount', '0');

            const badgeEl = document.getElementById('notifBadge');
            if (badgeEl) {
                badgeEl.textContent = '0';
                badgeEl.classList.add('hidden');
            }

            api.post('/notifications/mark-read', {}).then(() => {
                localStorage.removeItem('notificationsNeedsSync');
            }).catch(() => {
                localStorage.setItem('notificationsNeedsSync', '1');
            });
        });
    }
});
setTimeout(showNotificationBannerIfNeeded, 2000);
