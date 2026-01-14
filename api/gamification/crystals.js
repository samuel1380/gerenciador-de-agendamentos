import pool from '../../lib/db.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, amount, reason } = req.body; // Amount can be positive (earn) or negative (spend)

    if (!userId || amount === undefined) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const userRes = await client.query(`SELECT gems FROM users WHERE id = $1 FOR UPDATE`, [userId]);
            if (userRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'User not found' });
            }

            const currentGems = userRes.rows[0].gems || 0;
            const newGems = currentGems + amount;

            if (newGems < 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Insufficient crystals' });
            }

            const updateRes = await client.query(`
                UPDATE users SET gems = $1, updated_at = NOW() WHERE id = $2 RETURNING gems
            `, [newGems, userId]);

            await client.query('COMMIT');

            res.status(200).json({
                success: true,
                gems: updateRes.rows[0].gems,
                reason: reason
            });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Crystals Update Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
