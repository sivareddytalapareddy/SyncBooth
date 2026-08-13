import React, { useState } from 'react';
import { getRoomShareUrl } from '../../utils/roomId.js';

export const RoomHeader = ({ roomId, roomStatus, participantCount, onLeaveRoom }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        const url = getRoomShareUrl(roomId);
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="room-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 700, letterSpacing: '1px', fontSize: '1.1rem' }}>
                    ROOM: {roomId}
                </span>
                <span className={`status-badge ${roomStatus === 'CONNECTED' ? 'connected' : 'waiting'}`}>
                    <span className="status-pulse"></span>
                    {roomStatus === 'CONNECTED' ? 'CONNECTED (2/2)' : `WAITING FOR PARTNER (${participantCount}/2)`}
                </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={handleCopyLink} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                    {copied ? <><i className="fa-solid fa-check"></i> Copied!</> : <><i className="fa-solid fa-link"></i> Copy Share Link</>}
                </button>
                <button className="btn btn-secondary" onClick={onLeaveRoom} style={{ padding: '8px 18px', fontSize: '0.85rem', color: '#e53e3e', borderColor: '#feb2b2' }}>
                    <i className="fa-solid fa-right-from-bracket"></i> Leave Room
                </button>
            </div>
        </div>
    );
};
