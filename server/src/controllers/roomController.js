import { roomManager } from '../rooms/roomManager.js';

/**
 * Controller for Room management API endpoints
 */

export const createRoom = (req, res) => {
    try {
        const room = roomManager.createRoom();
        return res.status(201).json({
            success: true,
            data: room
        });
    } catch (error) {
        console.error('Error creating room:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create room'
        });
    }
};

export const getRoom = (req, res) => {
    const { roomId } = req.params;

    if (!roomManager.isValidRoomId(roomId)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid room ID format'
        });
    }

    const room = roomManager.getRoom(roomId);

    if (!room) {
        return res.status(404).json({
            success: false,
            error: 'Room not found'
        });
    }

    return res.status(200).json({
        success: true,
        data: room
    });
};

export const deleteRoom = (req, res) => {
    const { roomId } = req.params;

    if (!roomManager.isValidRoomId(roomId)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid room ID format'
        });
    }

    const room = roomManager.getRoom(roomId);
    if (!room) {
        return res.status(404).json({
            success: false,
            error: 'Room not found'
        });
    }

    roomManager.rooms.delete(room.id);

    return res.status(200).json({
        success: true,
        message: `Room ${roomId} deleted successfully`
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
