const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_production';

// REGISTER
router.post('/register', async (req, res) => {
    const { name, email, phone, password } = req.body;
    const db = req.db;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(`INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)`,
            [name, email, phone, hashedPassword],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(409).json({ error: 'Email already registered.' });
                    }
                    return res.status(500).json({ error: err.message });
                }

                const token = jwt.sign({ id: this.lastID, email: email, name: name }, JWT_SECRET, { expiresIn: '7d' });

                // Audit Log
                db.run(`INSERT INTO audit_logs (action, payload, user_id) VALUES (?, ?, ?)`,
                    ['USER_REGISTER', JSON.stringify({ name, email }), this.lastID]
                );

                res.status(201).json({
                    token,
                    user: {
                        id: this.lastID,
                        name: name,
                        email: email,
                        level: 1,
                        xp: 0,
                        role: 'user'
                    }
                });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// LOGIN
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const db = req.db;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        const userPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            level: user.level || 1,
            xp: user.xp || 0,
            avatar: user.avatar,
            role: user.role || 'user'
        };

        const cookieOptions = {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        };

        if (userPayload.role === 'admin') {
            res.cookie('admin_token', token, cookieOptions);
        } else {
            res.clearCookie('admin_token');
        }

        res.json({
            token,
            user: userPayload
        });
    });
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// GET CURRENT USER
router.get('/me', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'No token' });

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        const db = req.db;

        db.get(`SELECT id, name, email, phone, level, xp, avatar, role FROM users WHERE id = ?`, [decoded.id], (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        });
    } catch (e) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// UPLOAD AVATAR
router.post('/avatar', (req, res) => {
    console.log('[UPLOAD] /avatar request received');
    const token = req.headers['authorization'];
    if (!token) {
        console.error('[UPLOAD] No token provided');
        return res.status(401).json({ error: 'No token' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        console.log(`[UPLOAD] User authenticated: ${decoded.id}`);

        const db = req.db;
        const uploadSingle = upload.single('avatar');

        uploadSingle(req, res, function (err) {
            if (err) {
                console.error('[UPLOAD] Multer error:', err);
                return res.status(500).json({ error: `Multer Error: ${err.message}` });
            }
            if (!req.file) {
                console.error('[UPLOAD] No file in request');
                return res.status(400).json({ error: 'No file uploaded' });
            }

            console.log(`[UPLOAD] File received: ${req.file.filename}`);
            const avatarPath = 'uploads/' + req.file.filename;

            db.run(`UPDATE users SET avatar = ? WHERE id = ?`, [avatarPath, decoded.id], function (err) {
                if (err) {
                    console.error('[UPLOAD] DB Update failed:', err);
                    return res.status(500).json({ error: err.message });
                }
                console.log(`[UPLOAD] Success! User ${decoded.id} updated.`);
                res.json({ message: 'Avatar updated', avatar: avatarPath });
            });
        });

    } catch (e) {
        console.error('[UPLOAD] Token verification failed:', e);
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
