import jwt from 'jsonwebtoken';
import { dbGet } from '../db/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'syncbooth_default_secret_key_2026';

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await dbGet('SELECT id, name, email, created_at FROM users WHERE id = ?', [decoded.id]);

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid authentication session. User not found.' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, error: 'Invalid or expired token.' });
    }
};
