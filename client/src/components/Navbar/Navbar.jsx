import React from 'react';

export const Navbar = ({ onGoHome, currentView }) => {
    return (
        <header>
            <div className="top-bar">
                ✨ SyncBooth — Real-Time Collaborative Photo Booth for Singles & Couples ✨
            </div>
            <div className="navbar-container">
                <nav className="navbar">
                    <div className="logo" onClick={onGoHome} role="button" tabIndex={0}>
                        photobooth
                        <span className="logo-badge">SYNC</span>
                    </div>
                    <ul className="nav-links">
                        <li>
                            <button 
                                className={currentView === 'home' ? 'active' : ''} 
                                onClick={onGoHome}
                            >
                                Home
                            </button>
                        </li>
                        <li>
                            <a href="#about" onClick={(e) => { e.preventDefault(); alert("SyncBooth is a real-time WebRTC collaborative photo booth project."); }}>
                                About
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};
