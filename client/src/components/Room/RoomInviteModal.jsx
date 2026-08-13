import React, { useState } from 'react';
import { getRoomShareUrl } from '../../utils/roomId.js';

export const RoomInviteModal = ({ roomId }) => {
    const [copied, setCopied] = useState(false);
    const shareUrl = getRoomShareUrl(roomId);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="invite-box">
            <div style={{ fontSize: '3rem', color: 'var(--primary-pink)', marginBottom: '15px' }}>
                <i className="fa-solid fa-heart-circle-plus"></i>
            </div>
            <h2 style={{ color: 'var(--text-dark)', marginBottom: '8px' }}>Your Booth Room is Ready!</h2>
            <p style={{ fontSize: '0.95rem', color: '#666' }}>
                Share this room code or link with your partner to join.
            </p>

            <div style={{ background: '#fff0f5', padding: '12px 20px', borderRadius: '12px', margin: '20px 0', border: '1px solid #ffd1e0' }}>
                <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>ROOM CODE</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '4px', color: 'var(--primary-pink)' }}>
                    {roomId}
                </div>
            </div>

            <div className="link-display">
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {shareUrl}
                </span>
                <button 
                    onClick={handleCopy}
                    style={{ background: 'var(--gradient-pink)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#999' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i>
                Waiting for second participant to connect...
            </p>
        </div>
    );
};
