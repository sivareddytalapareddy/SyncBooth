import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { isValidRoomCode } from '../../utils/roomId.js';

export const HomePage = ({ 
    onSelectSolo, 
    onCreateShared, 
    onJoinShared, 
    onNavigateToLogin,
    onNavigateToRegister,
    error, 
    onClearError 
}) => {
    const { user, isAuthenticated, logout } = useAuth();
    const [roomInput, setRoomInput] = useState('');
    const [validationErr, setValidationErr] = useState('');

    const displayUsername = user?.username || user?.name || 'Guest';

    const handleJoinSubmit = (e) => {
        e.preventDefault();
        setValidationErr('');

        if (!isAuthenticated) {
            onNavigateToLogin();
            return;
        }

        const cleanCode = roomInput.trim().toUpperCase();
        if (!isValidRoomCode(cleanCode)) {
            setValidationErr('Please enter a valid 6-character room code (e.g. A7K92P)');
            return;
        }

        onJoinShared(cleanCode, displayUsername);
    };

    const handleCreateClick = () => {
        if (!isAuthenticated) {
            onNavigateToLogin();
            return;
        }
        onCreateShared(displayUsername);
    };

    const handleSoloClick = () => {
        onSelectSolo(displayUsername);
    };

    return (
        <main className="view-section hero-container">
            <div className="glow-background"></div>

            {/* Left Decorator Strip */}
            <div className="photo-strip strip-left">
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" alt="Vintage Pose" />
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" alt="Vintage Pose" />
                <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80" alt="Vintage Pose" />
            </div>

            {/* Right Decorator Strip */}
            <div className="photo-strip strip-right">
                <img src="https://images.unsplash.com/photo-1492370284958-c20b15c692d2?auto=format&fit=crop&w=200&q=80" alt="Classic Pose" />
                <img src="https://images.unsplash.com/photo-1551310323-0ee24111358d?auto=format&fit=crop&w=200&q=80" alt="Classic Pose" />
                <img src="https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=200&q=80" alt="Classic Pose" />
            </div>

            <div className="title-wrapper">
                <span className="year-tag">EST</span>
                <h1>photobooth</h1>
                <span className="year-tag">2026</span>
            </div>

            <p className="subtitle">
                Step back in time. Capture memories solo or share the flash with someone miles away in real time.
            </p>

            {isAuthenticated ? (
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                        Welcome, <span style={{ color: 'var(--primary-color)' }}>{displayUsername}</span> 👋
                    </h3>
                </div>
            ) : (
                <div className="auth-prompt-bar" style={{ marginBottom: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button className="btn btn-secondary btn-sm" onClick={onNavigateToLogin}>
                        <i className="fa-solid fa-right-to-bracket"></i> Login
                    </button>
                    <button className="btn btn-sm" onClick={onNavigateToRegister}>
                        <i className="fa-solid fa-user-plus"></i> Create Account
                    </button>
                </div>
            )}

            {/* Mode Selection Buttons */}
            <div className="mode-selection">
                <button className="btn" onClick={handleSoloClick}>
                    <i className="fa-solid fa-user"></i> Solo Booth
                </button>
                <button className="btn" onClick={handleCreateClick}>
                    <i className="fa-solid fa-user-group"></i> Create Booth
                </button>
                {isAuthenticated && (
                    <button className="btn btn-outline" onClick={logout}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                    </button>
                )}
            </div>

            {/* Join Room Box */}
            <div className="join-box-card">
                <form onSubmit={handleJoinSubmit} style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <input
                        type="text"
                        className="input-code"
                        placeholder="ROOM CODE"
                        maxLength={6}
                        value={roomInput}
                        onChange={(e) => {
                            setRoomInput(e.target.value.toUpperCase());
                            setValidationErr('');
                            if (onClearError) onClearError();
                        }}
                    />
                    <button type="submit" className="btn btn-secondary">
                        Join Booth
                    </button>
                </form>
            </div>

            {(validationErr || error) && (
                <p style={{ color: '#e53e3e', fontSize: '0.85rem', marginTop: '12px', fontWeight: 500 }}>
                    {validationErr || error}
                </p>
            )}
        </main>
    );
};

export default HomePage;
