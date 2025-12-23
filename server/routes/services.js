const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');

// LIST SERVICES (Public)
router.get('/', (req, res) => {
    const db = req.db;
    db.all(`SELECT * FROM services WHERE active = 1`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ADMIN: CREATE SERVICE
router.post('/', authenticateToken, isAdmin, (req, res) => {
    const { title, price, duration_minutes, image, description } = req.body;
    const db = req.db;

    db.run(`INSERT INTO services (title, price, duration_minutes, image, description) VALUES (?, ?, ?, ?, ?)`,
        [title, price, duration_minutes, image, description],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'Service created' });
        }
    );
});

// ADMIN: DELETE SERVICE
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    const db = req.db;

    // Soft delete or hard delete? Let's do hard delete for simplicity or set active=0
    // User asked to "remove", usually implies gone or hidden.
    // Let's set active = 0 to preserve history, or delete if no appointments.
    // Ideally soft delete:
    db.run(`UPDATE services SET active = 0 WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Service removed' });
    });
});

// Public Settings Endpoint for client
router.get('/config', (req, res) => {
    const db = req.db;
    db.all(`SELECT key, value FROM settings WHERE key IN ('xp_per_level', 'quiz_xp_reward', 'client_theme')`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const config = {};
        rows.forEach(r => {
            if (r.key === 'xp_per_level' || r.key === 'quiz_xp_reward') {
                config[r.key] = parseInt(r.value);
            } else {
                config[r.key] = r.value;
            }
        });
        if (!config.client_theme) config.client_theme = 'nails';
        res.json(config);
    });
});

module.exports = router;
