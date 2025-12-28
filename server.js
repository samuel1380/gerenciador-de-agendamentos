const express = require('express');
const cors = require('cors');
const path = require('path');
const { authenticateAdminPage } = require('./server/middleware/auth');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug Middleware
app.use((req, res, next) => {
    console.log(`[SERVER] ${req.method} ${req.url}`);
    next();
});

// Database Connection
const db = require('./server/db/connection');

// Make db accessible to router and ensure schema updates
app.use((req, res, next) => {
    req.db = db;
    next();
});

// AUTO-MIGRATION to add level/xp/avatar if missing
db.serialize(() => {
    // Helper to ignore errors (e.g. column already exists)
    const ignoreErr = (err) => { };

    db.run("ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1", ignoreErr);
    db.run("ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0", ignoreErr);
    db.run("ALTER TABLE users ADD COLUMN avatar TEXT", ignoreErr);
    db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", ignoreErr);

    // Create Promotions table if not exists
    // Handle syntax difference for Auto Increment
    const autoInc = db.isMysql ? "AUTO_INCREMENT" : "AUTOINCREMENT";

    db.run(`CREATE TABLE IF NOT EXISTS promotions (
        id INTEGER PRIMARY KEY ${autoInc},
        title TEXT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, ignoreErr);
    const settingsTableSql = db.isMysql
        ? `CREATE TABLE IF NOT EXISTS settings(
        \`key\` VARCHAR(255) PRIMARY KEY,
        value TEXT
    )`
        : `CREATE TABLE IF NOT EXISTS settings(
        key TEXT PRIMARY KEY,
        value TEXT
    )`;
    db.run(settingsTableSql, ignoreErr);

    // Push Subscriptions
    db.run(`CREATE TABLE IF NOT EXISTS push_subscriptions (
        id INTEGER PRIMARY KEY ${autoInc},
        user_id INT,
        endpoint TEXT NOT NULL,
        \`keys\` TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, ignoreErr);
});

// Static Files
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/client', express.static(path.join(__dirname, 'client')));
app.use('/admin', authenticateAdminPage, express.static(path.join(__dirname, 'admin')));

// Routes
// Public Settings Route (Theme)
app.get('/api/settings/public', (req, res) => {
    req.db.all("SELECT `key`, value FROM settings WHERE `key` IN ('client_theme', 'client_theme_colors')", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const result = { client_theme: 'nail' };
        rows.forEach(r => {
            result[r.key] = r.value;
        });
        res.json(result);
    });
});

app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/services', require('./server/routes/services'));
app.use('/api/schedules', require('./server/routes/schedules'));
app.use('/api/appointments', require('./server/routes/appointments'));
app.use('/api/admin', require('./server/routes/admin'));
app.use('/api/notifications', require('./server/routes/notifications'));
app.use('/api/push', require('./server/routes/push'));
app.use('/api/quiz', require('./server/routes/quiz'));
app.use('/api/promotions', require('./server/routes/promotions'));

// Root Redirect
app.get('/', (req, res) => {
    res.redirect('/client');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
