import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'syncbooth_jwt_secret_key_2026_change_in_production';

export const requireAuth = async (req, res, next) => {
    let token = null;

    // Check cookies first
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } 
    // Fall back to Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please log in.'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid session. User account no longer exists.'
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired session token.'
        });
    }
};

export const authenticateToken = requireAuth;
export default requireAuth;
