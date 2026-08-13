import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export const LoginPage = ({ onNavigateToRegister, onGoHome, onSuccessLogin }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const cleanEmail = email.trim();
        if (!cleanEmail) {
            setError('Please enter your email address.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!password) {
            setError('Please enter your password.');
            return;
        }

        setIsLoading(true);
        try {
            await login(cleanEmail, password);
            if (onSuccessLogin) {
                onSuccessLogin();
            } else {
                onGoHome();
            }
        } catch (err) {
            setError(err.message || 'Failed to sign in. Please check your credentials.');
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
                    <h2>Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to your SyncBooth account to create shared rooms and manage sessions.</p>
                </div>

                {error && (
                    <div className="error-banner">
                        <span><i className="fa-solid fa-circle-exclamation"></i> {error}</span>
                        <button onClick={() => setError('')} className="close-err-btn">&times;</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="login-email">Email Address</label>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-block" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="loading-spinner-sm"></span> Signing In...
                            </>
                        ) : (
                            <>
                                Sign In <i className="fa-solid fa-right-to-bracket"></i>
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <button className="auth-link-btn" onClick={onNavigateToRegister}>
                            Create one now
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
