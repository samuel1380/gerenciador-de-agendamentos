const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../server/db/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Running manual migration...");

db.serialize(() => {
    db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (err) => {
        if (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("Column 'role' already exists.");
            } else {
                console.error("Error adding column:", err.message);
            }
        } else {
            console.log("Column 'role' added successfully.");
        }
    });
});

db.close();
