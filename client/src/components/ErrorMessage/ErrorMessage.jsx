import React from 'react';

export const ErrorMessage = ({ message, onDismiss }) => {
    if (!message) return null;

    return (
        <div className="error-banner" role="alert">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{message}</span>
            </div>
            {onDismiss && (
                <button 
                    onClick={onDismiss} 
                    style={{ background: 'none', border: 'none', color: '#c53030', cursor: 'pointer', fontSize: '1rem' }}
                    aria-label="Dismiss error"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            )}
        </div>
    );
};
