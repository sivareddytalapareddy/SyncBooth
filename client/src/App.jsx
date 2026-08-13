import React, { useState, useEffect, useCallback } from 'react';
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
    
    // Determine active username from auth
    const activeUsername = user?.username || user?.name || getStoredUsername() || 'Guest';
    const [username, setUsername] = useState(activeUsername);
    const [pendingRoomCode, setPendingRoomCode] = useState(null);

    useEffect(() => {
        if (user?.username || user?.name) {
            const nameToUse = user.username || user.name;
            setUsername(nameToUse);
            setStoredUsername(nameToUse);
        }
    }, [user]);

    const {
        roomCode,
        roomId,
        room,
        roomStatus,
        error: roomError,
        peerFilter,
        isCountdownActive,
        partnerDisconnected,
        setIsCountdownActive,
        createNewRoom,
        joinRoom,
        leaveRoom,
        triggerCountdown,
        broadcastFilter,
        clearError
    } = useRoom(null, username);

    // Sync URL path & query parameters for direct shareable links (e.g. /room/A7K92P or ?room=A7K92P)
    useEffect(() => {
        if (isAuthLoading) return;

        const path = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        let extractedCode = urlParams.get('room');

        if (!extractedCode && path.startsWith('/room/')) {
            extractedCode = path.replace('/room/', '').trim();
        }

        if (extractedCode) {
            const cleanCode = extractedCode.toUpperCase();
            if (isAuthenticated) {
                joinRoom(cleanCode);
                setView('shared');
            } else {
                setPendingRoomCode(cleanCode);
                setView('login');
            }
        }
    }, [isAuthLoading, isAuthenticated, joinRoom]);

    const handleNavigate = (viewName) => {
        if (view === 'shared') {
            leaveRoom();
        }
        setView(viewName);
        clearError();

        // Clean URL pathname/search if leaving shared booth
        if (viewName !== 'shared') {
            window.history.replaceState({}, document.title, '/');
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
        if (!isAuthenticated) {
            setView('login');
            return;
        }
        if (name) {
            setUsername(name);
            setStoredUsername(name);
        }
        const createdCode = await createNewRoom();
        if (createdCode) {
            window.history.replaceState({}, document.title, `/room/${createdCode}`);
            setView('shared');
        }
    };

    const handleJoinShared = (code, name) => {
        if (!isAuthenticated) {
            setPendingRoomCode(code);
            setView('login');
            return;
        }
        if (name) {
            setUsername(name);
            setStoredUsername(name);
        }
        joinRoom(code);
        window.history.replaceState({}, document.title, `/room/${code}`);
        setView('shared');
    };

    const handleSuccessAuth = useCallback(() => {
        if (pendingRoomCode) {
            const codeToJoin = pendingRoomCode;
            setPendingRoomCode(null);
            joinRoom(codeToJoin);
            window.history.replaceState({}, document.title, `/room/${codeToJoin}`);
            setView('shared');
        } else {
            setView('home');
        }
    }, [pendingRoomCode, joinRoom]);

    const handleGoHome = () => {
        handleNavigate('home');
    };

    // Avoid initial flash while verifying auth session
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
                        onNavigateToLogin={() => handleNavigate('login')}
                        onNavigateToRegister={() => handleNavigate('register')}
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
                        onSuccessLogin={handleSuccessAuth}
                    />
                )}

                {view === 'register' && (
                    <RegisterPage
                        onNavigateToLogin={() => handleNavigate('login')}
                        onGoHome={handleGoHome}
                        onSuccessRegister={handleSuccessAuth}
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

                {view === 'shared' && (roomCode || roomId) && (
                    <SharedBoothPage
                        roomId={roomCode || roomId}
                        roomCode={roomCode || roomId}
                        room={room}
                        roomStatus={roomStatus}
                        roomError={roomError}
                        peerFilter={peerFilter}
                        isCountdownActive={isCountdownActive}
                        partnerDisconnected={partnerDisconnected}
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
