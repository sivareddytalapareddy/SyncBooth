import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export const ProfilePage = ({ onGoHome, onSelectSolo, onCreateShared }) => {
    const { user, logout } = useAuth();

    if (!user) return null;

    const formattedDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Member';

    return (
        <main className="view-section profile-container">
            <div className="profile-card glass-card">
                <div className="profile-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h2>{user.name}</h2>
                <p className="profile-email"><i className="fa-solid fa-envelope"></i> {user.email}</p>
                <div className="profile-badge">
                    <i className="fa-solid fa-calendar-days"></i> Joined {formattedDate}
                </div>

                <div className="profile-actions">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons">
                        <button className="btn" onClick={() => onCreateShared(user.name)}>
                            <i className="fa-solid fa-user-group"></i> Create Shared Booth
                        </button>
                        <button className="btn btn-secondary" onClick={() => onSelectSolo(user.name)}>
                            <i className="fa-solid fa-user"></i> Solo Booth
                        </button>
                    </div>
                </div>

                <div className="profile-footer">
                    <button className="btn btn-logout" onClick={logout}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
                    </button>
                </div>
            </div>
        </main>
    );
};
