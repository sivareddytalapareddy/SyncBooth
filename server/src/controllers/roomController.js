import { roomManager } from '../rooms/roomManager.js';
import Room from '../models/Room.js';

export const createRoom = async (req, res) => {
    try {
        const hostUserId = req.user ? req.user._id : null;
        const hostUsername = req.user ? (req.user.username || req.user.name) : 'Host';

        const room = await roomManager.createRoom(hostUserId, hostUsername);
        
        return res.status(201).json({
            success: true,
            message: 'Room created successfully',
            data: {
                roomCode: room.roomCode,
                roomId: room.roomCode,
                maxCapacity: room.maxCapacity,
                status: room.status,
                room
            }
        });
    } catch (error) {
        console.error('Error creating room:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create booth room'
        });
    }
};

export const getRoom = async (req, res) => {
    const { roomCode, roomId } = req.params;
    const targetCode = roomCode || roomId;

    if (!roomManager.isValidRoomCode(targetCode)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid room code format'
        });
    }

    try {
        const room = await roomManager.getRoom(targetCode);

        if (!room || room.status === 'CLOSED') {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                roomCode: room.roomCode,
                maxCapacity: room.maxCapacity,
                participantCount: room.participants.length,
                status: room.status,
                room
            }
        });
    } catch (err) {
        console.error('Error fetching room:', err);
        return res.status(500).json({
            success: false,
            message: 'Error looking up room'
        });
    }
};

export const joinRoom = async (req, res) => {
    const { roomCode, roomId } = req.params;
    const targetCode = roomCode || roomId;

    if (!roomManager.isValidRoomCode(targetCode)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid room code format'
        });
    }

    try {
        const room = await roomManager.getRoom(targetCode);

        if (!room || room.status === 'CLOSED') {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        if (room.participants.length >= 2) {
            return res.status(409).json({
                success: false,
                message: 'Room is full (Maximum 2 participants allowed)'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Room is available to join',
            data: {
                roomCode: room.roomCode,
                status: room.status,
                participantCount: room.participants.length
            }
        });
    } catch (err) {
        console.error('Error joining room endpoint:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify room join status'
        });
    }
};

export const leaveRoom = async (req, res) => {
    const { roomCode, roomId } = req.params;
    const targetCode = roomCode || roomId;

    return res.status(200).json({
        success: true,
        message: `Left room ${targetCode} successfully`
    });
};

export const getHealth = (req, res) => {
    return res.status(200).json({
        status: 'ok',
        service: 'SyncBooth API',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
};

export default { createRoom, getRoom, joinRoom, leaveRoom, getHealth };
