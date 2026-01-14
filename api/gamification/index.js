import pool from '../../lib/db.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const userId = req.query.userId || 1;

    try {
        const client = await pool.connect();
        try {
            // Fetch all gamification stats at once
            const userRes = await client.query(`
                SELECT id, hearts, gems, streak, level, xp, last_activity_date, next_hearts_at, regen_interval_seconds, hearts_max 
                FROM users 
                WHERE id = $1
            `, [userId]);

            if (userRes.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = userRes.rows[0];
            const now = new Date();

            res.status(200).json({
                hearts: user.hearts,
                gems: user.gems,
                streak: user.streak,
                level: user.level,
                xp: user.xp,
                // Helper to tell frontend if "Today" is already done
                has_activity_today: user.last_activity_date === now.toISOString().split('T')[0],
                server_now: now.toISOString(),
                // Hearts specific for timer
                next_hearts_at: user.next_hearts_at,
                hearts_max: user.hearts_max,
                regen_interval_seconds: user.regen_interval_seconds
            });

        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Gamification Status Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
