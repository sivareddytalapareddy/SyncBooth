import React, { useEffect, useState, useCallback } from 'react';
import { useCamera } from '../../hooks/useCamera.js';
import { CameraView } from '../../components/Camera/CameraView.jsx';
import { FilterSelector } from '../../components/FilterSelector/FilterSelector.jsx';
import { PhotoGallery } from '../../components/PhotoGallery/PhotoGallery.jsx';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage.jsx';
import { Loading } from '../../components/Loading/Loading.jsx';
import { FILTERS } from '../../utils/filters.js';
import { getStoredFilter, setStoredFilter } from '../../utils/storage.js';

export const SoloBoothPage = ({ onGoHome }) => {
    const { stream, error: cameraError, loading: cameraLoading, startCamera, stopCamera } = useCamera();
    const [activeFilter, setActiveFilter] = useState(() => {
        const stored = getStoredFilter();
        return FILTERS.find(f => f.class === stored) || FILTERS[0];
    });
    const [photos, setPhotos] = useState([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isCountdownActive, setIsCountdownActive] = useState(false);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, [startCamera, stopCamera]);

    const handleSelectFilter = (filterObj) => {
        setActiveFilter(filterObj);
        setStoredFilter(filterObj.class);
    };

    const handleSnapClick = () => {
        if (isCapturing || isCountdownActive || !stream) return;
        setIsCountdownActive(true);
        setIsCapturing(true);
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
    }, []);

    return (
        <div className="view-section booth-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '20px' }}>
                <button className="btn btn-secondary" onClick={onGoHome} style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                    <i className="fa-solid fa-arrow-left"></i> Back to Home
                </button>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-dark)' }}>Solo Photobooth</h2>
            </div>

            <ErrorMessage message={cameraError} />

            {cameraLoading && <Loading text="Initializing camera..." />}

            {!cameraLoading && stream && (
                <>
                    <CameraView
                        localStream={stream}
                        remoteStream={null}
                        isSoloMode={true}
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
                            title="Capture Photo"
                        >
                            <i className="fa-solid fa-camera-retro"></i>
                        </button>
                    </div>

                    <PhotoGallery photos={photos} isSoloMode={true} />
                </>
            )}
        </div>
    );
};
