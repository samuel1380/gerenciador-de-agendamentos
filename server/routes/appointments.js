const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// LIST MY APPOINTMENTS
router.get('/me', authenticateToken, (req, res) => {
    const db = req.db;
    db.all(`SELECT a.*, s.title as service_title FROM appointments a 
            JOIN services s ON a.service_id = s.id 
            WHERE a.user_id = ? ORDER BY a.date DESC, a.time DESC`, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// CREATE APPOINTMENT
router.post('/', authenticateToken, (req, res) => {
    const { service_id, date, time, note } = req.body;
    const db = req.db;
    const userId = req.user.id;

    if (!service_id || !date || !time) return res.status(400).json({ error: "Missing fields" });

    // 1. Check for active appointment (pending or accepted)
    db.get(`SELECT count(*) as count FROM appointments WHERE user_id = ? AND status IN ('pending', 'accepted')`, [userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row.count > 0) {
            return res.status(403).json({ error: 'Você já possui um agendamento ativo.' });
        }

        // 2. Check availability
        db.get(`SELECT count(*) as count FROM appointments WHERE date = ? AND time = ? AND status IN ('accepted')`, [date, time], (err, busy) => {
            if (busy.count > 0) {
                return res.status(409).json({ error: 'Horário indisponível.' });
            }

            // 3. Create
            db.run(`INSERT INTO appointments (user_id, service_id, date, time, status, note) VALUES (?, ?, ?, ?, 'pending', ?)`,
                [userId, service_id, date, time, note],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    const auditPayload = JSON.stringify({ service_id, date, time });

                    // Audit & Notification
                    db.run(`INSERT INTO audit_logs (action, payload, user_id) VALUES (?, ?, ?)`, ['CREATE_APPOINTMENT', auditPayload, userId]);
                    db.run(`INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
                        [userId, 'Agendamento Recebido', 'Aguardando confirmação do admin.']
                    );

                    res.status(201).json({ id: this.lastID, message: 'Agendamento solicitado com sucesso.' });
                }
            );
        });
    });
});

// CANCEL APPOINTMENT (User)
router.put('/:id/cancel', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const db = req.db;

    // Check if appointment belongs to user and is pending or accepted
    db.get(`SELECT * FROM appointments WHERE id = ? AND user_id = ?`, [id, userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Agendamento não encontrado.' });

        if (row.status === 'completed' || row.status === 'rejected' || row.status === 'cancelled') {
            return res.status(400).json({ error: 'Não é possível cancelar este agendamento.' });
        }

        // Check if it's too close (e.g. 2 hours) - Optional, skipping for now

        db.run(`UPDATE appointments SET status = 'cancelled' WHERE id = ?`, [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Notify Admin (optional, maybe just log)
            res.json({ message: 'Agendamento cancelado com sucesso.' });
        });
    });
});

module.exports = router;
