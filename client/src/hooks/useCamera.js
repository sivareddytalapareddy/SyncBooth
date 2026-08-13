import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom Hook: MediaDevices Camera Management
 * Requests camera access via getUserMedia and handles tracks cleanup.
 */
export const useCamera = () => {
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const streamRef = useRef(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
            setStream(null);
        }
    }, []);

    const startCamera = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError('Browser API Error: MediaDevices API is not supported on this browser.');
            setLoading(false);
            return null;
        }

        try {
            // Stop existing active stream before requesting new one
            stopCamera();

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 960 }
                },
                audio: false
            });

            streamRef.current = mediaStream;
            setStream(mediaStream);
            setLoading(false);
            return mediaStream;
        } catch (err) {
            console.error('[useCamera] Access error:', err);
            setLoading(false);

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Camera permission denied. Please allow camera access in your browser settings.');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('No camera device found. Please connect a webcam.');
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError('Camera is currently in use by another application.');
            } else {
                setError(`Camera error: ${err.message || 'Unable to access camera'}`);
            }
            return null;
        }
    }, [stopCamera]);

    // Ensure tracks are stopped when component unmounts
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return {
        stream,
        error,
        loading,
        startCamera,
        stopCamera
    };
};
