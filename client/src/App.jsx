import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar/Navbar.jsx';
import { HomePage } from './pages/Home/HomePage.jsx';
import { SoloBoothPage } from './pages/SoloBooth/SoloBoothPage.jsx';
import { SharedBoothPage } from './pages/SharedBooth/SharedBoothPage.jsx';
import { useRoom } from './hooks/useRoom.js';
import { getStoredUsername } from './utils/storage.js';

export function App() {
    const [view, setView] = useState('home'); // 'home' | 'solo' | 'shared'
    const [username, setUsername] = useState(() => getStoredUsername() || 'Guest');

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

    // Detect URL query parameter for room code (e.g. ?room=A7K92P)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const roomCode = urlParams.get('room');
        if (roomCode) {
            joinRoom(roomCode);
            setView('shared');
        }
    }, [joinRoom]);

    const handleSelectSolo = (name) => {
        if (name) setUsername(name);
        setView('solo');
    };

    const handleCreateShared = async (name) => {
        if (name) setUsername(name);
        const createdId = await createNewRoom();
        if (createdId) {
            setView('shared');
        }
    };

    const handleJoinShared = (code, name) => {
        if (name) setUsername(name);
        joinRoom(code);
        setView('shared');
    };

    const handleGoHome = () => {
        if (view === 'shared') {
            leaveRoom();
        }
        setView('home');
        clearError();
        // Remove room URL param if present
        if (window.location.search) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar onGoHome={handleGoHome} currentView={view} />

            {view === 'home' && (
                <HomePage
                    onSelectSolo={handleSelectSolo}
                    onCreateShared={handleCreateShared}
                    onJoinShared={handleJoinShared}
                    error={roomError}
                    onClearError={clearError}
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
    );
}

export default App;
