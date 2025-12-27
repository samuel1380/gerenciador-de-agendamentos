const express = require('express');
const router = express.Router();
const webpush = require('web-push');

// VAPID Keys (Generated for this project - Replace in production!)
const publicVapidKey = 'BJ5IxJBWdeqFDJTvrZ4wNRu7uyu2lhW1zIe15vic9s7PdfDAKVqMst8yW55YWJoLez1izb_I0Pkvo8jmwC3S_u0';
const privateVapidKey = '3KmaqCP5g3cG-8S495X37_q0pW_T72P55e54M1d9_i0';

// Setup web-push
try {
    webpush.setVapidDetails(
        'mailto:admin@example.com',
        publicVapidKey,
        privateVapidKey
    );
} catch (e) {
    console.error('[PUSH] web-push not installed. Run: npm install web-push');
}

// 1. Get Public Key to send to client
router.get('/config', (req, res) => {
    res.json({ publicKey: publicVapidKey });
});

// 2. Subscribe (Client sends subscription object)
router.post('/subscribe', (req, res) => {
    const { subscription, userId } = req.body;

    if (!subscription || !subscription.endpoint) {
        console.error('[PUSH] Invalid subscription received:', req.body);
        return res.status(400).json({ error: 'Invalid subscription' });
    }

    const endpoint = subscription.endpoint;
    const keys = JSON.stringify(subscription.keys);

    console.log(`[PUSH] New subscription request for user ${userId}: ${endpoint}`);

    // Upsert logic: Update user_id and keys if endpoint already exists
    req.db.get(`SELECT id FROM push_subscriptions WHERE endpoint = ?`, [endpoint], (err, row) => {
        if (err) {
            console.error('[PUSH] DB Error checking subscription:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (row) {
            // Update
            req.db.run(`UPDATE push_subscriptions SET user_id = ?, keys = ? WHERE endpoint = ?`,
                [userId || 0, keys, endpoint],
                (err) => {
                    if (err) console.error('[PUSH] Update error:', err);
                    else console.log('[PUSH] Updated existing subscription:', endpoint);
                    res.status(200).json({ message: 'Updated!' });
                }
            );
        } else {
            // Insert
            req.db.run(`INSERT INTO push_subscriptions (user_id, endpoint, keys) VALUES (?, ?, ?)`,
                [userId || 0, endpoint, keys],
                function (err) {
                    if (err) {
                        console.error('[PUSH] Insert error:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    console.log('[PUSH] Created new subscription:', endpoint);
                    res.status(201).json({ message: 'Subscribed!' });

                    // Send welcome push
                    const payload = JSON.stringify({ 
                        title: 'Notificações Ativas', 
                        body: 'Agora você receberá avisos mesmo com o app fechado!',
                        tag: 'welcome-notification'
                    });
                    webpush.sendNotification(subscription, payload).catch(err => {
                        console.error('[PUSH] Welcome notification failed:', err.statusCode);
                    });
                }
            );
        }
    });
});

// Helper to send push to a user (to be used by other routes)
router.sendPushToUser = (db, userId, title, message, url = './notifications.html') => {
    if (!webpush.sendNotification) {
        console.warn('[PUSH] web-push not configured, skipping push.');
        return;
    }

    console.log(`[PUSH] Sending push to user ${userId}: "${title}"`);

    db.all(`SELECT * FROM push_subscriptions WHERE user_id = ?`, [userId], (err, rows) => {
        if (err) {
            console.error('[PUSH] Error fetching subscriptions for user:', userId, err);
            return;
        }

        if (!rows || rows.length === 0) {
            console.log(`[PUSH] No subscriptions found for user ${userId}`);
            return;
        }

        const payload = JSON.stringify({ 
            title, 
            body: message,
            url,
            tag: 'appointment-update-' + Date.now()
        });

        rows.forEach(sub => {
            const subscription = {
                endpoint: sub.endpoint,
                keys: JSON.parse(sub.keys)
            };

            webpush.sendNotification(subscription, payload).catch(err => {
                console.warn(`[PUSH] Notification failed for ${sub.endpoint}, status: ${err.statusCode}`);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    console.log(`[PUSH] Removing expired/invalid subscription: ${sub.id}`);
                    db.run(`DELETE FROM push_subscriptions WHERE id = ?`, [sub.id]);
                }
            });
        });
    });
};

// 3. Track Notification Events (Analytics)
router.post('/track', (req, res) => {
    const { event, subscriptionEndpoint, notificationId, timestamp } = req.body;
    console.log(`[PUSH-TRACK] ${event.toUpperCase()} | Endpoint: ${subscriptionEndpoint.slice(-20)} | ID: ${notificationId} | Time: ${timestamp}`);
    
    // Log to DB for later analysis
    req.db.run(`INSERT INTO audit_logs (action, payload, user_id) VALUES (?, ?, ?)`,
        ['push_' + event, JSON.stringify({ endpoint: subscriptionEndpoint, notificationId, timestamp }), 0],
        (err) => {
            if (err) console.error('[PUSH-TRACK] DB Error:', err);
            res.json({ success: true });
        }
    );
});

module.exports = router;
