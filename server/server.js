const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
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
const dbPath = path.resolve(__dirname, 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Enable foreign keys
        db.run("PRAGMA foreign_keys = ON");
    }
});

// Make db accessible to router and ensure schema updates
app.use((req, res, next) => {
    req.db = db;
    next();
});

// AUTO-MIGRATION to add level/xp/avatar if missing
db.serialize(() => {
    db.run("ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1", (err) => { });
    db.run("ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0", (err) => { });
    db.run("ALTER TABLE users ADD COLUMN avatar TEXT", (err) => { });
    db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (err) => { });

    // Create Promotions table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS promotions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Static Files
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve uploads
app.use('/client', express.static(path.join(__dirname, '../client')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/promotions', require('./routes/promotions'));

// Root Redirect
app.get('/', (req, res) => {
    res.redirect('/client');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
