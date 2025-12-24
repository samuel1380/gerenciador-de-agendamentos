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

async function requestNotificationPermission() {
    const result = await Notification.requestPermission();
    if (result === 'granted') {
        const banners = document.querySelectorAll('.notif-permission-banner');
        banners.forEach(b => b.remove());

        document.body.style.paddingTop = '';

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

function openNotificationGuide() {
    const existingModal = document.getElementById('notifGuideOverlay');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'notifGuideOverlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.45)';
    overlay.style.zIndex = '10001';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '16px';

    const modal = document.createElement('div');
    modal.style.background = 'var(--bg-card)';
    modal.style.borderRadius = '20px';
    modal.style.padding = '20px 18px';
    modal.style.width = '100%';
    modal.style.maxWidth = '420px';
    modal.style.boxShadow = 'var(--shadow-lg)';
    modal.style.color = 'var(--text)';

    modal.innerHTML = `
        <h2 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Receber notificações e adicionar na tela inicial</h2>
        <p style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 1rem;">
            Siga os passos abaixo para instalar o app no seu celular e depois ativar as notificações.
        </p>
        <div style="font-size: 0.9rem; display: grid; gap: 0.5rem; margin-bottom: 1.25rem;">
            <div><strong>1.</strong> No navegador do celular, toque no botão de menu
                (ícone de compartilhar ou três pontinhos).</div>
            <div><strong>2.</strong> Escolha a opção <strong>"Adicionar à Tela Inicial"</strong>
                ou <strong>"Instalar app"</strong>.</div>
            <div><strong>3.</strong> Confirme para criar o atalho na tela inicial.</div>
            <div><strong>4.</strong> Depois toque em <strong>"Ativar notificações"</strong> abaixo
                para permitir os avisos de agendamento.</div>
        </div>
        <div style="display:flex; gap:0.75rem; margin-top:0.5rem;">
            <button id="notifGuideCloseBtn"
                style="flex:1; padding:0.75rem 1rem; border-radius:999px; border:1px solid var(--gray-200); background:transparent; color:var(--text-light); font-size:0.9rem;">
                Agora não
            </button>
            <button id="notifGuideActivateBtn"
                style="flex:1; padding:0.75rem 1rem; border-radius:999px; border:none; background:var(--primary); color:white; font-size:0.9rem; font-weight:600;">
                Ativar notificações
            </button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const closeBtn = document.getElementById('notifGuideCloseBtn');
    const activateBtn = document.getElementById('notifGuideActivateBtn');

    if (closeBtn) {
        closeBtn.onclick = () => {
            overlay.remove();
        };
    }

    if (activateBtn) {
        activateBtn.onclick = async () => {
            overlay.remove();
            await requestNotificationPermission();
        };
    }
}

function checkPermissionStatus() {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
        const existing = document.querySelector('.notif-permission-banner');
        if (!existing) {
            const banner = document.createElement('div');
            banner.className = 'notif-permission-banner fade-in-up';
            banner.style.position = 'fixed';
            banner.style.top = '16px';
            banner.style.left = '0';
            banner.style.right = '0';
            banner.style.margin = '0 auto';
            banner.style.transform = 'none';
            banner.style.background = 'var(--primary)';
            banner.style.color = 'white';
            banner.style.padding = '8px 14px';
            banner.style.borderRadius = '24px';
            banner.style.zIndex = '10000';
            banner.style.boxShadow = 'var(--shadow-lg)';
            banner.style.display = 'flex';
            banner.style.alignItems = 'center';
            banner.style.justifyContent = 'flex-start';
            banner.style.gap = '10px';
            banner.style.cursor = 'pointer';
            banner.style.width = 'calc(100% - 32px)';
            banner.style.maxWidth = '420px';
            banner.style.boxSizing = 'border-box';
            banner.style.flexWrap = 'wrap';

            if (window.innerWidth <= 360) {
                banner.style.padding = '6px 10px';
            }

            banner.innerHTML = `
                <span style="font-size: 1.1rem;">🔔</span>
                <span style="flex: 1; font-size: 0.8rem; font-weight: 500;">Ative as notificações para não perder agendamentos!</span>
                <span style="background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 12px; font-size: 0.75rem;">Ativar</span>
            `;

            banner.onclick = openNotificationGuide;
            document.body.appendChild(banner);

            requestAnimationFrame(() => {
                const h = banner.offsetHeight;
                if (h) {
                    document.body.style.paddingTop = (h + 16) + 'px';
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
