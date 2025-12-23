const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

router.post('/result', authenticateToken, (req, res) => {
    const { score, answers } = req.body;
    const db = req.db;
    const userId = req.user.id;

    const payload = JSON.stringify({ score, answers });
    const today = new Date().toISOString().split('T')[0];

    // Get settings for quiz limits and XP
    db.get("SELECT value FROM settings WHERE `key` = 'quiz_daily_limit'", (err, limitRow) => {
        const dailyLimit = limitRow ? parseInt(limitRow.value) : 3;

        db.get("SELECT value FROM settings WHERE `key` = 'quiz_xp_reward'", (err, xpRow) => {
            const xpGain = xpRow ? parseInt(xpRow.value) : 50;

            db.get("SELECT value FROM settings WHERE `key` = 'xp_per_level'", (err, levelRow) => {
                let xpPerLevel = levelRow ? parseInt(levelRow.value) : 200;
                if (!xpPerLevel || isNaN(xpPerLevel) || xpPerLevel < 1) xpPerLevel = 200;

                // Ensure xpGain is valid (was defined in outer scope, we redefine logic or trust variable if accessible, here xpGain is from closure)
                // We need to re-validate xpGain just in case
                if (!xpGain || isNaN(xpGain)) xpGain = 50;

                // Debug log
                console.log(`[QUIZ] User ${userId} completing quiz. Reward: ${xpGain} XP, Level Cap: ${xpPerLevel}`);

                // Check daily quiz count
                db.get(`SELECT COUNT(*) as count FROM audit_logs 
                        WHERE user_id = ? AND action = 'QUIZ_RESULT' 
                        AND DATE(created_at) = ?`,
                    [userId, today],
                    (err, countRow) => {
                        if (countRow && countRow.count >= dailyLimit) {
                            console.log(`[QUIZ] Daily limit reached for user ${userId}`);
                            return res.status(429).json({
                                error: `Limite diário atingido! Você pode fazer apenas ${dailyLimit} quiz(zes) por dia.`
                            });
                        }

                        // Proceed with XP logic
                        db.get(`SELECT level, xp FROM users WHERE id = ?`, [userId], (err, user) => {
                            if (err || !user) {
                                console.error(`[QUIZ] User not found: ${userId}`, err);
                                return res.status(500).json({ error: 'User error' });
                            }

                            const currentXp = user.xp || 0;
                            const newXp = currentXp + xpGain;
                            const newLevel = Math.floor(newXp / xpPerLevel) + 1;

                            let msg = `Quiz salvo! +${xpGain} XP.`;
                            console.log(`[QUIZ] Updating User ${userId}: XP ${currentXp} -> ${newXp}, Level ${user.level} -> ${newLevel}`);

                            if (newLevel > (user.level || 1)) {
                                msg += ` PARABÉNS! Você subiu para o Nível ${newLevel}!`;
                                db.run(`INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
                                    [userId, 'Level Up!', `Parabéns! Você alcançou o nível ${newLevel} e desbloqueou novos benefícios!`]
                                );
                            }

                            db.run(`UPDATE users SET xp = ?, level = ? WHERE id = ?`, [newXp, newLevel, userId], (err) => {
                                if (err) {
                                    console.error('[QUIZ] Update failed', err);
                                    return res.status(500).json({ error: `Erro ao atualizar usuário: ${err.message}` });
                                }

                                db.run(`INSERT INTO audit_logs (action, payload, user_id) VALUES (?, ?, ?)`,
                                    ['QUIZ_RESULT', payload, userId],
                                    function (err) {
                                        if (err) return res.status(500).json({ error: `Erro ao salvar log: ${err.message}` });
                                        res.json({
                                            message: msg,
                                            level: newLevel,
                                            xp: newXp,
                                            id: this.lastID,
                                            quizzesToday: countRow.count + 1,
                                            dailyLimit: dailyLimit
                                        });
                                    }
                                );
                            });
                        });
                    }
                );
            });
        });
    });
});

router.get('/history', authenticateToken, (req, res) => {
    const db = req.db;
    db.all(`SELECT * FROM audit_logs WHERE user_id = ? AND action = 'QUIZ_RESULT' ORDER BY created_at DESC`,
        [req.user.id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            // Parse payload
            const results = rows.map(r => ({
                ...r,
                payload: JSON.parse(r.payload)
            }));
            res.json(results);
        }
    );
});

module.exports = router;
