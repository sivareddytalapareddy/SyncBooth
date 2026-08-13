import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export const RegisterPage = ({ onNavigateToLogin, onGoHome, onSuccessRegister }) => {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const cleanName = name.trim();
        const cleanEmail = email.trim();

        if (!cleanName) {
            setError('Please enter your full name.');
            return;
        }

        if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!password || password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match. Please re-enter your password.');
            return;
        }

        setIsLoading(true);
        try {
            await register(cleanName, cleanEmail, password);
            if (onSuccessRegister) {
                onSuccessRegister();
            } else {
                onGoHome();
            }
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="view-section auth-container">
            <div className="auth-card glass-card">
                <div className="auth-header">
                    <div className="auth-logo" onClick={onGoHome} role="button" tabIndex={0}>
                        photobooth <span className="logo-badge">SYNC</span>
                    </div>
                    <h2>Create Account</h2>
                    <p className="auth-subtitle">Join SyncBooth to start collaborative video photobooth sessions.</p>
                </div>

                {error && (
                    <div className="error-banner">
                        <span><i className="fa-solid fa-circle-exclamation"></i> {error}</span>
                        <button onClick={() => setError('')} className="close-err-btn">&times;</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="reg-name">Full Name</label>
                        <input
                            id="reg-name"
                            type="text"
                            placeholder="Alex Morgan"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-email">Email Address</label>
                        <input
                            id="reg-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-password">Password (min 6 characters)</label>
                        <input
                            id="reg-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-confirm-password">Confirm Password</label>
                        <input
                            id="reg-confirm-password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-block" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="loading-spinner-sm"></span> Creating Account...
                            </>
                        ) : (
                            <>
                                Register Account <i className="fa-solid fa-user-plus"></i>
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <button className="auth-link-btn" onClick={onNavigateToLogin}>
                            Sign in here
                        </button>
                    </p>
                    <button className="auth-back-btn" onClick={onGoHome}>
                        <i className="fa-solid fa-arrow-left"></i> Back to Home
                    </button>
                </div>
            </div>
        </main>
    );
};
