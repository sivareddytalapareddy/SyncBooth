import React from 'react';

export const Loading = ({ text = 'Loading...' }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '40px' }}>
            <div className="loading-spinner"></div>
            <p style={{ color: '#666', fontSize: '0.95rem', fontWeight: 500 }}>{text}</p>
        </div>
    );
};
