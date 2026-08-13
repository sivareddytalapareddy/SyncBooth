import React, { useEffect, useState, useCallback } from 'react';
import { useCamera } from '../../hooks/useCamera.js';
import { useWebRTC } from '../../hooks/useWebRTC.js';

import { CameraView } from '../../components/Camera/CameraView.jsx';
import { FilterSelector } from '../../components/FilterSelector/FilterSelector.jsx';
import { PhotoGallery } from '../../components/PhotoGallery/PhotoGallery.jsx';
import { RoomHeader } from '../../components/Room/RoomHeader.jsx';
import { RoomInviteModal } from '../../components/Room/RoomInviteModal.jsx';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage.jsx';
import { Loading } from '../../components/Loading/Loading.jsx';

import { FILTERS } from '../../utils/filters.js';
import { getStoredFilter, setStoredFilter } from '../../utils/storage.js';

export const SharedBoothPage = ({
    roomId,
    roomCode,
    room,
    roomStatus,
    roomError,
    peerFilter,
    isCountdownActive,
    partnerDisconnected,
    setIsCountdownActive,
    triggerCountdown,
    broadcastFilter,
    onLeaveRoom,
    username
}) => {
    const activeRoomCode = roomCode || roomId;
    const { stream: localStream, error: cameraError, loading: cameraLoading, startCamera, stopCamera } = useCamera();
    const { remoteStream } = useWebRTC(localStream, activeRoomCode);

    const [activeFilter, setActiveFilter] = useState(() => {
        const stored = getStoredFilter();
        return FILTERS.find(f => f.class === stored) || FILTERS[0];
    });

    const [photos, setPhotos] = useState([]);
    const [isCapturing, setIsCapturing] = useState(false);

    // Initialize local camera
    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, [startCamera, stopCamera]);

    // Handle peer filter change
    useEffect(() => {
        if (peerFilter) {
            const matched = FILTERS.find(f => f.class === peerFilter.filterClass);
            if (matched) {
                setActiveFilter(matched);
            }
        }
    }, [peerFilter]);

    const handleSelectFilter = (filterObj) => {
        setActiveFilter(filterObj);
        setStoredFilter(filterObj.class);
        broadcastFilter(filterObj);
    };

    const handleSnapClick = () => {
        if (isCapturing || isCountdownActive || !localStream) return;
        // Trigger synchronized countdown via Socket.IO
        triggerCountdown();
    };

    const handlePhotoCaptured = useCallback((dataUrl) => {
        setPhotos((prev) => {
            const updated = [...prev, dataUrl];
            if (updated.length > 5) {
                return updated.slice(updated.length - 5);
            }
            return updated;
        });
    }, []);

    const handleCountdownComplete = useCallback(() => {
        setIsCountdownActive(false);
        setIsCapturing(false);
    }, [setIsCountdownActive]);

    const participantCount = room && room.participants ? room.participants.length : 1;

    return (
        <div className="view-section booth-container">
            <RoomHeader
                roomId={activeRoomCode}
                roomStatus={roomStatus}
                participantCount={participantCount}
                onLeaveRoom={onLeaveRoom}
            />

            <ErrorMessage message={roomError || cameraError} />

            {partnerDisconnected && (
                <div className="error-banner" style={{ background: '#fff5f5', borderLeft: '4px solid #e53e3e', padding: '12px 16px', margin: '10px auto', maxWidth: '600px', borderRadius: '8px' }}>
                    <span style={{ color: '#c53030', fontWeight: 600 }}>
                        <i className="fa-solid fa-user-slash" style={{ marginRight: '8px' }}></i>
                        Your partner disconnected. Waiting for partner to reconnect...
                    </span>
                </div>
            )}

            {cameraLoading && <Loading text="Initializing local camera..." />}

            {/* Waiting for second participant modal */}
            {roomStatus === 'WAITING' && (
                <RoomInviteModal roomId={activeRoomCode} roomCode={activeRoomCode} />
            )}

            {/* Booth active view when connected or capturing */}
            {roomStatus !== 'WAITING' && !cameraLoading && (
                <>
                    <CameraView
                        localStream={localStream}
                        remoteStream={remoteStream}
                        isSoloMode={false}
                        activeFilter={activeFilter}
                        isCapturing={isCapturing}
                        isCountdownActive={isCountdownActive}
                        onCountdownComplete={handleCountdownComplete}
                        onPhotoCaptured={handlePhotoCaptured}
                    />

                    <div className="controls">
                        <FilterSelector
                            activeFilterClass={activeFilter.class}
                            onSelectFilter={handleSelectFilter}
                        />

                        <button
                            className="snap-btn"
                            onClick={handleSnapClick}
                            disabled={isCapturing || isCountdownActive}
                            title="Synchronized Photo Capture"
                        >
                            <i className="fa-solid fa-camera-retro"></i>
                        </button>
                    </div>

                    <PhotoGallery photos={photos} isSoloMode={false} roomCode={activeRoomCode} />
                </>
            )}
        </div>
    );
};

export default SharedBoothPage;
