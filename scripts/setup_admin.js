const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../server/db/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Checking table schema...");
db.all("PRAGMA table_info(users)", (err, rows) => {
    if (err) {
        console.error("Error getting schema:", err);
        return;
    }
    console.log("Schema columns:", rows.map(r => r.name));

    const roleExists = rows.some(r => r.name === 'role');
    if (!roleExists) {
        console.log("Role column missing! Migration failed or hasn't run.");
        // Attempt to add it manually here if needed, but preferable to let server do it.
        return;
    }

    db.all("SELECT id, name, email, role FROM users", (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("Users found:", rows);
        if (rows.length > 0) {
            // Promote the first user
            const userToPromote = rows[0];
            console.log(`Promoting user ${userToPromote.email} (ID: ${userToPromote.id}) to admin...`);

            db.run("UPDATE users SET role = 'admin' WHERE id = ?", [userToPromote.id], (err) => {
                if (err) console.error(err);
                else console.log("Success! " + userToPromote.email + " is now admin.");
            });
        } else {
            console.log("No users found.");
        }
    });
});
