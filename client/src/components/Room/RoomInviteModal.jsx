import React, { useState } from 'react';
import { getRoomShareUrl } from '../../utils/roomId.js';

export const RoomInviteModal = ({ roomId, roomCode, onEnterBooth }) => {
    const [copied, setCopied] = useState(false);
    const targetCode = roomCode || roomId;
    const shareUrl = getRoomShareUrl(targetCode);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join my SyncBooth session!',
                    text: `Join my private photo booth room code: ${targetCode}`,
                    url: shareUrl
                });
            } catch (err) {
                handleCopyLink();
            }
        } else {
            handleCopyLink();
        }
    };

    return (
        <div className="invite-box">
            <div style={{ fontSize: '3rem', color: 'var(--primary-pink)', marginBottom: '15px' }}>
                <i className="fa-solid fa-heart-circle-plus"></i>
            </div>
            <h2 style={{ color: 'var(--text-dark)', marginBottom: '8px' }}>Room Created Successfully!</h2>
            <p style={{ fontSize: '0.95rem', color: '#666' }}>
                Share this room code or shareable link with your partner to join.
            </p>

            <div style={{ background: '#fff0f5', padding: '12px 20px', borderRadius: '12px', margin: '20px 0', border: '1px solid #ffd1e0' }}>
                <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>ROOM CODE</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '4px', color: 'var(--primary-pink)' }}>
                    {targetCode}
                </div>
            </div>

            <div className="link-display" style={{ marginBottom: '20px' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                    {shareUrl}
                </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                <button 
                    onClick={handleCopyLink}
                    className="btn btn-secondary btn-sm"
                >
                    <i className="fa-solid fa-copy"></i> {copied ? 'Link Copied!' : 'Copy Room Link'}
                </button>
                
                <button 
                    onClick={handleShare}
                    className="btn btn-secondary btn-sm"
                >
                    <i className="fa-solid fa-share-nodes"></i> Share
                </button>

                {onEnterBooth && (
                    <button 
                        onClick={onEnterBooth}
                        className="btn btn-sm"
                    >
                        <i className="fa-solid fa-camera"></i> Enter Booth
                    </button>
                )}
            </div>

            <p style={{ fontSize: '0.85rem', color: '#999' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i>
                Waiting for your partner to connect...
            </p>
        </div>
    );
};

export default RoomInviteModal;
