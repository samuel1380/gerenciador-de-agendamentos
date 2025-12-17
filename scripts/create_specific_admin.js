const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, '../server/db/database.sqlite');
const db = new sqlite3.Database(dbPath);

const email = 'samuelmaislegal345@gmail.com';
const password = '996131580s';
const name = 'Admin Samuel';

async function createAdmin() {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.serialize(() => {
        // Check if user exists
        db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, row) => {
            if (err) {
                console.error(err);
                return;
            }

            if (row) {
                console.log('User exists. Updating to admin...');
                // Update to admin and set password
                db.run(`UPDATE users SET password_hash = ?, role = 'admin', name = ? WHERE email = ?`,
                    [hashedPassword, name, email],
                    (err) => {
                        if (err) console.error(err.message);
                        else console.log(`Admin updated successfully: ${email}`);
                    }
                );
            } else {
                console.log('Creating new admin user...');
                // Insert new admin
                db.run(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`,
                    [name, email, hashedPassword],
                    (err) => {
                        if (err) console.error(err.message);
                        else console.log(`Admin created successfully: ${email}`);
                    }
                );
            }
        });
    });
}

createAdmin();
