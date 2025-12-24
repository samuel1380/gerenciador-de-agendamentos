const express = require('express');
const router = express.Router();
let webpush;

try {
    webpush = require('web-push');
} catch (e) {
    console.error('[PUSH] web-push module not found. Push notifications disabled.');
    webpush = {
        setVapidDetails: () => { },
        sendNotification: () => Promise.resolve()
    };
}

// VAPID Keys (Generated for this project - Replace in production!)
const publicVapidKey = 'BJ5IxJBWdeqFDJTvrZ4wNRu7uyu2lhW1zIe15vic9s7PdfDAKVqMst8yW55YWJoLez1izb_I0Pkvo8jmwC3S_u0';
const privateVapidKey = '3KmaqCP5g3cG-8S495X37_q0pW_T72P55e54M1d9_i0';

try {
    webpush.setVapidDetails(
        'mailto:admin@example.com',
        publicVapidKey,
        privateVapidKey
    );
} catch (e) {
    console.error('[PUSH] Failed to configure web-push. Push notifications disabled.');
}

// 1. Get Public Key to send to client
router.get('/config', (req, res) => {
    res.json({ publicKey: publicVapidKey });
});

// 2. Subscribe (Client sends subscription object)
router.post('/subscribe', (req, res) => {
    const { subscription, userId } = req.body;

    if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: 'Invalid subscription' });
    }

    const endpoint = subscription.endpoint;
    const keys = JSON.stringify(subscription.keys);

    // Save to DB (Update if exists for this endpoint, or insert)
    req.db.run(`INSERT INTO push_subscriptions (user_id, endpoint, keys) VALUES (?, ?, ?)`,
        [userId || 0, endpoint, keys],
        function (err) {
            if (err) {
                // If endpoint exists, maybe update user_id? For now just ignore unique constraints if we had them
                // But without unique constraint on endpoint, we might duplicate. Ideally clean up.
                // Simple sqlite: just insert. Real app: upsert.
                console.log('Subscribed:', endpoint);
            }
            res.status(201).json({ message: 'Subscribed!' });

            // Send immediate welcome notification to test
            const payload = JSON.stringify({ title: 'Notificações Ativas', body: 'Agora você receberá avisos mesmo com o app fechado!' });
            webpush.sendNotification(subscription, payload).catch(err => console.error(err));
        }
    );
});

// Helper to send push to a user (to be used by other routes)
router.sendPushToUser = (db, userId, title, message) => {
    if (!webpush.sendNotification) return;

    db.all(`SELECT * FROM push_subscriptions WHERE user_id = ?`, [userId], (err, rows) => {
        if (err || !rows) return;

        const payload = JSON.stringify({ title, body: message });

        rows.forEach(sub => {
            const subscription = {
                endpoint: sub.endpoint,
                keys: JSON.parse(sub.keys)
            };

            webpush.sendNotification(subscription, payload).catch(err => {
                // Likely invalid/expired
                db.run(`DELETE FROM push_subscriptions WHERE id = ?`, [sub.id]);
            });
        });
    });
};

module.exports = router;
