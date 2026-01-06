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

    // Use correct auto-increment keyword
    const autoInc = db.isMysql ? "AUTO_INCREMENT" : "AUTOINCREMENT";

    // 1. Users
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY ${autoInc},
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        avatar TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        active BOOLEAN DEFAULT 1
    )`, ignoreErr);

    // Ensure columns exist (for migration from older versions)
    db.run("ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1", ignoreErr);
    db.run("ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0", ignoreErr);
    db.run("ALTER TABLE users ADD COLUMN avatar TEXT", ignoreErr);
    db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", ignoreErr);

    // 2. Services
    db.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY ${autoInc},
        title TEXT NOT NULL,
        price REAL NOT NULL,
        duration_minutes INTEGER NOT NULL,
        image TEXT,
        description TEXT,
        active BOOLEAN DEFAULT 1
    )`, ignoreErr);

    // 3. Schedules
    db.run(`CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY ${autoInc},
        date TEXT,
        time TEXT NOT NULL,
        slot_label TEXT,
        available BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, ignoreErr);

    // 4. Appointments
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY ${autoInc},
        user_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, ignoreErr);

    // 5. Notifications
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY ${autoInc},
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, ignoreErr);

    // 6. Audit Logs
    db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY ${autoInc},
        action TEXT NOT NULL,
        payload TEXT,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, ignoreErr);

    // 7. Promotions
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

// Dynamic Manifest for PWA Customization
app.get('/client/manifest.json', (req, res) => {
    req.db.get("SELECT value FROM settings WHERE `key` = 'notification_icon_url'", (err, row) => {
        const iconUrl = (row && row.value) ? row.value : 'icons/icon-192.png';

        const manifest = {
            "name": "Manicure",
            "short_name": "Manicure",
            "start_url": "./home.html",
            "display": "standalone",
            "background_color": "#ffffff",
            "theme_color": "#ffffff",
            "icons": [
                {
                    "src": iconUrl,
                    "sizes": "192x192",
                    "type": "image/png"
                },
                {
                    "src": iconUrl,
                    "sizes": "512x512",
                    "type": "image/png"
                }
            ]
        };

        res.json(manifest);
    });
});

// Static Files
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/client', express.static(path.join(__dirname, 'client')));
app.use('/admin', authenticateAdminPage, express.static(path.join(__dirname, 'admin')));

// Routes
// Public Settings Route (Theme)
app.get('/api/settings/public', (req, res) => {
    req.db.all("SELECT `key`, value FROM settings WHERE `key` IN ('client_theme', 'client_theme_colors', 'notification_icon_url')", [], (err, rows) => {
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
