const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const pushRouter = require('./push');

router.get('/', authenticateToken, (req, res) => {
    const db = req.db;
    db.all(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/mark-read', authenticateToken, (req, res) => {
    const db = req.db;
    db.run(`UPDATE notifications SET read = 1 WHERE user_id = ?`, [req.user.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ADMIN: SEND NOTIFICATION
router.post('/send', authenticateToken, isAdmin, (req, res) => {
    const { target, email, title, message } = req.body; // target: 'all' | 'email'
    const db = req.db;

    if (target === 'all') {
        db.all(`SELECT id FROM users`, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            const stmt = db.prepare(`INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`);
            rows.forEach(user => {
                stmt.run(user.id, title, message);
                if (pushRouter && typeof pushRouter.sendPushToUser === 'function') {
                    pushRouter.sendPushToUser(db, user.id, title, message);
                }
            });
            stmt.finalize();
            res.json({ message: `Sent to ${rows.length} users` });
        });
    } else if (target === 'email') {
        db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, user) => {
            if (err || !user) return res.status(404).json({ error: 'User not found' });

            db.run(`INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
                [user.id, title, message],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    if (pushRouter && typeof pushRouter.sendPushToUser === 'function') {
                        pushRouter.sendPushToUser(db, user.id, title, message, './notifications.html');
                    }
                    res.json({ message: 'Sent to user' });
                }
            );
        });
    } else {
        res.status(400).json({ error: 'Invalid target' });
    }
});

module.exports = router;
