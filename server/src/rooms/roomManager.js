/**
 * Room Manager Service
 * Handles in-memory room lifecycle, participant tracking, capacity enforcement,
 * and state transitions (WAITING, CONNECTED, CAPTURING, DISCONNECTED).
 */

class RoomManager {
    constructor() {
        /** @type {Map<string, { id: string, participants: Array<{socketId: string, username: string}>, maxCapacity: number, status: string, createdAt: number }>} */
        this.rooms = new Map();
    }

    /**
     * Generate a unique 6-character uppercase alphanumeric room code.
     * @returns {string} E.g., "A7K92P"
     */
    generateRoomId() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded ambiguous chars 0, O, 1, I
        let roomId = '';
        let attempts = 0;
        
        do {
            roomId = '';
            for (let i = 0; i < 6; i++) {
                roomId += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            attempts++;
            if (attempts > 1000) {
                throw new Error('Failed to generate unique room ID');
            }
        } while (this.rooms.has(roomId));

        return roomId;
    }

    /**
     * Validate room ID string format.
     * @param {string} roomId 
     * @returns {boolean}
     */
    isValidRoomId(roomId) {
        if (!roomId || typeof roomId !== 'string') return false;
        const cleaned = roomId.trim().toUpperCase();
        return /^[A-Z0-9]{6}$/.test(cleaned);
    }

    /**
     * Create a new private booth room.
     * @returns {Object} Newly created room object
     */
    createRoom() {
        const roomId = this.generateRoomId();
        const room = {
            id: roomId,
            participants: [],
            maxCapacity: 2,
            status: 'WAITING',
            createdAt: Date.now()
        };
        this.rooms.set(roomId, room);
        return room;
    }

    /**
     * Retrieve room by ID.
     * @param {string} roomId 
     * @returns {Object|null}
     */
    getRoom(roomId) {
        if (!this.isValidRoomId(roomId)) return null;
        return this.rooms.get(roomId.trim().toUpperCase()) || null;
    }

    /**
     * Join a room.
     * @param {string} roomId 
     * @param {string} socketId 
     * @param {string} [username='Guest'] 
     * @returns {Object} { room, participant }
     */
    joinRoom(roomId, socketId, username = 'Guest') {
        const cleanId = roomId ? roomId.trim().toUpperCase() : '';
        const room = this.getRoom(cleanId);

        if (!room) {
            const error = new Error('Room not found');
            error.code = 'ROOM_NOT_FOUND';
            throw error;
        }

        // Check if user is already in this room
        const existingParticipant = room.participants.find(p => p.socketId === socketId);
        if (existingParticipant) {
            return { room, participant: existingParticipant };
        }

        // Enforce maximum capacity of 2
        if (room.participants.length >= room.maxCapacity) {
            const error = new Error('Room is full (Maximum 2 participants allowed)');
            error.code = 'ROOM_FULL';
            throw error;
        }

        const participant = {
            socketId,
            username: username.trim() || `User ${room.participants.length + 1}`
        };

        room.participants.push(participant);

        if (room.participants.length === 2) {
            room.status = 'CONNECTED';
        } else {
            room.status = 'WAITING';
        }

        return { room, participant };
    }

    /**
     * Remove a participant from a room.
     * @param {string} roomId 
     * @param {string} socketId 
     * @returns {Object|null} Updated room status or null if destroyed
     */
    leaveRoom(roomId, socketId) {
        const room = this.getRoom(roomId);
        if (!room) return null;

        room.participants = room.participants.filter(p => p.socketId !== socketId);

        if (room.participants.length === 0) {
            this.rooms.delete(room.id);
            return null;
        } else {
            room.status = 'WAITING';
            return room;
        }
    }

    /**
     * Handle socket disconnect: remove socket from any room it belonged to.
     * @param {string} socketId 
     * @returns {Array<{ roomId: string, remainingParticipants: Array }>}
     */
    handleDisconnect(socketId) {
        const affectedRooms = [];
        
        for (const [roomId, room] of this.rooms.entries()) {
            const isParticipant = room.participants.some(p => p.socketId === socketId);
            if (isParticipant) {
                const updatedRoom = this.leaveRoom(roomId, socketId);
                affectedRooms.push({
                    roomId,
                    updatedRoom,
                    remainingParticipants: updatedRoom ? updatedRoom.participants : []
                });
            }
        }

        return affectedRooms;
    }

    /**
     * Clear inactive rooms older than specified max age (default 2 hours).
     * @param {number} maxAgeMs 
     */
    cleanStaleRooms(maxAgeMs = 2 * 60 * 60 * 1000) {
        const now = Date.now();
        for (const [roomId, room] of this.rooms.entries()) {
            if (now - room.createdAt > maxAgeMs) {
                this.rooms.delete(roomId);
            }
        }
    }
}

export const roomManager = new RoomManager();
