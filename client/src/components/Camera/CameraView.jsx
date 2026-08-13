import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CountdownOverlay } from '../Countdown/CountdownOverlay.jsx';

export const CameraView = ({
    localStream,
    remoteStream,
    isSoloMode,
    activeFilter,
    isCapturing,
    isCountdownActive,
    onCountdownComplete,
    onPhotoCaptured
}) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const canvasRef = useRef(null);
    const flashRef = useRef(null);

    // Attach local stream to local video element
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Attach remote stream to remote video element
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Execute capture algorithm on canvas
    const executeCapture = useCallback(() => {
        const localVideo = localVideoRef.current;
        const remoteVideo = remoteVideoRef.current;
        const canvas = canvasRef.current;

        if (!localVideo || !canvas) return;

        // Flash animation
        if (flashRef.current) {
            flashRef.current.classList.remove('flashing');
            void flashRef.current.offsetWidth; // force reflow
            flashRef.current.classList.add('flashing');
        }

        const ctx = canvas.getContext('2d');
        const vW = localVideo.videoWidth || 640;
        const vH = localVideo.videoHeight || 480;

        canvas.width = isSoloMode ? vW : (vW * 2);
        canvas.height = vH;

        // Apply filter to canvas context
        ctx.filter = activeFilter ? activeFilter.css : 'none';

        // 1. Draw Local Video (Mirrored)
        ctx.save();
        ctx.translate(vW, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(localVideo, 0, 0, vW, vH);
        ctx.restore();

        // 2. Draw Remote Video if Shared Mode
        if (!isSoloMode && remoteVideo && remoteVideo.srcObject) {
            ctx.save();
            ctx.translate(vW * 2, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(remoteVideo, 0, 0, vW, vH);
            ctx.restore();

            // Draw Divider Line
            ctx.fillStyle = '#000000';
            ctx.fillRect(vW - 3, 0, 6, vH);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        onPhotoCaptured(dataUrl);
    }, [isSoloMode, activeFilter, onPhotoCaptured]);

    const handleCountdownFinish = useCallback(() => {
        executeCapture();
        onCountdownComplete();
    }, [executeCapture, onCountdownComplete]);

    return (
        <div className="camera-container">
            <div className={`split-screen ${isSoloMode ? 'solo-mode' : ''} ${activeFilter ? activeFilter.class : ''}`}>
                {/* Local Camera */}
                <div className="video-wrapper" id="localWrapper">
                    <video ref={localVideoRef} autoPlay playsInline muted />
                    <div className="user-label">You</div>
                </div>

                {/* Divider Line for Shared Mode */}
                {!isSoloMode && <div className="divider" />}

                {/* Remote Camera */}
                {!isSoloMode && (
                    <div className="video-wrapper" id="remoteWrapper">
                        {remoteStream ? (
                            <video ref={remoteVideoRef} autoPlay playsInline />
                        ) : (
                            <div style={{ color: '#aaa', textAlign: 'center', padding: '20px', fontSize: '0.9rem' }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ marginBottom: '10px', fontSize: '1.5rem', display: 'block' }}></i>
                                Connecting Partner Camera...
                            </div>
                        )}
                        <div className="user-label">Partner</div>
                    </div>
                )}

                {/* Synchronized Countdown Overlay */}
                <CountdownOverlay 
                    active={isCountdownActive || isCapturing} 
                    onComplete={handleCountdownFinish} 
                />
            </div>

            {/* Flash Effect Overlay */}
            <div ref={flashRef} className="flash-overlay" />

            {/* Hidden Canvas for Composition */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};
