import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Navbar } from './components/Navbar/Navbar.jsx';
import { Footer } from './components/Footer/Footer.jsx';
import { HomePage } from './pages/Home/HomePage.jsx';
import { AboutPage } from './pages/About/AboutPage.jsx';
import { LoginPage } from './pages/Auth/LoginPage.jsx';
import { RegisterPage } from './pages/Auth/RegisterPage.jsx';
import { ProfilePage } from './pages/Profile/ProfilePage.jsx';
import { SoloBoothPage } from './pages/SoloBooth/SoloBoothPage.jsx';
import { SharedBoothPage } from './pages/SharedBooth/SharedBoothPage.jsx';
import { useRoom } from './hooks/useRoom.js';
import { getStoredUsername, setStoredUsername } from './utils/storage.js';

function MainApp() {
    const [view, setView] = useState('home'); // 'home' | 'about' | 'login' | 'register' | 'profile' | 'solo' | 'shared'
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    
    // Determine active username from auth or localStorage guest name
    const activeUsername = user?.name || getStoredUsername() || 'Guest';
    const [username, setUsername] = useState(activeUsername);

    useEffect(() => {
        if (user?.name) {
            setUsername(user.name);
            setStoredUsername(user.name);
        }
    }, [user]);

    const {
        roomId,
        room,
        roomStatus,
        error: roomError,
        peerFilter,
        isCountdownActive,
        setIsCountdownActive,
        createNewRoom,
        joinRoom,
        leaveRoom,
        triggerCountdown,
        broadcastFilter,
        clearError
    } = useRoom(null, username);

    // Sync URL parameters & direct room link joining
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const roomCode = urlParams.get('room');
        if (roomCode) {
            joinRoom(roomCode);
            setView('shared');
        }
    }, [joinRoom]);

    const handleNavigate = (viewName) => {
        if (view === 'shared') {
            leaveRoom();
        }
        setView(viewName);
        clearError();

        // Clean room URL param if leaving room
        if (window.location.search && viewName !== 'shared') {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    const handleSelectSolo = (name) => {
        if (name) {
            setUsername(name);
            setStoredUsername(name);
        }
        setView('solo');
    };

    const handleCreateShared = async (name) => {
        if (name) {
            setUsername(name);
            setStoredUsername(name);
        }
        const createdId = await createNewRoom();
        if (createdId) {
            setView('shared');
        }
    };

    const handleJoinShared = (code, name) => {
        if (name) {
            setUsername(name);
            setStoredUsername(name);
        }
        joinRoom(code);
        setView('shared');
    };

    const handleGoHome = () => {
        handleNavigate('home');
    };

    // Avoid initial flash while checking authentication state
    if (isAuthLoading) {
        return (
            <div className="auth-loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading SyncBooth...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar onNavigate={handleNavigate} currentView={view} />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {view === 'home' && (
                    <HomePage
                        onSelectSolo={handleSelectSolo}
                        onCreateShared={handleCreateShared}
                        onJoinShared={handleJoinShared}
                        error={roomError}
                        onClearError={clearError}
                    />
                )}

                {view === 'about' && (
                    <AboutPage
                        onGoHome={handleGoHome}
                        onNavigateToRegister={() => handleNavigate('register')}
                    />
                )}

                {view === 'login' && (
                    <LoginPage
                        onNavigateToRegister={() => handleNavigate('register')}
                        onGoHome={handleGoHome}
                        onSuccessLogin={() => handleNavigate('home')}
                    />
                )}

                {view === 'register' && (
                    <RegisterPage
                        onNavigateToLogin={() => handleNavigate('login')}
                        onGoHome={handleGoHome}
                        onSuccessRegister={() => handleNavigate('home')}
                    />
                )}

                {view === 'profile' && isAuthenticated && (
                    <ProfilePage
                        onGoHome={handleGoHome}
                        onSelectSolo={handleSelectSolo}
                        onCreateShared={handleCreateShared}
                    />
                )}

                {view === 'solo' && (
                    <SoloBoothPage onGoHome={handleGoHome} />
                )}

                {view === 'shared' && roomId && (
                    <SharedBoothPage
                        roomId={roomId}
                        room={room}
                        roomStatus={roomStatus}
                        roomError={roomError}
                        peerFilter={peerFilter}
                        isCountdownActive={isCountdownActive}
                        setIsCountdownActive={setIsCountdownActive}
                        triggerCountdown={triggerCountdown}
                        broadcastFilter={broadcastFilter}
                        onLeaveRoom={handleGoHome}
                        username={username}
                    />
                )}
            </div>

            {/* Render Footer on public & profile views */}
            {['home', 'about', 'login', 'register', 'profile'].includes(view) && (
                <Footer
                    onNavigate={handleNavigate}
                    isAuthenticated={isAuthenticated}
                    user={user}
                />
            )}
        </div>
    );
}

export function App() {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
}

export default App;
