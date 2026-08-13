import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun } from '../db/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'syncbooth_default_secret_key_2026';

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Input validation
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ success: false, error: 'Please provide a valid name.' });
        }

        if (!email || !isValidEmail(email.trim())) {
            return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
        }

        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const existingUser = await dbGet('SELECT id FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'An account with this email address already exists.' });
        }

        // Hash password securely
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await dbRun(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name.trim(), normalizedEmail, passwordHash]
        );

        const userId = result.lastID;
        const newUser = await dbGet('SELECT id, name, email, created_at FROM users WHERE id = ?', [userId]);

        // Generate JWT token
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(201).json({
            success: true,
            data: {
                token,
                user: newUser
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error during registration.' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, error: 'Please enter your email address.' });
        }

        if (!password) {
            return res.status(400).json({ success: false, error: 'Please enter your password.' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Fetch user from DB
        const user = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        // Compare password with hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        const userProfile = {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at
        };

        return res.status(200).json({
            success: true,
            data: {
                token,
                user: userProfile
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error during login.' });
    }
};

export const getMe = async (req, res) => {
    return res.status(200).json({
        success: true,
        data: req.user
    });
};

export const logout = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};
