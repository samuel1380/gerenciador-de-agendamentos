const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');

// GET ACTIVE PROMOTION (Public)
router.get('/active', (req, res) => {
    const db = req.db;
    // Get the most recent active promotion
    db.get(`SELECT * FROM promotions WHERE active = 1 ORDER BY created_at DESC LIMIT 1`, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || null);
    });
});

// GET ALL PROMOTIONS (Admin)
router.get('/', authenticateToken, isAdmin, (req, res) => {
    const db = req.db;
    db.all(`SELECT * FROM promotions ORDER BY created_at DESC`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// CREATE PROMOTION (Admin)
router.post('/', authenticateToken, isAdmin, (req, res) => {
    const { title, description } = req.body;
    const db = req.db;
    if (!title) return res.status(400).json({ error: 'Title required' });

    db.run(`INSERT INTO promotions (title, description) VALUES (?, ?)`, [title, description], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, title, description, active: 1 });
    });
});

// TOGGLE STATUS
router.put('/:id/toggle', authenticateToken, isAdmin, (req, res) => {
    const db = req.db;
    const { id } = req.params;

    db.get(`SELECT active FROM promotions WHERE id = ?`, [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Promotion not found' });

        const newStatus = row.active ? 0 : 1;
        db.run(`UPDATE promotions SET active = ? WHERE id = ?`, [newStatus, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Status updated', active: newStatus });
        });
    });
});

// DELETE
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
    const db = req.db;
    db.run(`DELETE FROM promotions WHERE id = ?`, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted' });
    });
});

module.exports = router;
