import React, { useState } from 'react';
import { isValidRoomCode } from '../../utils/roomId.js';
import { getStoredUsername, setStoredUsername } from '../../utils/storage.js';

export const HomePage = ({ onSelectSolo, onCreateShared, onJoinShared, error, onClearError }) => {
    const [roomInput, setRoomInput] = useState('');
    const [username, setUsername] = useState(getStoredUsername() || 'Guest');
    const [validationErr, setValidationErr] = useState('');

    const handleJoinSubmit = (e) => {
        e.preventDefault();
        setValidationErr('');

        const cleanCode = roomInput.trim().toUpperCase();
        if (!isValidRoomCode(cleanCode)) {
            setValidationErr('Please enter a valid 6-character room code (e.g. A7K92P)');
            return;
        }

        setStoredUsername(username);
        onJoinShared(cleanCode, username);
    };

    const handleCreateClick = () => {
        setStoredUsername(username);
        onCreateShared(username);
    };

    const handleSoloClick = () => {
        setStoredUsername(username);
        onSelectSolo(username);
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
                <span className="year-tag">2025</span>
            </div>

            <p className="subtitle">
                Step back in time. Capture memories solo or share the flash with someone miles away in real time.
            </p>

            {/* Optional Name Input */}
            <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>Your Name:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #ffd1e0', outline: 'none', fontSize: '0.9rem' }}
                />
            </div>

            {/* Mode Selection Buttons */}
            <div className="mode-selection">
                <button className="btn" onClick={handleSoloClick}>
                    <i className="fa-solid fa-user"></i> Solo Booth
                </button>
                <button className="btn" onClick={handleCreateClick}>
                    <i className="fa-solid fa-user-group"></i> Create Shared Booth
                </button>
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
                        Join Room
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
