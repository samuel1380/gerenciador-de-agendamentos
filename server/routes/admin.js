const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const pushRouter = require('./push');

function ensureNotificationTemplatesTable(db, callback) {
    db.run(`
        CREATE TABLE IF NOT EXISTS notification_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            target_type TEXT NOT NULL,
            default_email TEXT,
            is_quick_action INTEGER DEFAULT 0,
            editable INTEGER DEFAULT 1,
            slug TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) return callback(err);

        db.get(`SELECT COUNT(*) as count FROM notification_templates WHERE is_quick_action = 1`, [], (err2, row) => {
            if (err2) return callback(err2);
            if (row && row.count > 0) return callback(null);

            const stmt = db.prepare(`
                INSERT INTO notification_templates
                    (name, title, message, target_type, default_email, is_quick_action, editable, slug, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `);

            const defaults = [
                {
                    name: 'Estabelecimento aberto',
                    title: 'Estamos abertos!',
                    message: 'O estabelecimento está aberto hoje. Agende seu horário ou venha nos visitar.',
                    target_type: 'all',
                    slug: 'open_store'
                },
                {
                    name: 'Estabelecimento fechado',
                    title: 'Hoje estamos fechados',
                    message: 'Hoje o estabelecimento estará fechado. Voltaremos em breve com novos horários.',
                    target_type: 'all',
                    slug: 'close_store'
                },
                {
                    name: 'Promoção ativa',
                    title: 'Promoção ativa!',
                    message: 'Temos uma promoção especial ativa por tempo limitado. Confira agora no app.',
                    target_type: 'all',
                    slug: 'active_promotion'
                },
                {
                    name: 'Entre e veja a promoção',
                    title: 'Entre agora e veja a promoção',
                    message: 'Acesse o app agora e confira a promoção exclusiva disponível para você.',
                    target_type: 'all',
                    slug: 'open_promotion'
                }
            ];

            defaults.forEach(t => {
                stmt.run(
                    t.name,
                    t.title,
                    t.message,
                    t.target_type,
                    null,
                    1,
                    1,
                    t.slug
                );
            });

            stmt.finalize(callback);
        });
    });
}

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
                        db.get("SELECT value FROM settings WHERE `key` = 'appointment_xp_reward'", (err, xpRow) => {
                            const xpGain = xpRow ? parseInt(xpRow.value) : 100;
                            db.get("SELECT value FROM settings WHERE `key` = 'xp_per_level'", (err, levelRow) => {
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
                                            if (pushRouter && typeof pushRouter.sendPushToUser === 'function') {
                                                pushRouter.sendPushToUser(db, row.user_id, 'Level Up!', `Parabéns! Você alcançou o nível ${newLevel} e desbloqueou novos benefícios!`);
                                            }
                                        }

                                        db.run(`UPDATE users SET xp = ?, level = ? WHERE id = ?`, [newXp, newLevel, row.user_id]);
                                    }

                                    // Send notification after XP logic
                                    db.run(`INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
                                        [row.user_id, 'Atualização de Agendamento', msg]
                                    );
                                    if (pushRouter && typeof pushRouter.sendPushToUser === 'function') {
                                        pushRouter.sendPushToUser(db, row.user_id, 'Atualização de Agendamento', msg);
                                    }
                                });
                            });
                        });
                    } else {
                        // Normal notification for other statuses
                        db.run(`INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
                            [row.user_id, 'Atualização de Agendamento', msg]
                        );
                        if (pushRouter && typeof pushRouter.sendPushToUser === 'function') {
                            pushRouter.sendPushToUser(db, row.user_id, 'Atualização de Agendamento', msg);
                        }
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
                        const title = 'Agendamento Alterado';
                        const message = 'Seu agendamento foi reagendado pelo administrador.';
                        db.run(`INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
                            [row.user_id, title, message]
                        );
                        if (pushRouter && typeof pushRouter.sendPushToUser === 'function') {
                            pushRouter.sendPushToUser(db, row.user_id, title, message);
                        }
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
    let stats = {};

    // 1. Pending Appointments
    db.get(`SELECT count(*) as count FROM appointments WHERE status = 'pending'`, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.pending = row.count;

        // 2. TOTAL Completed/Active (Simplified Request: "Total Concluídos")
        // No date filter, just total count of active business.
        db.get(`SELECT count(*) as count FROM appointments WHERE status IN ('accepted', 'completed')`, [], (err, rowApp) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.today_completed = rowApp.count;

            // 3. New Clients Month (Simplified Request: "Novos Clientes (Mês)")
            // Fetch all users and filter in JS to be safe with timezones
            db.all(`SELECT created_at FROM users WHERE role != 'admin'`, [], (err, users) => {
                if (err) return res.status(500).json({ error: err.message });

                const now = new Date();
                const brazilDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
                const currentMonthStr = `${brazilDate.getFullYear()}-${String(brazilDate.getMonth() + 1).padStart(2, '0')}`;

                let newClientsMonth = 0;
                users.forEach(u => {
                    // Assuming created_at is standard SQL datetime string or ISO
                    const uStr = (u.created_at || '').substring(0, 7); // 'YYYY-MM'
                    if (uStr === currentMonthStr) {
                        newClientsMonth++;
                    }
                });
                stats.today_new_users = newClientsMonth;

                // 4. Monthly Completed (Keep current month logic for this legacy field if needed by other components, 
                // but currently dashboard uses 'stats.today_completed' which is now TOTAL)
                // Let's populate stats.month with actual month count just in case.
                db.all(`SELECT date FROM appointments WHERE status = 'completed'`, [], (err, monthRows) => {
                    let monthCount = 0;
                    monthRows.forEach(r => {
                        if ((r.date + '').substring(0, 7) === currentMonthStr) monthCount++;
                    });
                    stats.month = monthCount;

                    res.json(stats);
                });
            });
        });
    });
});


// GET SETTINGS
router.get('/settings', (req, res) => {
    const db = req.db;
    db.all("SELECT `key`, value FROM settings", [], (err, rows) => {
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

    const stmt = db.prepare("INSERT OR REPLACE INTO settings (`key`, value) VALUES (?, ?)");

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
    db.all(`SELECT u.id, u.name, u.email, u.phone, u.level, u.xp, u.created_at, u.active, u.role,
            (SELECT count(*) FROM appointments WHERE user_id = u.id) as total_appointments,
            (SELECT COALESCE(sum(s.price), 0) FROM appointments a JOIN services s ON a.service_id = s.id WHERE a.user_id = u.id AND a.status = 'completed') as ltv
            FROM users u
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

    db.get(`SELECT active, role FROM users WHERE id = ?`, [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'User not found' });
        if (row.role === 'admin') return res.status(403).json({ error: 'Não é permitido bloquear uma conta admin.' });

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

    db.get(`SELECT role FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'User not found' });
        if (row.role === 'admin') return res.status(400).json({ error: 'Usuário já é administrador.' });

        db.run(`UPDATE users SET role = 'admin' WHERE id = ?`, [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User promoted to admin successfully' });
        });
    });
});

// TOGGLE USER ADMIN ROLE (admin <-> user)
router.put('/users/:id/admin-toggle', (req, res) => {
    const db = req.db;
    const { id } = req.params;

    const currentUserId = req.user && req.user.id;
    if (currentUserId && Number(id) === Number(currentUserId)) {
        return res.status(400).json({ error: 'Você não pode alterar seu próprio status de administrador.' });
    }

    db.get(`SELECT role FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'User not found' });

        const newRole = row.role === 'admin' ? 'user' : 'admin';

        db.run(`UPDATE users SET role = ? WHERE id = ?`, [newRole, id], function (updateErr) {
            if (updateErr) return res.status(500).json({ error: updateErr.message });
            res.json({ message: 'User role updated successfully', role: newRole });
        });
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
    // Use SQL-based timezone logic for financials too
    // Use strict JS filtering for financials to match dashboard logic
    db.all(`SELECT a.date, a.status, s.price 
            FROM appointments a 
            JOIN services s ON a.service_id = s.id 
            WHERE a.status = 'completed'`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const total = rows.reduce((sum, r) => sum + Number(r.price), 0);

        const brazilNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        const y = brazilNow.getFullYear();
        const m = String(brazilNow.getMonth() + 1).padStart(2, '0');
        const d = String(brazilNow.getDate()).padStart(2, '0');
        const todayStr = `${y}-${m}-${d}`;
        const monthStr = `${y}-${m}`;

        const monthTotal = rows
            .filter(r => (r.date + '').substring(0, 7) === monthStr)
            .reduce((sum, r) => sum + Number(r.price), 0);

        const todayTotal = rows
            .filter(r => (r.date + '').substring(0, 10) === todayStr)
            .reduce((sum, r) => sum + Number(r.price), 0);

        // Fetch breakdown and recent separately as they are lists, logic is simpler order by
        const queries = {
            by_service: `SELECT s.title, COUNT(*) as count, SUM(s.price) as total FROM appointments a JOIN services s ON a.service_id = s.id WHERE a.status = 'completed' GROUP BY s.title ORDER BY total DESC`,
            recent: `SELECT a.date, a.time, s.title, s.price, u.name as user_name FROM appointments a JOIN services s ON a.service_id = s.id JOIN users u ON a.user_id = u.id WHERE a.status = 'completed' ORDER BY a.date DESC, a.time DESC LIMIT 10`
        };

        db.all(queries.by_service, [], (err, serviceRows) => {
            if (err) return res.status(500).json({ error: err.message });

            db.all(queries.recent, [], (err, recentRows) => {
                if (err) return res.status(500).json({ error: err.message });

                res.json({
                    total: total || 0,
                    month: monthTotal || 0,
                    today: todayTotal || 0,
                    by_service: serviceRows,
                    recent: recentRows
                });
            });
        });
    });
});

router.get('/notification-templates', (req, res) => {
    const db = req.db;
    ensureNotificationTemplatesTable(db, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.all(`SELECT * FROM notification_templates ORDER BY is_quick_action DESC, name ASC`, [], (err2, rows) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json(rows);
        });
    });
});

router.post('/notification-templates', (req, res) => {
    const db = req.db;
    const { name, title, message, target_type, default_email, is_quick_action, editable, slug } = req.body;

    if (!name || !title || !message || !target_type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    ensureNotificationTemplatesTable(db, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const stmt = db.prepare(`
            INSERT INTO notification_templates
                (name, title, message, target_type, default_email, is_quick_action, editable, slug, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);

        stmt.run(
            name,
            title,
            message,
            target_type,
            default_email || null,
            is_quick_action ? 1 : 0,
            editable === false ? 0 : 1,
            slug || null,
            function (runErr) {
                if (runErr) return res.status(500).json({ error: runErr.message });
                res.status(201).json({ id: this.lastID });
            }
        );
    });
});

router.put('/notification-templates/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;
    const { name, title, message, target_type, default_email } = req.body;

    ensureNotificationTemplatesTable(db, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.get(`SELECT * FROM notification_templates WHERE id = ?`, [id], (getErr, existing) => {
            if (getErr) return res.status(500).json({ error: getErr.message });
            if (!existing) return res.status(404).json({ error: 'Template not found' });
            if (!existing.editable) return res.status(403).json({ error: 'Template is not editable' });

            const newName = name || existing.name;
            const newTitle = title || existing.title;
            const newMessage = message || existing.message;
            const newTargetType = target_type || existing.target_type;
            const newDefaultEmail = typeof default_email !== 'undefined' ? default_email : existing.default_email;

            db.run(
                `UPDATE notification_templates
                 SET name = ?, title = ?, message = ?, target_type = ?, default_email = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [newName, newTitle, newMessage, newTargetType, newDefaultEmail, id],
                (updateErr) => {
                    if (updateErr) return res.status(500).json({ error: updateErr.message });
                    res.json({ message: 'Template updated' });
                }
            );
        });
    });
});

router.delete('/notification-templates/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;

    ensureNotificationTemplatesTable(db, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.get(`SELECT * FROM notification_templates WHERE id = ?`, [id], (getErr, existing) => {
            if (getErr) return res.status(500).json({ error: getErr.message });
            if (!existing) return res.status(404).json({ error: 'Template not found' });
            if (!existing.editable) return res.status(403).json({ error: 'Template cannot be deleted' });

            db.run(`DELETE FROM notification_templates WHERE id = ?`, [id], (delErr) => {
                if (delErr) return res.status(500).json({ error: delErr.message });
                res.json({ message: 'Template deleted' });
            });
        });
    });
});

router.post('/notifications/send-template', (req, res) => {
    const db = req.db;
    const { template_id, override_target_type, override_email } = req.body;

    if (!template_id) {
        return res.status(400).json({ error: 'template_id is required' });
    }

    ensureNotificationTemplatesTable(db, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.get(`SELECT * FROM notification_templates WHERE id = ?`, [template_id], (getErr, template) => {
            if (getErr) return res.status(500).json({ error: getErr.message });
            if (!template) return res.status(404).json({ error: 'Template not found' });

            let target = override_target_type || template.target_type;
            let email = override_email || template.default_email;
            const title = template.title;
            const message = template.message;

            if (!target || target === 'none') {
                return res.status(400).json({ error: 'Target must be specified' });
            }

            if (target === 'all') {
                db.all(`SELECT id FROM users`, [], (listErr, rows) => {
                    if (listErr) return res.status(500).json({ error: listErr.message });

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
                if (!email) {
                    return res.status(400).json({ error: 'Email is required for email target' });
                }
                db.get(`SELECT id FROM users WHERE email = ?`, [email], (userErr, user) => {
                    if (userErr || !user) return res.status(404).json({ error: 'User not found' });

                    db.run(`INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
                        [user.id, title, message],
                        (insertErr) => {
                            if (insertErr) return res.status(500).json({ error: insertErr.message });
                            if (pushRouter && typeof pushRouter.sendPushToUser === 'function') {
                                pushRouter.sendPushToUser(db, user.id, title, message);
                            }
                            res.json({ message: 'Sent to user' });
                        }
                    );
                });
            } else {
                res.status(400).json({ error: 'Invalid target' });
            }
        });
    });
});

module.exports = router;
