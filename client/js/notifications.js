// Polling for notifications
async function checkNotifications() {
    try {
        const notifs = await api.get('/notifications');
        const unread = notifs.filter(n => !n.read).length;
        const badge = document.getElementById('notifBadge');
        if (badge) {
            badge.textContent = unread;
            if (unread > 0) badge.classList.remove('hidden');
            else badge.classList.add('hidden');
        }
    } catch (e) {
        // Silent fail
    }
}

// Check every 15 seconds
setInterval(checkNotifications, 5000);
checkNotifications();
