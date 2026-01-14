import pool from '../../lib/db.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, amount, reason } = req.body; // Amount: -1 (lose life), +5 (reward)

    if (!userId || amount === undefined) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const userRes = await client.query(`
                SELECT hearts, next_hearts_at, regen_amount, regen_interval_seconds 
                FROM users WHERE id = $1 FOR UPDATE
            `, [userId]);

            if (userRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'User not found' });
            }

            const user = userRes.rows[0];
            const currentHearts = user.hearts || 0;
            const newHearts = currentHearts + amount;

            if (newHearts < 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Not enough hearts' });
            }

            // Logic for Timer Reset if losing life (re-enable timer if full)
            // If we were full (500) and now are 499, we might need to set the timer IF it wasn't running?
            // Actually, the timer logic usually runs if hearts < max.
            // If `next_hearts_at` is in the past (timer expired), we should probably reset it to NOW + Interval?
            // Or just leave it?
            // Simple logic: If we drop below max, ensure `next_hearts_at` is valid future date?
            // The prompt "O timer nunca reseta... sem motivo".
            // If I have 500, lose 1 -> 499. I should start regenerating immediately.

            let nextHeartsAt = user.next_hearts_at;
            const now = new Date();

            // If we are dropping from Full/Max to Non-Full, or if timer is stale
            const maxHearts = 500; // Hardcoded default or fetch column
            if (currentHearts >= maxHearts && newHearts < maxHearts) {
                // Started regeneration cycle
                nextHeartsAt = new Date(now.getTime() + (user.regen_interval_seconds * 1000));
            }

            const updateRes = await client.query(`
                UPDATE users 
                SET hearts = $1, next_hearts_at = $2, updated_at = NOW() 
                WHERE id = $3 
                RETURNING hearts, next_hearts_at
            `, [newHearts, nextHeartsAt, userId]);

            // If we lost a life, log specifically if needed (optional)
            if (amount < 0) {
                await client.query(`UPDATE users SET last_life_lost = NOW() WHERE id = $1`, [userId]);
            }

            await client.query('COMMIT');

            res.status(200).json({
                success: true,
                hearts: updateRes.rows[0].hearts,
                next_hearts_at: updateRes.rows[0].next_hearts_at,
                server_now: now.toISOString(),
                reason: reason
            });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Hearts Update Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
