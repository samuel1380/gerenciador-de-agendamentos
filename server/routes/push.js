const express = require('express');
const router = express.Router();
let webpush;

try {
    webpush = require('web-push');
} catch (e) {
    console.error('CRITICAL ERROR: web-push module not found. Push notifications will NOT work. Run "npm install web-push"');
}

// VAPID Keys (Generated for this project)
// Ensure these are valid P-256 Curve points. If unsure, generate new ones.
const publicVapidKey = 'BA-EIvcuYzvl5mo9KXiz1EsM42jojv711Xvr_gpEiWMtZgRye47W1B1P91BLDcch7maYzgqjAQIrXQAXElpqm5Q';
const privateVapidKey = 'GDUMMkXCKEq04U8plwJdw6vnmeTIJuRilJS5H1yB6E0';

if (webpush) {
    try {
        webpush.setVapidDetails(
            'mailto:admin@agendamentos.com', // Changed to look more real
            publicVapidKey,
            privateVapidKey
        );
        console.log('[PUSH] WebPush services configured.');
    } catch (err) {
        console.error('[PUSH] Invalid VAPID Keys:', err);
    }
}

// 1. Get Public Key
router.get('/config', (req, res) => {
    res.json({ publicKey: publicVapidKey });
});

// 2. Subscribe
router.post('/subscribe', (req, res) => {
    const { subscription, userId } = req.body;

    if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: 'Invalid subscription' });
    }

    const endpoint = subscription.endpoint;
    const keys = JSON.stringify(subscription.keys);

    // Using INSERT OR REPLACE to handle re-subscriptions
    req.db.run(`INSERT OR REPLACE INTO push_subscriptions (user_id, endpoint, \`keys\`) VALUES (?, ?, ?)`,
        [userId || 0, endpoint, keys],
        function (err) {
            if (err) {
                console.error('[PUSH] DB Error:', err);
                return res.status(500).json({ error: 'DB Error' });
            }

            console.log('[PUSH] Client subscribed:', userId);
            res.status(201).json({ message: 'Subscribed!' });

            // Send immediate test
            if (webpush) {
                const payload = JSON.stringify({
                    title: 'Notificações Ativas! 🚀',
                    body: 'Tudo pronto. Você receberá avisos aqui.'
                });
                webpush.sendNotification(subscription, payload)
                    .then(() => console.log('[PUSH] Welcome sent.'))
                    .catch(err => console.error('[PUSH] Send Error:', err));
            }
        }
    );
});

// Helper
router.sendPushToUser = (db, userId, title, message) => {
    if (!webpush) {
        console.warn('[PUSH] Cannot send: web-push missing');
        return;
    }

    console.log(`[PUSH] Sending to User ${userId}: ${title}`);

    db.all(`SELECT * FROM push_subscriptions WHERE user_id = ?`, [userId], (err, rows) => {
        if (err || !rows || rows.length === 0) {
            console.log('[PUSH] No subscriptions found for user', userId);
            return;
        }

        const payload = JSON.stringify({ title, body: message });

        rows.forEach(sub => {
            let subscription;
            try {
                subscription = {
                    endpoint: sub.endpoint,
                    keys: JSON.parse(sub.keys)
                };
            } catch (e) {
                return; // bad json
            }

            webpush.sendNotification(subscription, payload)
                .then(() => console.log('[PUSH] Sent successfully to endpointid', sub.id))
                .catch(err => {
                    console.error('[PUSH] Failed to send:', err.statusCode);
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        db.run(`DELETE FROM push_subscriptions WHERE id = ?`, [sub.id]);
                    }
                });
        });
    });
};

module.exports = router;
