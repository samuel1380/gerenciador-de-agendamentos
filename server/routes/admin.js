const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Apply middleware to all routes in this file
router.use(authenticateToken, isAdmin);

// LIST ALL APPOINTMENTS (Admin)
router.get('/appointments', (req, res) => {
    const db = req.db;
    const { status, date, startDate, endDate, sort } = req.query; // Filters

    let query = `SELECT a.*, u.name as user_name, u.phone as user_phone, s.title as service_title 
                 FROM appointments a
                 JOIN users u ON a.user_id = u.id
                 JOIN services s ON a.service_id = s.id`;

    let params = [];
    let conditions = [];

    if (status) {
        conditions.push(`a.status = ?`);
        params.push(status);
    }
    if (date) {
        conditions.push(`a.date = ?`);
        params.push(date);
    }
    if (startDate) {
        conditions.push(`a.date >= ?`);
        params.push(startDate);
    }
    if (endDate) {
        conditions.push(`a.date <= ?`);
        params.push(endDate);
    }

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    // Sorting Logic
    if (sort === 'oldest') {
        query += ` ORDER BY a.date ASC, a.time ASC`;
    } else if (sort === 'upcoming') {
        // Upcoming means future dates, closest first. 
        // Logic handled in UI filter usually, but here we can sort asc for future.
        // Simple fallback: Recent = DESC
        query += ` ORDER BY a.date ASC, a.time ASC`;
    } else {
        // Default: Most recent (newest) first
        query += ` ORDER BY a.date DESC, a.time DESC`;
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// UPDATE STATUS (Accept/Reject)
router.put('/appointments/:id/status', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const db = req.db;

    if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    // Determine conflicts if accepting
    // Determine conflicts if accepting
    if (status === 'accepted') {
        db.get(`SELECT date, time FROM appointments WHERE id = ?`, [id], (err, current) => {
            // ... (keep conflict check logic same) ...
            if (err || !current) return res.status(404).json({ error: 'Appointment not found' });

            db.get(`SELECT count(*) as count FROM appointments WHERE date = ? AND time = ? AND status = 'accepted' AND id != ?`,
                [current.date, current.time, id],
                (err, conflict) => {
                    if (conflict.count > 0) {
                        return res.status(409).json({ error: 'Conflito de horário! Já existe um agendamento aceito.' });
                    }
                    performUpdate();
                }
            );
        });
    } else {
        performUpdate();
    }

    function performUpdate() {
        db.run(`UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [status, id], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Notify User
            db.get(`SELECT user_id, date, time FROM appointments WHERE id = ?`, [id], (err, row) => {
                if (row) {
                    let msg = `Seu agendamento para ${row.date} às ${row.time} foi atualizado para: ${status}`;

                    // If COMPLETED, award XP
                    if (status === 'completed') {
                        db.get(`SELECT value FROM settings WHERE key = 'appointment_xp_reward'`, (err, xpRow) => {
                            const xpGain = xpRow ? parseInt(xpRow.value) : 100;
                            db.get(`SELECT value FROM settings WHERE key = 'xp_per_level'`, (err, levelRow) => {
                                const xpPerLevel = levelRow ? parseInt(levelRow.value) : 200;

                                db.get(`SELECT level, xp FROM users WHERE id = ?`, [row.user_id], (err, user) => {
                                    if (user) {
                                        const newXp = (user.xp || 0) + xpGain;
                                        const newLevel = Math.floor(newXp / xpPerLevel) + 1;
                                        msg += `\nVocê ganhou +${xpGain} XP!`;

                                        if (newLevel > (user.level || 1)) {
                                            msg += ` PARABÉNS! Você subiu para o Nível ${newLevel}!`;
                                            db.run(`INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
                                                [row.user_id, 'Level Up!', `Parabéns! Você alcançou o nível ${newLevel} e desbloqueou novos benefícios!`]
                                            );
                                        }

                                        db.run(`UPDATE users SET xp = ?, level = ? WHERE id = ?`, [newXp, newLevel, row.user_id]);
                                    }

                                    // Send notification after XP logic
                                    db.run(`INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
                                        [row.user_id, 'Atualização de Agendamento', msg]
                                    );
                                });
                            });
                        });
                    } else {
                        // Normal notification for other statuses
                        db.run(`INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
                            [row.user_id, 'Atualização de Agendamento', msg]
                        );
                    }
                }
            });

            res.json({ message: 'Status updated' });
        });
    }
});

// UPDATE APPOINTMENT DETAILS (Reschedule)
router.put('/appointments/:id', (req, res) => {
    const { date, time, service_id } = req.body;
    const { id } = req.params;
    const db = req.db;

    // Check availability before updating
    db.get(`SELECT count(*) as count FROM appointments WHERE date = ? AND time = ? AND status = 'accepted' AND id != ?`,
        [date, time, id],
        (err, conflict) => {
            if (conflict && conflict.count > 0) {
                return res.status(409).json({ error: 'Horário indisponível.' });
            }

            // Construct update query dynamically based on what's provided
            let updates = [];
            let params = [];

            if (date) { updates.push('date = ?'); params.push(date); }
            if (time) { updates.push('time = ?'); params.push(time); }
            if (service_id) { updates.push('service_id = ?'); params.push(service_id); }

            if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

            updates.push('updated_at = CURRENT_TIMESTAMP');
            params.push(id);

            db.run(`UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`, params, function (err) {
                if (err) return res.status(500).json({ error: err.message });

                // Notify User
                db.get(`SELECT user_id FROM appointments WHERE id = ?`, [id], (err, row) => {
                    if (row) {
                        db.run(`INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
                            [row.user_id, 'Agendamento Alterado', `Seu agendamento foi reagendado pelo administrador.`]
                        );
                    }
                });

                res.json({ message: 'Appointment updated' });
            });
        }
    );
});

// STATS
router.get('/stats', (req, res) => {
    const db = req.db;
    // Fix timezone/locale issue: Manually construct YYYY-MM-DD in local time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    let stats = {};

    // 1. Pending Appointments
    db.get(`SELECT count(*) as count FROM appointments WHERE status = 'pending'`, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.pending = row.count;

        // 2. Completed Today (Changed from 'accepted' OR 'completed' to just 'completed')
        db.get(`SELECT count(*) as count FROM appointments WHERE date = ? AND status = 'completed'`, [today], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.today_completed = row.count;

            // 3. New Clients Today
            // Compatibility: MySQL uses DATE(), SQLite uses date(..., 'localtime')
            const dateFunc = db.isMysql ? "DATE(created_at)" : "date(created_at, 'localtime')";
            db.get(`SELECT count(*) as count FROM users WHERE ${dateFunc} = ?`, [today], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.today_new_users = row.count;

                // 4. Monthly Completed
                const monthCheck = db.isMysql
                    ? "DATE_FORMAT(date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')"
                    : "strftime('%Y-%m', date) = strftime('%Y-%m', 'now')";

                db.get(`SELECT count(*) as count FROM appointments WHERE ${monthCheck} AND status = 'completed'`, (err, row) => {
                    if (err) return res.status(500).json({ error: err.message });
                    stats.month = row.count;

                    res.json(stats);
                });
            });
        });
    });
});

// GET SETTINGS
router.get('/settings', (req, res) => {
    const db = req.db;
    db.all(`SELECT key, value FROM settings`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const settings = {};
        rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    });
});

// UPDATE SETTINGS
router.post('/settings', (req, res) => {
    const db = req.db;
    const settings = req.body;

    const stmt = db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`);

    Object.entries(settings).forEach(([key, value]) => {
        stmt.run(key, value.toString());
    });

    stmt.finalize((err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Settings updated successfully' });
    });
});

// --- USER MANAGEMENT ---

// LIST USERS
router.get('/users', (req, res) => {
    const db = req.db;
    db.all(`SELECT u.id, u.name, u.email, u.phone, u.level, u.xp, u.created_at,
            (SELECT count(*) FROM appointments WHERE user_id = u.id) as total_appointments,
            (SELECT sum(s.price) FROM appointments a JOIN services s ON a.service_id = s.id WHERE a.user_id = u.id AND a.status = 'completed') as ltv
            FROM users u
            WHERE u.role != 'admin'
            ORDER BY u.created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET USER DETAILS
router.get('/users/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;

    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Get History
        db.all(`SELECT a.*, s.title as service_title, s.price 
                FROM appointments a 
                JOIN services s ON a.service_id = s.id 
                WHERE a.user_id = ? ORDER BY a.date DESC`, [id], (err, appointments) => {

            // Get Quiz History
            db.all(`SELECT * FROM audit_logs WHERE user_id = ? AND action = 'QUIZ_RESULT' ORDER BY created_at DESC`, [id], (err, quizzes) => {

                res.json({
                    user,
                    appointments,
                    quizzes: quizzes.map(q => ({ ...q, payload: JSON.parse(q.payload) }))
                });
            });
        });
    });
});

// TOGGLE USER STATUS (BAN)
router.put('/users/:id/toggle', (req, res) => {
    const db = req.db;
    const { id } = req.params;

    db.get(`SELECT active FROM users WHERE id = ?`, [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'User not found' });

        const newStatus = row.active ? 0 : 1;
        db.run(`UPDATE users SET active = ? WHERE id = ?`, [newStatus, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User status updated', active: newStatus });
        });
    });
});

// PROMOTE USER TO ADMIN
router.put('/users/:id/promote', (req, res) => {
    const db = req.db;
    const { id } = req.params;

    db.run(`UPDATE users SET role = 'admin' WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User promoted to admin successfully' });
    });
});

// --- ANALYTICS ---

// QUIZ STATS
router.get('/analytics/quiz', (req, res) => {
    const db = req.db;

    // We need to parse logs to get aggregate data suitable for a chart.
    // Since payloads are JSON strings in SQLite, we might have to fetch and process in memory for simplicity 
    // unless we use JSON_EXTRACT (available in modern sqlite).
    // Let's try JSON_EXTRACT first for efficiency, fall back to memory if needed.
    // Query: Count breakdown of "answers" (which is an array of strings). 
    // Actually, distinct answers are hard to group if they are arrays.
    // Let's process in memory for now (assuming < 1000 logs it's fine).

    db.all(`SELECT payload FROM audit_logs WHERE action = 'QUIZ_RESULT'`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const styleCounts = {};
        const total = rows.length;

        rows.forEach(r => {
            try {
                const p = JSON.parse(r.payload);
                // "answers" is [ "Vermelho", "Stiletto", ... ]
                // Or we can logic based on score?
                // Score <= 4: Classica, <= 7: Moderna, >7: Ousada
                let style = 'Desconhecido';
                const score = p.score || 0;
                if (score <= 4) style = 'Clássica';
                else if (score <= 7) style = 'Moderna';
                else style = 'Ousada';

                styleCounts[style] = (styleCounts[style] || 0) + 1;
            } catch (e) { }
        });

        res.json({ total, breakdown: styleCounts });
    });
});

// FINANCIAL STATS
router.get('/analytics/financials', (req, res) => {
    const db = req.db;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const queries = {
        total: `SELECT SUM(s.price) as total FROM appointments a JOIN services s ON a.service_id = s.id WHERE a.status = 'completed'`,
        month: `SELECT SUM(s.price) as total FROM appointments a JOIN services s ON a.service_id = s.id WHERE a.status = 'completed' AND a.date >= ?`,
        today: `SELECT SUM(s.price) as total FROM appointments a JOIN services s ON a.service_id = s.id WHERE a.status = 'completed' AND a.date >= ?`,
        by_service: `SELECT s.title, COUNT(*) as count, SUM(s.price) as total FROM appointments a JOIN services s ON a.service_id = s.id WHERE a.status = 'completed' GROUP BY s.title ORDER BY total DESC`,
        recent: `SELECT a.date, a.time, s.title, s.price, u.name as user_name FROM appointments a JOIN services s ON a.service_id = s.id JOIN users u ON a.user_id = u.id WHERE a.status = 'completed' ORDER BY a.date DESC, a.time DESC LIMIT 10`
    };

    db.get(queries.total, [], (err, totalRow) => {
        if (err) return res.status(500).json({ error: err.message });

        db.get(queries.month, [startOfMonth], (err, monthRow) => {
            if (err) return res.status(500).json({ error: err.message });

            db.get(queries.today, [startOfDay], (err, todayRow) => {
                if (err) return res.status(500).json({ error: err.message });

                db.all(queries.by_service, [], (err, serviceRows) => {
                    if (err) return res.status(500).json({ error: err.message });

                    db.all(queries.recent, [], (err, recentRows) => {
                        if (err) return res.status(500).json({ error: err.message });

                        res.json({
                            total: totalRow.total || 0,
                            month: monthRow.total || 0,
                            today: todayRow.total || 0,
                            by_service: serviceRows,
                            recent: recentRows
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
