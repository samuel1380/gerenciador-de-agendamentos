const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');

// GET Available Schedules
router.get('/', (req, res) => {
    const db = req.db;
    const { date, service_id } = req.query; // date in YYYY-MM-DD

    if (!date) return res.status(400).json({ error: 'Date is required' });

    // 1. Get base slots for the date
    db.all(`SELECT * FROM schedules WHERE date = ? AND available = 1`, [date], (err, slots) => {
        if (err) return res.status(500).json({ error: err.message });

        if (slots.length === 0) {
            return res.json([]); // No slots defined for this day
        }

        // 2. Get accepted/pending appointments for this date to exclude
        db.all(`SELECT time FROM appointments WHERE date = ? AND status IN ('pending', 'accepted')`, [date], (err, tasks) => {
            if (err) return res.status(500).json({ error: err.message });

            const busyTimes = tasks.map(t => t.time);

            // 3. Mark availability
            const result = slots.map(slot => ({
                ...slot,
                is_blocked: busyTimes.includes(slot.time)
            }));

            res.json(result);
        });
    });
});

// ADMIN: Manage Schedules (Add/Block)
// ADMIN: Batch Create Schedules
router.post('/batch', authenticateToken, isAdmin, (req, res) => {
    const { startDate, endDate, startTime, endTime, interval } = req.body; // interval in minutes
    const db = req.db;

    if (!startDate || !endDate || !startTime || !endTime || !interval) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeSlots = [];

    // Helper to add minutes to time string "HH:MM"
    function addMinutes(time, mins) {
        const [h, m] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m, 0, 0);
        date.setMinutes(date.getMinutes() + mins);
        return date.toTimeString().slice(0, 5);
    }

    // Helper to compare times "HH:MM"
    function isBefore(t1, t2) {
        return t1 < t2;
    }

    // Generate Time Slots
    let currentT = startTime;
    while (isBefore(currentT, endTime) || currentT === endTime) {
        timeSlots.push(currentT);
        currentT = addMinutes(currentT, parseInt(interval));
    }

    db.serialize(() => {
        // Prevent duplicates by checking existence before insert
        // SQLite trick: INSERT INTO ... SELECT ... WHERE NOT EXISTS
        const stmt = db.prepare(`
            INSERT INTO schedules (date, time, slot_label, available) 
            SELECT ?, ?, ?, 1 
            WHERE NOT EXISTS (SELECT 1 FROM schedules WHERE date = ? AND time = ?)
        `);

        db.run('BEGIN TRANSACTION');

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            timeSlots.forEach(t => {
                // Params: date, time, label, check_date, check_time
                stmt.run(dateStr, t, t, dateStr, t);
            });
        }

        stmt.finalize();
        db.run('COMMIT', (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Horários gerados com sucesso! (Duplicatas ignoradas)' });
        });
    });
});

// ADMIN: Manage Single Schedule (Add/Delete/Block)
router.post('/', authenticateToken, isAdmin, (req, res) => {
    const { date, time, available, slot_label } = req.body;
    const db = req.db;

    // Check if exists to update or insert
    db.get(`SELECT id FROM schedules WHERE date = ? AND time = ?`, [date, time], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            db.run(`UPDATE schedules SET available = ? WHERE id = ?`, [available ? 1 : 0, row.id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Schedule updated' });
            });
        } else {
            db.run(`INSERT INTO schedules (date, time, slot_label, available) VALUES (?, ?, ?, ?)`,
                [date, time, slot_label || time, available ? 1 : 0],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ id: this.lastID, message: 'Schedule created' });
                }
            );
        }
    });
});

// ADMIN: Delete/Clear All Schedules
router.delete('/all', authenticateToken, isAdmin, (req, res) => {
    const db = req.db;
    db.run(`DELETE FROM schedules`, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Todos os horários foram removidos com sucesso.' });
    });
});

module.exports = router;
