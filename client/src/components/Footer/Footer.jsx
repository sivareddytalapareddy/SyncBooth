import React, { useState } from 'react';

export const Footer = ({ onNavigate, isAuthenticated, user }) => {
    const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | null

    const handleCloseModal = () => setActiveModal(null);

    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Column 1: Brand & Description */}
                    <div className="footer-col brand-col">
                        <div className="footer-logo" onClick={() => onNavigate('home')} role="button" tabIndex={0}>
                            photobooth <span className="logo-badge">SYNC</span>
                        </div>
                        <p className="footer-desc">
                            SyncBooth is a real-time WebRTC collaborative photobooth enabling friends and partners anywhere in the world to capture synchronized photo strips.
                        </p>
                        <div className="footer-socials">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                <i className="fa-brands fa-github"></i>
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                <i className="fa-brands fa-linkedin"></i>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <i className="fa-brands fa-instagram"></i>
                            </a>
                            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
                                <i className="fa-brands fa-x-twitter"></i>
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><button onClick={() => onNavigate('home')}>Home</button></li>
                            <li><button onClick={() => onNavigate('about')}>About</button></li>
                            {isAuthenticated ? (
                                <>
                                    <li><button onClick={() => onNavigate('solo')}>Solo Booth</button></li>
                                    <li><button onClick={() => onNavigate('profile')}>My Profile ({user?.name})</button></li>
                                </>
                            ) : (
                                <>
                                    <li><button onClick={() => onNavigate('login')}>Sign In</button></li>
                                    <li><button onClick={() => onNavigate('register')}>Register Account</button></li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Column 3: Contact Details (Configurable Placeholders) */}
                    <div className="footer-col">
                        <h4>Contact Us</h4>
                        <ul className="footer-contact-list">
                            <li>
                                <i className="fa-solid fa-envelope"></i>
                                <span>support@syncbooth.app</span>
                            </li>
                            <li>
                                <i className="fa-solid fa-phone"></i>
                                <span>+1 (800) 555-SYNC</span>
                            </li>
                            <li>
                                <i className="fa-solid fa-location-dot"></i>
                                <span>San Francisco, CA 94105</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Legal & Policies */}
                    <div className="footer-col">
                        <h4>Legal</h4>
                        <ul className="footer-links">
                            <li><button onClick={() => setActiveModal('privacy')}>Privacy Policy</button></li>
                            <li><button onClick={() => setActiveModal('terms')}>Terms of Service</button></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 SyncBooth. All rights reserved.</p>
                </div>
            </div>

            {/* Legal Modals */}
            {activeModal && (
                <div className="modal-backdrop" onClick={handleCloseModal}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{activeModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}</h3>
                            <button className="modal-close" onClick={handleCloseModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {activeModal === 'privacy' ? (
                                <>
                                    <p>At <strong>SyncBooth</strong>, your privacy is our top priority.</p>
                                    <p>1. <strong>Direct Peer-to-Peer Streaming:</strong> Video streams are transmitted directly between participants using encrypted WebRTC media channels and are never stored on our servers.</p>
                                    <p>2. <strong>Account Security:</strong> Passwords are salted and hashed using industry-standard <code>bcrypt</code> encryption. We never store plain-text credentials.</p>
                                    <p>3. <strong>Data Protection:</strong> We do not sell or monetize personal user data or media captures to third parties.</p>
                                </>
                            ) : (
                                <>
                                    <p>Welcome to <strong>SyncBooth</strong>. By using our service, you agree to these terms.</p>
                                    <p>1. <strong>Acceptable Use:</strong> Users agree to respect peer participants and refrain from transmitting prohibited or unlawful media content.</p>
                                    <p>2. <strong>Service Availability:</strong> SyncBooth is provided "as is". We continuously work to maintain high availability and low-latency signaling channels.</p>
                                    <p>3. <strong>Intellectual Property:</strong> All photo strips generated using SyncBooth belong to the respective capturing participants.</p>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
};
