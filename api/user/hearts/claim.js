import pool from '../../lib/db.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        const client = await pool.connect();

        try {
            await client.query('BEGIN'); // Start Transaction

            // 1. Lock User Row for update
            const userRes = await client.query(`
                SELECT id, hearts, hearts_max, regen_amount, regen_interval_seconds, next_hearts_at 
                FROM users 
                WHERE id = $1
                FOR UPDATE
            `, [userId]);

            if (userRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'User not found' });
            }

            const user = userRes.rows[0];
            const now = new Date();
            const nextHeartsAt = new Date(user.next_hearts_at);

            if (now < nextHeartsAt) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    error: 'Too early to claim',
                    next_hearts_at: user.next_hearts_at
                });
            }

            // 2. Apply Regen
            const newHearts = user.hearts + user.regen_amount;
            const newNextHeartsAt = new Date(now.getTime() + (user.regen_interval_seconds * 1000));

            const updateRes = await client.query(`
                UPDATE users 
                SET hearts = $1, next_hearts_at = $2, last_hearts_claim_at = NOW(), updated_at = NOW()
                WHERE id = $3
                RETURNING hearts, next_hearts_at
            `, [newHearts, newNextHeartsAt.toISOString(), userId]);

            await client.query('COMMIT'); // Commit

            const updatedUser = updateRes.rows[0];

            res.status(200).json({
                success: true,
                hearts: updatedUser.hearts,
                next_hearts_at: updatedUser.next_hearts_at,
                server_now: now.toISOString()
            });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Claim error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
