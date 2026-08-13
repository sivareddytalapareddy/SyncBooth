import React from 'react';

export const AboutPage = ({ onGoHome, onNavigateToRegister }) => {
    return (
        <main className="view-section about-container">
            {/* Header Banner */}
            <div className="about-hero">
                <div className="title-badge">EST 2026</div>
                <h1>About SyncBooth</h1>
                <p className="about-tagline">
                    Bridging distances frame-by-frame with low-latency WebRTC technology and synchronized photobooth magic.
                </p>
            </div>

            {/* Grid Section: What is SyncBooth & Problem Solved */}
            <div className="about-grid">
                <div className="about-card glass-card">
                    <div className="card-icon">📸</div>
                    <h2>What is SyncBooth?</h2>
                    <p>
                        <strong>SyncBooth</strong> is a next-generation real-time collaborative photobooth platform that lets singles, couples, friends, and families capture high-definition photobooth strips together — no matter how many miles apart they are.
                    </p>
                    <p>
                        Whether you are in a long-distance relationship, hanging out with friends remotely, or capturing vintage polaroids solo, SyncBooth brings the authentic instant photobooth experience directly to your browser.
                    </p>
                </div>

                <div className="about-card glass-card">
                    <div className="card-icon">⚡</div>
                    <h2>The Problem We Solve</h2>
                    <p>
                        Traditional virtual snapshot apps relay raw camera video feeds through centralized media servers. This introduces painful latency, reduces video clarity, and consumes massive server bandwidth.
                    </p>
                    <p>
                        <strong>SyncBooth</strong> solves this by establishing direct <strong>WebRTC Peer-to-Peer (P2P)</strong> media channels between browsers. Video streams flow directly between participants with ultra-low latency, while a lightweight WebSocket server coordinates snapshot countdowns down to the millisecond.
                    </p>
                </div>
            </div>

            {/* How It Works Flow */}
            <section className="how-it-works-section">
                <h2>How SyncBooth Works</h2>
                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <h3>Create or Join a Room</h3>
                        <p>Generate a private 6-character room code (or instant link) and invite your partner or friend to join instantly.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-number">2</div>
                        <h3>P2P Stream & Filters</h3>
                        <p>Your camera feeds connect peer-to-peer. Choose from 20 live curated CSS filters like Vintage, 90s, Cyberpunk, and Noir.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-number">3</div>
                        <h3>Synchronized Flash</h3>
                        <p>Hit the snap button! A synchronized 3-2-1 countdown triggers on both screens simultaneously to grab the exact same moment.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-number">4</div>
                        <h3>Generate & Download</h3>
                        <p>Our 2D Canvas compositing engine compiles your poses into a beautiful, downloadable high-res photobooth strip.</p>
                    </div>
                </div>
            </section>

            {/* Key Features Highlight Grid */}
            <section className="features-grid-section">
                <h2>Key Features</h2>
                <div className="features-grid">
                    <div className="feature-item">
                        <i className="fa-solid fa-video feature-icon"></i>
                        <div>
                            <h4>Real-Time WebRTC P2P</h4>
                            <p>Direct browser-to-browser media streaming with NAT traversal for crystal-clear video quality.</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <i className="fa-solid fa-wand-magic-sparkles feature-icon"></i>
                        <div>
                            <h4>20 Live Filter Effects</h4>
                            <p>Real-time CSS filter previews applied seamlessly to live feeds and output canvas compositions.</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <i className="fa-solid fa-stopwatch feature-icon"></i>
                        <div>
                            <h4>Synced 3-2-1 Countdown</h4>
                            <p>Socket.IO signaling ensures both participants snap identical timestamps across any distance.</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <i className="fa-solid fa-image feature-icon"></i>
                        <div>
                            <h4>Canvas Strip Generator</h4>
                            <p>Automated vertical photobooth strip composition with classic white borders and signature branding.</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <i className="fa-solid fa-user-lock feature-icon"></i>
                        <div>
                            <h4>Secure User Accounts</h4>
                            <p>Bcrypt password security and JWT authentication to protect your private room sessions and preferences.</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <i className="fa-solid fa-mobile-screen feature-icon"></i>
                        <div>
                            <h4>Fully Responsive Design</h4>
                            <p>Optimized for desktop monitors, laptops, iPad tablets, and mobile smartphones.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Intended Audience & Why Use SyncBooth */}
            <div className="about-grid reverse-mobile">
                <div className="about-card glass-card">
                    <div className="card-icon">🎯</div>
                    <h2>Who SyncBooth Is For</h2>
                    <ul>
                        <li>✨ <strong>Long-Distance Couples</strong> wanting shared keepsake photo strips during video dates.</li>
                        <li>👯 <strong>Best Friends</strong> who want a fun, interactive way to create memory strips remotely.</li>
                        <li>📷 <strong>Solo Photobooth Lovers</strong> seeking nostalgic vintage polaroids and filters.</li>
                        <li>🎉 <strong>Virtual Event Hosts</strong> looking for an engaging icebreaker activity.</li>
                    </ul>
                </div>

                <div className="about-card glass-card highlight-card">
                    <div className="card-icon">💖</div>
                    <h2>Why Choose SyncBooth?</h2>
                    <p>
                        Most video call apps take boring static screenshots. SyncBooth brings back the nostalgic joy of physical arcade photobooths — complete with real-time filter switching, countdown excitement, and printable keepsake strips.
                    </p>
                    <div style={{ marginTop: '20px' }}>
                        <button className="btn" onClick={onNavigateToRegister || onGoHome}>
                            Get Started Now <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mission Statement */}
            <div className="mission-banner">
                <h3>Our Mission</h3>
                <p>
                    "To create intimate, playful, and technology-driven social experiences that bring people closer together, regardless of physical separation."
                </p>
            </div>
        </main>
    );
};
