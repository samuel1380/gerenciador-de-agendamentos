const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../server/db/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Running migrations for Users, Rewards, and Analytics...");

db.serialize(() => {
    // 1. Users Table Updates (Active/Banned status)
    db.run("ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT 1", (err) => {
        if (err && !err.message.includes("duplicate column")) console.error("Error adding active to users:", err.message);
        else console.log("Added 'active' column to users.");
    });

    // 2. Rewards Table
    db.run(`CREATE TABLE IF NOT EXISTS rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        cost INTEGER NOT NULL,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 3. User Rewards (Redemption History)
    db.run(`CREATE TABLE IF NOT EXISTS user_rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        reward_id INTEGER NOT NULL,
        code TEXT NOT NULL,
        status TEXT DEFAULT 'active', -- active, used, expired
        redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(reward_id) REFERENCES rewards(id)
    )`);

    console.log("Tables created/updated.");
});

db.close(() => console.log("Migration complete."));
