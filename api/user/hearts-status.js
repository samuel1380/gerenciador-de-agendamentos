import pool from '../../lib/db.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // In a real app, we would get the userId from the session/token.
    // For this prototype, we'll assume userId = 1 or pass it in query.
    const userId = req.query.userId || 1;

    try {
        const client = await pool.connect();

        try {
            // 1. Fetch User Data
            const userRes = await client.query(`
                SELECT id, hearts, hearts_max, regen_amount, regen_interval_seconds, next_hearts_at 
                FROM users 
                WHERE id = $1
            `, [userId]);

            if (userRes.rows.length === 0) {
                // Create dummy user if not exists for demo flow
                await client.query(`
                    INSERT INTO users (id, name, hearts, next_hearts_at)
                    VALUES ($1, 'Usuario Demo', 500, NOW() + INTERVAL '48 hours')
                    ON CONFLICT (id) DO NOTHING
                `, [userId]);
                return res.status(404).json({ error: 'User not found (created placeholder)' });
            }

            let user = userRes.rows[0];
            const now = new Date();
            const nextHeartsAt = new Date(user.next_hearts_at);

            // 2. Check for regeneration (Auto-Claim Logic)
            if (now >= nextHeartsAt) {
                // Time to regen!
                const newHearts = Math.min(user.hearts + user.regen_amount, user.hearts_max + 9999); // Cap if needed, usually just add

                // Calculate NEXT interval. 
                // Option A: Fixed from NOW (easier, prevents potential abuse if they stay offline for months)
                // Option B: Fixed from previous target (more "fair" but can stack? User requested "next_hearts_at = now() + regen_interval")
                const newNextHeartsAt = new Date(now.getTime() + (user.regen_interval_seconds * 1000));

                const updateRes = await client.query(`
                    UPDATE users 
                    SET hearts = $1, next_hearts_at = $2, last_hearts_claim_at = NOW(), updated_at = NOW()
                    WHERE id = $3
                    RETURNING hearts, next_hearts_at, regen_amount, regen_interval_seconds
                `, [newHearts, newNextHeartsAt.toISOString(), userId]);

                user = updateRes.rows[0];
            }

            // 3. Return Status
            res.status(200).json({
                hearts: user.hearts,
                next_hearts_at: user.next_hearts_at, // ISO String
                regen_amount: user.regen_amount,
                regen_interval_seconds: user.regen_interval_seconds,
                server_now: now.toISOString()
            });

        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
