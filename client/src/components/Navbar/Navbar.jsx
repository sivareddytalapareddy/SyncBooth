import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export const Navbar = ({ onNavigate, currentView }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    const handleNavClick = (viewName) => {
        onNavigate(viewName);
        setMobileMenuOpen(false);
    };

    const handleLogoutClick = () => {
        logout();
        onNavigate('home');
        setMobileMenuOpen(false);
    };

    return (
        <header>
            <div className="top-bar">
                ✨ SyncBooth — Real-Time Collaborative Photo Booth for Singles & Couples ✨
            </div>
            <div className="navbar-container">
                <nav className="navbar">
                    <div className="logo" onClick={() => handleNavClick('home')} role="button" tabIndex={0}>
                        photobooth
                        <span className="logo-badge">SYNC</span>
                    </div>

                    {/* Mobile Hamburger Toggle Button */}
                    <button 
                        className="mobile-menu-toggle" 
                        onClick={toggleMobileMenu}
                        aria-label="Toggle navigation menu"
                    >
                        <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                    </button>

                    <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                        <li>
                            <button
                                className={currentView === 'home' ? 'active' : ''}
                                onClick={() => handleNavClick('home')}
                            >
                                Home
                            </button>
                        </li>
                        <li>
                            <button
                                className={currentView === 'about' ? 'active' : ''}
                                onClick={() => handleNavClick('about')}
                            >
                                About
                            </button>
                        </li>

                        {isAuthenticated ? (
                            <>
                                <li>
                                    <button
                                        className={currentView === 'solo' ? 'active' : ''}
                                        onClick={() => handleNavClick('solo')}
                                    >
                                        Solo Booth
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={currentView === 'profile' ? 'active' : ''}
                                        onClick={() => handleNavClick('profile')}
                                    >
                                        <i className="fa-solid fa-user-circle"></i> {user?.username || user?.name || 'Profile'}
                                    </button>
                                </li>
                                <li>
                                    <button className="nav-logout-btn" onClick={handleLogoutClick}>
                                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <button
                                        className={currentView === 'login' ? 'active' : ''}
                                        onClick={() => handleNavClick('login')}
                                    >
                                        Login
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={`nav-register-btn ${currentView === 'register' ? 'active' : ''}`}
                                        onClick={() => handleNavClick('register')}
                                    >
                                        Register
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};
