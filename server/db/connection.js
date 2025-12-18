const path = require('path');
require('dotenv').config();

class DBAdapter {
    constructor() {
        // Automatically detect if TiDB/MySQL config is present
        this.isMysql = !!(process.env.TIDB_HOST || process.env.DB_HOST);
        this.client = null;

        if (this.isMysql) {
            console.log('Connecting to TiDB/MySQL...');
            const mysql = require('mysql2');
            this.client = mysql.createPool({
                host: process.env.TIDB_HOST || process.env.DB_HOST,
                user: process.env.TIDB_USER || process.env.DB_USER,
                password: process.env.TIDB_PASSWORD || process.env.DB_PASSWORD,
                database: process.env.TIDB_DATABASE || process.env.DB_NAME,
                port: process.env.TIDB_PORT || process.env.DB_PORT || 4000,
                dateStrings: true,
                ssl: {
                    minVersion: 'TLSv1.2',
                    rejectUnauthorized: true
                },
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                enableKeepAlive: true,
                keepAliveInitialDelay: 0
            });

            // Text if connection works (optional, pool connects lazily mainly)
            this.client.getConnection((err, connection) => {
                if (err) {
                    console.error('Error connecting to TiDB/MySQL:', err.message);
                } else {
                    console.log('Successfully connected to TiDB/MySQL database.');
                    connection.release();
                }
            });

        } else {
            const dbPath = path.resolve(__dirname, 'database.sqlite');
            console.log('Using local SQLite database:', dbPath);
            const sqlite3 = require('sqlite3').verbose();
            this.client = new sqlite3.Database(dbPath, (err) => {
                if (err) console.error('Error opening SQLite DB ' + dbPath + ': ' + err.message);
                else {
                    console.log('Connected to the SQLite database.');
                    this.client.run("PRAGMA foreign_keys = ON");
                }
            });
        }
    }

    // Helper to fix query syntax differences if necessary
    _prepareQuery(sql) {
        if (this.isMysql) {
            // Replace "INSERT OR REPLACE" (SQLite) with "REPLACE" (MySQL/Standard)
            // Note: This is a simple regex, might need more care for complex queries
            return sql.replace(/INSERT OR REPLACE/gi, 'REPLACE');
        }
        return sql;
    }

    run(sql, params, callback) {
        if (!callback && typeof params === 'function') {
            callback = params;
            params = [];
        }

        sql = this._prepareQuery(sql);

        if (this.isMysql) {
            this.client.query(sql, params, function (err, results) {
                if (err) {
                    if (callback) callback(err);
                    return;
                }
                // Bind context for 'this.lastID' and 'this.changes'
                const context = {
                    lastID: results.insertId,
                    changes: results.affectedRows
                };
                if (callback) callback.call(context, null);
            });
        } else {
            this.client.run(sql, params, callback);
        }
    }

    get(sql, params, callback) {
        if (!callback && typeof params === 'function') {
            callback = params;
            params = [];
        }

        sql = this._prepareQuery(sql);

        if (this.isMysql) {
            this.client.query(sql, params, function (err, results) {
                if (err) {
                    if (callback) callback(err);
                    return;
                }
                // MySQL returns array of rows, SQLite get returns single row
                if (callback) callback(null, results[0]);
            });
        } else {
            this.client.get(sql, params, callback);
        }
    }

    all(sql, params, callback) {
        if (!callback && typeof params === 'function') {
            callback = params;
            params = [];
        }

        sql = this._prepareQuery(sql);

        if (this.isMysql) {
            this.client.query(sql, params, function (err, results) {
                if (callback) callback(err, results);
            });
        } else {
            this.client.all(sql, params, callback);
        }
    }

    serialize(callback) {
        if (this.isMysql) {
            // MySQL pool doesn't support serialize in the same way, 
            // but for most init purposes we can just execute the callback.
            // Race conditions might exist if strict ordering is required for async ops inside, 
            // but typical "create table" sequences are usually fine or should be chained promises.
            // For now, executing immediately.
            if (callback) callback();
        } else {
            this.client.serialize(callback);
        }
    }

    prepare(sql) {
        const self = this;
        // Return a mock statement object that delegates to the adapter
        return {
            run: function (...args) {
                // args: (param1, param2, ..., callback)
                const callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
                self.run(sql, args, callback);
                return this;
            },
            finalize: function (callback) {
                if (callback) callback();
            }
        };
    }

    close() {
        if (this.isMysql) {
            this.client.end();
        } else {
            this.client.close();
        }
    }
}

// Export a singleton instance
module.exports = new DBAdapter();
