import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'syncbooth_jwt_secret_key_2026_change_in_production';

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const sendTokenResponse = (res, statusCode, message, user, token) => {
    const isProd = process.env.NODE_ENV === 'production';
    
    // Set HTTP-Only Cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const safeUser = user.toSafeObject ? user.toSafeObject() : {
        _id: user._id,
        id: user._id.toString(),
        username: user.username || user.name,
        email: user.email,
        createdAt: user.createdAt
    };

    return res.status(statusCode).json({
        success: true,
        message,
        data: {
            token,
            user: safeUser
        }
    });
};

export const register = async (req, res) => {
    try {
        const { username, name, email, password } = req.body;
        const targetUsername = (username || name || '').trim();

        // Input validation
        if (!targetUsername || targetUsername.length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username must be at least 2 characters long.' 
            });
        }

        if (!email || !isValidEmail(email.trim())) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid email address.' 
            });
        }

        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters long.' 
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if email already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'An account with this email address already exists.' 
            });
        }

        // Hash password with work factor 10
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Save User
        const newUser = await User.create({
            username: targetUsername,
            email: normalizedEmail,
            passwordHash
        });

        // Generate JWT
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return sendTokenResponse(res, 201, 'Registration successful', newUser, token);
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error during registration.' 
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter your email address.' 
            });
        }

        if (!password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter your password.' 
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find user by email
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password.' 
            });
        }

        // Compare password hash
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password.' 
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return sendTokenResponse(res, 200, 'Login successful', user, token);
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error during login.' 
        });
    }
};

export const getMe = async (req, res) => {
    const safeUser = req.user.toSafeObject ? req.user.toSafeObject() : {
        _id: req.user._id,
        id: req.user._id.toString(),
        username: req.user.username || req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt
    };

    return res.status(200).json({
        success: true,
        data: safeUser
    });
};

export const logout = async (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax'
    });

    return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

export default { register, login, getMe, logout };
