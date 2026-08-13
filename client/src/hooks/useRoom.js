import { useState, useEffect, useCallback } from 'react';
import { socket, connectSocket } from '../services/socket.js';
import { createRoomApi, getRoomApi, joinRoomApi, leaveRoomApi } from '../services/api.js';

/**
 * Custom Hook: Room Lifecycle & Socket Event Coordination
 */
export const useRoom = (initialRoomCode = null, username = 'Guest') => {
    const [roomCode, setRoomCode] = useState(initialRoomCode);
    const [room, setRoom] = useState(null);
    const [roomStatus, setRoomStatus] = useState('IDLE'); // IDLE | WAITING | ACTIVE | CONNECTED | CAPTURING | ERROR
    const [error, setError] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [peerFilter, setPeerFilter] = useState(null);
    const [isCountdownActive, setIsCountdownActive] = useState(false);
    const [partnerDisconnected, setPartnerDisconnected] = useState(false);

    // Create a new room
    const createNewRoom = useCallback(async () => {
        try {
            setError(null);
            setPartnerDisconnected(false);
            setRoomStatus('CREATING');

            const roomData = await createRoomApi();
            const code = roomData.roomCode || roomData.id;
            setRoomCode(code);
            setRoom(roomData.room || roomData);
            setIsHost(true);

            // Connect socket and join room
            connectSocket();
            socket.emit('join-room', { roomCode: code, roomId: code, username });
            setRoomStatus('WAITING');
            return code;
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
            setPartnerDisconnected(false);
            setRoomStatus('JOINING');

            // Pre-validate room via REST API
            const roomData = await joinRoomApi(cleanCode).catch(() => getRoomApi(cleanCode));
            
            setRoomCode(cleanCode);
            setRoom(roomData.room || roomData);
            setIsHost(false);

            connectSocket();
            socket.emit('join-room', { roomCode: cleanCode, roomId: cleanCode, username });
        } catch (err) {
            console.error('[useRoom] Join room error:', err);
            setError(err.message || 'Unable to join room');
            setRoomStatus('ERROR');
        }
    }, [username]);

    // Leave room
    const leaveRoom = useCallback(async () => {
        if (roomCode) {
            socket.emit('leave-room', { roomCode, roomId: roomCode });
            await leaveRoomApi(roomCode);
        }
        setRoomCode(null);
        setRoom(null);
        setRoomStatus('IDLE');
        setError(null);
        setIsHost(false);
        setPartnerDisconnected(false);
    }, [roomCode]);

    // Trigger synchronized countdown across both participants
    const triggerCountdown = useCallback(() => {
        if (roomCode && socket.connected) {
            socket.emit('start-countdown', { roomCode, roomId: roomCode });
        }
    }, [roomCode]);

    // Broadcast filter change
    const broadcastFilter = useCallback((filterObj) => {
        if (roomCode && socket.connected) {
            socket.emit('select-filter', {
                roomCode,
                roomId: roomCode,
                filterName: filterObj.name,
                filterClass: filterObj.class,
                css: filterObj.css
            });
        }
    }, [roomCode]);

    // Socket Event Listeners
    useEffect(() => {
        if (!roomCode) return;

        const handleRoomJoined = ({ room: joinedRoom }) => {
            console.log('[useRoom] Successfully joined room:', joinedRoom);
            if (joinedRoom) setRoom(joinedRoom);
            setRoomStatus(joinedRoom?.status || 'WAITING');
        };

        const handleRoomReady = ({ room: readyRoom }) => {
            console.log('[useRoom] Room ready (2 participants):', readyRoom);
            if (readyRoom) setRoom(readyRoom);
            setRoomStatus('ACTIVE');
            setPartnerDisconnected(false);
        };

        const handlePeerJoined = ({ username: peerName }) => {
            console.log('[useRoom] Partner joined:', peerName);
            setRoomStatus('ACTIVE');
            setPartnerDisconnected(false);
        };

        const handlePeerLeft = () => {
            console.log('[useRoom] Partner left/disconnected');
            setPartnerDisconnected(true);
            setRoomStatus('WAITING');
        };

        const handleRoomUpdated = ({ room: updatedRoom }) => {
            if (updatedRoom) setRoom(updatedRoom);
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
        socket.on('peer-joined', handlePeerJoined);
        socket.on('peer-left', handlePeerLeft);
        socket.on('room-updated', handleRoomUpdated);
        socket.on('room-error', handleRoomError);
        socket.on('peer-filter-selected', handlePeerFilterSelected);
        socket.on('countdown-started', handleCountdownStarted);

        return () => {
            socket.off('room-joined', handleRoomJoined);
            socket.off('room-ready', handleRoomReady);
            socket.off('peer-joined', handlePeerJoined);
            socket.off('peer-left', handlePeerLeft);
            socket.off('room-updated', handleRoomUpdated);
            socket.off('room-error', handleRoomError);
            socket.off('peer-filter-selected', handlePeerFilterSelected);
            socket.off('countdown-started', handleCountdownStarted);
        };
    }, [roomCode]);

    return {
        roomCode,
        roomId: roomCode,
        room,
        roomStatus,
        error,
        isHost,
        peerFilter,
        isCountdownActive,
        partnerDisconnected,
        setIsCountdownActive,
        createNewRoom,
        joinRoom,
        leaveRoom,
        triggerCountdown,
        broadcastFilter,
        clearError: () => setError(null)
    };
};

export default useRoom;
