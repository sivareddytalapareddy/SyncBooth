import { describe, it, expect, beforeEach } from 'vitest';
import { roomManager } from '../src/rooms/roomManager.js';

describe('RoomManager Unit Tests', () => {
    beforeEach(() => {
        roomManager.rooms.clear();
    });

    it('should generate a valid 6-character room ID', () => {
        const roomId = roomManager.generateRoomId();
        expect(roomId).toHaveLength(6);
        expect(roomManager.isValidRoomId(roomId)).toBe(true);
    });

    it('should create a room with WAITING status', () => {
        const room = roomManager.createRoom();
        expect(room).toBeDefined();
        expect(room.id).toHaveLength(6);
        expect(room.status).toBe('WAITING');
        expect(room.participants).toHaveLength(0);
        expect(room.maxCapacity).toBe(2);
    });

    it('should allow joining a room up to 2 participants', () => {
        const room = roomManager.createRoom();

        // 1st participant
        const join1 = roomManager.joinRoom(room.id, 'socket-1', 'Alice');
        expect(join1.room.participants).toHaveLength(1);
        expect(join1.room.status).toBe('WAITING');
        expect(join1.participant.username).toBe('Alice');

        // 2nd participant
        const join2 = roomManager.joinRoom(room.id, 'socket-2', 'Bob');
        expect(join2.room.participants).toHaveLength(2);
        expect(join2.room.status).toBe('CONNECTED');
    });

    it('should reject a 3rd participant when room is full', () => {
        const room = roomManager.createRoom();
        roomManager.joinRoom(room.id, 'socket-1', 'Alice');
        roomManager.joinRoom(room.id, 'socket-2', 'Bob');

        expect(() => {
            roomManager.joinRoom(room.id, 'socket-3', 'Charlie');
        }).toThrowError('Room is full (Maximum 2 participants allowed)');
    });

    it('should handle room leaving and state transition', () => {
        const room = roomManager.createRoom();
        roomManager.joinRoom(room.id, 'socket-1', 'Alice');
        roomManager.joinRoom(room.id, 'socket-2', 'Bob');

        // Bob leaves
        const updatedRoom = roomManager.leaveRoom(room.id, 'socket-2');
        expect(updatedRoom.participants).toHaveLength(1);
        expect(updatedRoom.status).toBe('WAITING');

        // Alice leaves -> room deleted
        const emptyRoom = roomManager.leaveRoom(room.id, 'socket-1');
        expect(emptyRoom).toBeNull();
        expect(roomManager.getRoom(room.id)).toBeNull();
    });

    it('should handle disconnect cleanup across rooms', () => {
        const room1 = roomManager.createRoom();
        const room2 = roomManager.createRoom();

        roomManager.joinRoom(room1.id, 'socket-1', 'UserA');
        roomManager.joinRoom(room2.id, 'socket-1', 'UserA');

        const affected = roomManager.handleDisconnect('socket-1');
        expect(affected).toHaveLength(2);
        expect(roomManager.getRoom(room1.id)).toBeNull();
        expect(roomManager.getRoom(room2.id)).toBeNull();
    });
});
