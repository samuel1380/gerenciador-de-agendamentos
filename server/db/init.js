const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const serialize = () => {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password_hash TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            xp INTEGER DEFAULT 0,
            avatar TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Services Table
        db.run(`CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            price REAL NOT NULL,
            duration_minutes INTEGER NOT NULL,
            image TEXT,
            description TEXT,
            active BOOLEAN DEFAULT 1
        )`);

        // Schedules Table (Base availability)
        db.run(`CREATE TABLE IF NOT EXISTS schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT, -- YYYY-MM-DD, NULL for recurring defaults if implemented later, but for now specific dates or just logic
            time TEXT NOT NULL, -- HH:MM
            slot_label TEXT,
            available BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Appointments Table
        db.run(`CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            service_id INTEGER NOT NULL,
            date TEXT NOT NULL, -- YYYY-MM-DD
            time TEXT NOT NULL, -- HH:MM
            status TEXT CHECK(status IN ('pending','accepted','rejected','completed','cancelled')) DEFAULT 'pending',
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(service_id) REFERENCES services(id)
        )`);

        // Notifications Table
        db.run(`CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Settings Table
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )`);

        // Audit Logs
        db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            payload TEXT,
            user_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        console.log("Tables created defined.");

        // SEEDING
        db.get("SELECT count(*) as count FROM services", (err, row) => {
            if (row.count === 0) {
                const stmt = db.prepare("INSERT INTO services (title, price, duration_minutes, image, description) VALUES (?, ?, ?, ?, ?)");
                stmt.run("Manicure Completa", 35.00, 45, "assets/service1.jpg", "Cutilagem e esmaltação completa.");
                stmt.run("Pedicure Simples", 30.00, 40, "assets/service2.jpg", "Cutilagem e esmaltação dos pés.");
                stmt.run("Spa dos Pés", 50.00, 60, "assets/service3.jpg", "Hidratação profunda, esfoliação e massagem.");
                stmt.finalize();
                console.log("Services seeded.");
            }
        });

        // Seed some admin/default schedules if needed, or leave for logic. 
        // Let's seed some example slots for the next few days to ensure the demo works correctly.
        // We will seed slots for "tomorrow"
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        db.run(`INSERT OR IGNORE INTO schedules (date, time, slot_label, available) VALUES 
            ('${dateStr}', '09:00', '09:00 - 10:00', 1),
            ('${dateStr}', '10:00', '10:00 - 11:00', 1),
            ('${dateStr}', '14:00', '14:00 - 15:00', 1),
            ('${dateStr}', '15:00', '15:00 - 16:00', 1)
        `, (err) => {
            if (!err) console.log("Schedules seeded for " + dateStr);
        });

        // Seed default settings
        db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES 
            ('quiz_daily_limit', '3'),
            ('quiz_xp_reward', '50'),
            ('appointment_xp_reward', '100'),
            ('xp_per_level', '200')
        `, (err) => {
            if (!err) console.log("Default settings seeded.");
        });
    });
};

serialize();

db.close();
