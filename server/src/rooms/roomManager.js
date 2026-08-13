import mongoose from 'mongoose';
import Room from '../models/Room.js';

class RoomManager {
    constructor() {
        /** 
         * @type {Map<string, {
         *   roomCode: string,
         *   dbId: string,
         *   hostUserId: string,
         *   participants: Array<{ socketId: string, userId: string, username: string }>,
         *   maxCapacity: number,
         *   status: string,
         *   createdAt: number
         * }>} 
         */
        this.rooms = new Map();
    }

    /**
     * Generate a unique 6-character uppercase alphanumeric room code.
     * @returns {string} E.g., "A7K92P"
     */
    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded ambiguous chars 0, O, 1, I
        let code = '';
        let attempts = 0;
        
        do {
            code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            attempts++;
            if (attempts > 1000) {
                throw new Error('Failed to generate unique room code');
            }
        } while (this.rooms.has(code));

        return code;
    }

    /**
     * Validate room code format.
     * @param {string} roomCode 
     * @returns {boolean}
     */
    isValidRoomCode(roomCode) {
        if (!roomCode || typeof roomCode !== 'string') return false;
        const cleaned = roomCode.trim().toUpperCase();
        return /^[A-Z0-9]{6}$/.test(cleaned);
    }

    /**
     * Create a new private photo booth room.
     * @param {string} hostUserId 
     * @param {string} [hostUsername='Host'] 
     * @returns {Promise<Object>}
     */
    async createRoom(hostUserId = null, hostUsername = 'Host') {
        const roomCode = this.generateRoomCode();
        
        let dbRoom = null;
        if (hostUserId && mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(hostUserId)) {
            try {
                dbRoom = await Room.create({
                    roomCode,
                    hostUserId,
                    status: 'WAITING'
                });
            } catch (err) {
                console.warn('[RoomManager] Failed to persist room in MongoDB, keeping in memory:', err.message);
            }
        }

        const room = {
            roomCode,
            dbId: dbRoom ? dbRoom._id.toString() : null,
            hostUserId: hostUserId ? hostUserId.toString() : null,
            participants: [],
            maxCapacity: 2,
            status: 'WAITING',
            createdAt: Date.now()
        };

        this.rooms.set(roomCode, room);
        return room;
    }

    /**
     * Retrieve room by code from memory or DB.
     * @param {string} roomCode 
     * @returns {Promise<Object|null>}
     */
    async getRoom(roomCode) {
        if (!this.isValidRoomCode(roomCode)) return null;
        const cleanCode = roomCode.trim().toUpperCase();
        
        let room = this.rooms.get(cleanCode);
        if (!room && mongoose.connection.readyState === 1) {
            // Check DB fallback
            try {
                const dbRoom = await Room.findOne({ roomCode: cleanCode, status: { $ne: 'CLOSED' } });
                if (dbRoom) {
                    room = {
                        roomCode: dbRoom.roomCode,
                        dbId: dbRoom._id.toString(),
                        hostUserId: dbRoom.hostUserId.toString(),
                        participants: [],
                        maxCapacity: 2,
                        status: dbRoom.status,
                        createdAt: dbRoom.createdAt ? new Date(dbRoom.createdAt).getTime() : Date.now()
                    };
                    this.rooms.set(cleanCode, room);
                }
            } catch (err) {
                console.warn('[RoomManager] DB room lookup error:', err.message);
            }
        }

        return room || null;
    }

    /**
     * Join a room with socket connection.
     * @param {string} roomCode 
     * @param {string} socketId 
     * @param {string} [userId=null] 
     * @param {string} [username='Guest'] 
     * @returns {Promise<{ room: Object, participant: Object }>}
     */
    async joinRoom(roomCode, socketId, userId = null, username = 'Guest') {
        const cleanCode = roomCode ? roomCode.trim().toUpperCase() : '';
        const room = await this.getRoom(cleanCode);

        if (!room || room.status === 'CLOSED') {
            const error = new Error('Room not found or has been closed');
            error.code = 'ROOM_NOT_FOUND';
            throw error;
        }

        // Check if socket already in room
        const existingBySocket = room.participants.find(p => p.socketId === socketId);
        if (existingBySocket) {
            return { room, participant: existingBySocket };
        }

        // Enforce maximum capacity of 2
        if (room.participants.length >= room.maxCapacity) {
            const error = new Error('Room is full (Maximum 2 participants allowed)');
            error.code = 'ROOM_FULL';
            throw error;
        }

        const participant = {
            socketId,
            userId: userId ? userId.toString() : null,
            username: username.trim() || `User ${room.participants.length + 1}`
        };

        room.participants.push(participant);

        if (room.participants.length === 2) {
            room.status = 'ACTIVE';
            if (room.dbId && userId && mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
                try {
                    await Room.findByIdAndUpdate(room.dbId, {
                        participantUserId: userId,
                        status: 'ACTIVE'
                    });
                } catch (err) {
                    console.warn('[RoomManager] DB update room ACTIVE failed:', err.message);
                }
            }
        } else {
            room.status = 'WAITING';
        }

        return { room, participant };
    }

    /**
     * Leave a room.
     * @param {string} roomCode 
     * @param {string} socketId 
     * @returns {Promise<Object|null>} Updated room or null if closed
     */
    async leaveRoom(roomCode, socketId) {
        const room = await this.getRoom(roomCode);
        if (!room) return null;

        const leavingParticipant = room.participants.find(p => p.socketId === socketId);
        room.participants = room.participants.filter(p => p.socketId !== socketId);

        // If host leaves or room is now empty -> Close Room
        const isHost = leavingParticipant && room.hostUserId && leavingParticipant.userId === room.hostUserId;

        if (room.participants.length === 0 || isHost) {
            room.status = 'CLOSED';
            this.rooms.delete(room.roomCode);

            if (room.dbId && mongoose.connection.readyState === 1) {
                try {
                    await Room.findByIdAndUpdate(room.dbId, { status: 'CLOSED' });
                } catch (err) {
                    console.warn('[RoomManager] DB update room CLOSED failed:', err.message);
                }
            }
            return null;
        } else {
            room.status = 'WAITING';
            return room;
        }
    }

    /**
     * Handle socket disconnect.
     * @param {string} socketId 
     * @returns {Promise<Array<{ roomCode: string, updatedRoom: Object|null }>>}
     */
    async handleDisconnect(socketId) {
        const affectedRooms = [];
        
        for (const [code, room] of this.rooms.entries()) {
            const isParticipant = room.participants.some(p => p.socketId === socketId);
            if (isParticipant) {
                const updatedRoom = await this.leaveRoom(code, socketId);
                affectedRooms.push({
                    roomCode: code,
                    updatedRoom
                });
            }
        }

        return affectedRooms;
    }

    /**
     * Clean inactive rooms older than 2 hours.
     */
    cleanStaleRooms(maxAgeMs = 2 * 60 * 60 * 1000) {
        const now = Date.now();
        for (const [code, room] of this.rooms.entries()) {
            if (now - room.createdAt > maxAgeMs) {
                this.rooms.delete(code);
            }
        }
    }
}

export const roomManager = new RoomManager();
export default roomManager;
