const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_production';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });

        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {
    // Requires authenticateToken to be called first to populate req.user
    // We also need to check the DB to be sure, or trust the token if role is formatted there.
    // For better security, checking DB is safer, but checking token is faster. 
    // Let's check DB to be sure about the role.

    const db = req.db;
    const userId = req.user.id;

    db.get('SELECT role FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor.' });
        if (!row || row.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }
        next();
    });
};

module.exports = { authenticateToken, isAdmin };
