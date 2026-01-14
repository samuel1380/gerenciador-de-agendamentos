import pool from '../../lib/db.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, xpEarned } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const userRes = await client.query(`
                SELECT id, streak, last_activity_date, xp, level
                FROM users 
                WHERE id = $1
                FOR UPDATE
            `, [userId]);

            if (userRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'User not found' });
            }

            const user = userRes.rows[0];

            // Timezone handling: Use logic relative to Sao Paulo or UTC.
            // Simplified: We assume usage of server date (UTC) for consistence or store a specific timezone.
            // Postgres DATE type stores YYYY-MM-DD. We construct "Today" based on DB timezone or Code assumption.
            // Ideally, we respect user timezone, but here we enforce Server Standard.
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

            let newStreak = user.streak;
            let streakUpdated = false;

            if (user.last_activity_date !== todayStr) {
                // Not active today yet. Check if active yesterday.
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (user.last_activity_date === yesterdayStr) {
                    newStreak++;
                    streakUpdated = true;
                } else {
                    newStreak = 1; // Reset
                    streakUpdated = true;
                }
            }

            // Best Streak Logic
            // We need to fetch current best_streak first? It wasn't in SELECT.
            // Let's do a sub-query or assume 0 if null, but safer to add to SELECT.
            // Since I can't edit the SELECT above effectively in this hunk (it's far up), 
            // I will cheat: Update it blindly: GREATEST(best_streak, newStreak)

            const newXP = (user.xp || 0) + (xpEarned || 0);
            const newLevel = Math.floor(newXP / 100) + 1;

            const updateRes = await client.query(`
                UPDATE users 
                SET streak = $1, last_activity_date = $2, xp = $3, level = $4, updated_at = NOW(),
                    best_streak = GREATEST(COALESCE(best_streak, 0), $1)
                WHERE id = $5
                RETURNING streak, xp, level, last_activity_date, best_streak
            `, [newStreak, todayStr, newXP, newLevel, userId]);

            await client.query('COMMIT');

            res.status(200).json({
                success: true,
                streak: updateRes.rows[0].streak,
                streak_updated: streakUpdated,
                xp: updateRes.rows[0].xp,
                level: updateRes.rows[0].level
            });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Activity Record Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
