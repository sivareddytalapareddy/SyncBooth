import { useState, useEffect, useCallback } from 'react';
import { socket, connectSocket } from '../services/socket.js';
import { createRoomApi, getRoomApi } from '../services/api.js';

/**
 * Custom Hook: Room Lifecycle & Socket Event Coordination
 */
export const useRoom = (initialRoomId = null, username = 'Guest') => {
    const [roomId, setRoomId] = useState(initialRoomId);
    const [room, setRoom] = useState(null);
    const [roomStatus, setRoomStatus] = useState('IDLE'); // IDLE | WAITING | CONNECTED | CAPTURING | ERROR
    const [error, setError] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [peerFilter, setPeerFilter] = useState(null);
    const [isCountdownActive, setIsCountdownActive] = useState(false);

    // Create a new room
    const createNewRoom = useCallback(async () => {
        try {
            setError(null);
            setRoomStatus('CREATING');

            const newRoom = await createRoomApi();
            setRoomId(newRoom.id);
            setRoom(newRoom);
            setIsHost(true);

            // Connect socket and join room
            connectSocket();
            socket.emit('join-room', { roomId: newRoom.id, username });
            setRoomStatus('WAITING');
            return newRoom.id;
        } catch (err) {
            console.error('[useRoom] Create room error:', err);
            setError(err.message || 'Failed to create room');
            setRoomStatus('ERROR');
            return null;
        }
    }, [username]);

    // Join existing room
    const joinRoom = useCallback(async (code) => {
        if (!code) return;
        const cleanCode = code.trim().toUpperCase();

        try {
            setError(null);
            setRoomStatus('JOINING');

            // Pre-validate room via REST API
            const existingRoom = await getRoomApi(cleanCode);
            if (existingRoom.participants.length >= 2) {
                throw new Error('Room is full (Maximum 2 participants allowed)');
            }

            setRoomId(cleanCode);
            setRoom(existingRoom);
            setIsHost(false);

            connectSocket();
            socket.emit('join-room', { roomId: cleanCode, username });
        } catch (err) {
            console.error('[useRoom] Join room error:', err);
            setError(err.message || 'Unable to join room');
            setRoomStatus('ERROR');
        }
    }, [username]);

    // Leave room
    const leaveRoom = useCallback(() => {
        if (roomId) {
            socket.emit('leave-room', { roomId });
        }
        setRoomId(null);
        setRoom(null);
        setRoomStatus('IDLE');
        setError(null);
        setIsHost(false);
    }, [roomId]);

    // Trigger synchronized countdown across both participants
    const triggerCountdown = useCallback(() => {
        if (roomId && socket.connected) {
            socket.emit('start-countdown', { roomId });
        }
    }, [roomId]);

    // Broadcast filter change
    const broadcastFilter = useCallback((filterObj) => {
        if (roomId && socket.connected) {
            socket.emit('select-filter', {
                roomId,
                filterName: filterObj.name,
                filterClass: filterObj.class,
                css: filterObj.css
            });
        }
    }, [roomId]);

    // Socket Event Listeners
    useEffect(() => {
        if (!roomId) return;

        const handleRoomJoined = ({ room: joinedRoom }) => {
            console.log('[useRoom] Successfully joined room:', joinedRoom);
            setRoom(joinedRoom);
            setRoomStatus(joinedRoom.status);
        };

        const handleRoomReady = ({ room: readyRoom }) => {
            console.log('[useRoom] Room ready (2 participants):', readyRoom);
            setRoom(readyRoom);
            setRoomStatus('CONNECTED');
        };

        const handleRoomUpdated = ({ room: updatedRoom }) => {
            setRoom(updatedRoom);
            setRoomStatus(updatedRoom.status);
        };

        const handleRoomError = ({ message }) => {
            console.error('[useRoom] Socket room error:', message);
            setError(message);
            setRoomStatus('ERROR');
        };

        const handlePeerFilterSelected = (filterData) => {
            setPeerFilter(filterData);
        };

        const handleCountdownStarted = () => {
            setIsCountdownActive(true);
        };

        socket.on('room-joined', handleRoomJoined);
        socket.on('room-ready', handleRoomReady);
        socket.on('room-updated', handleRoomUpdated);
        socket.on('room-error', handleRoomError);
        socket.on('peer-filter-selected', handlePeerFilterSelected);
        socket.on('countdown-started', handleCountdownStarted);

        return () => {
            socket.off('room-joined', handleRoomJoined);
            socket.off('room-ready', handleRoomReady);
            socket.off('room-updated', handleRoomUpdated);
            socket.off('room-error', handleRoomError);
            socket.off('peer-filter-selected', handlePeerFilterSelected);
            socket.off('countdown-started', handleCountdownStarted);
        };
    }, [roomId]);

    return {
        roomId,
        room,
        roomStatus,
        error,
        isHost,
        peerFilter,
        isCountdownActive,
        setIsCountdownActive,
        createNewRoom,
        joinRoom,
        leaveRoom,
        triggerCountdown,
        broadcastFilter,
        clearError: () => setError(null)
    };
};
