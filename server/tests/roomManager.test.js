import { describe, it, expect, beforeEach } from 'vitest';
import { roomManager } from '../src/rooms/roomManager.js';

describe('RoomManager Unit Tests', () => {
    const mockHostId = '507f1f77bcf86cd799439011';
    const mockGuestId = '507f1f77bcf86cd799439022';

    beforeEach(() => {
        roomManager.rooms.clear();
    });

    it('should generate a valid 6-character room code', () => {
        const code = roomManager.generateRoomCode();
        expect(code).toHaveLength(6);
        expect(roomManager.isValidRoomCode(code)).toBe(true);
    });

    it('should create a room with WAITING status', async () => {
        const room = await roomManager.createRoom();
        expect(room).toBeDefined();
        expect(room.roomCode).toHaveLength(6);
        expect(room.status).toBe('WAITING');
        expect(room.participants).toHaveLength(0);
        expect(room.maxCapacity).toBe(2);
    });

    it('should allow joining a room up to 2 participants', async () => {
        const room = await roomManager.createRoom();

        // 1st participant
        const join1 = await roomManager.joinRoom(room.roomCode, 'socket-1', mockHostId, 'Alice');
        expect(join1.room.participants).toHaveLength(1);
        expect(join1.room.status).toBe('WAITING');
        expect(join1.participant.username).toBe('Alice');

        // 2nd participant
        const join2 = await roomManager.joinRoom(room.roomCode, 'socket-2', mockGuestId, 'Bob');
        expect(join2.room.participants).toHaveLength(2);
        expect(join2.room.status).toBe('ACTIVE');
    });

    it('should reject a 3rd participant when room is full', async () => {
        const room = await roomManager.createRoom();
        await roomManager.joinRoom(room.roomCode, 'socket-1', mockHostId, 'Alice');
        await roomManager.joinRoom(room.roomCode, 'socket-2', mockGuestId, 'Bob');

        await expect(
            roomManager.joinRoom(room.roomCode, 'socket-3', null, 'Charlie')
        ).rejects.toThrow('Room is full (Maximum 2 participants allowed)');
    });

    it('should handle participant leaving and host room closure', async () => {
        const room = await roomManager.createRoom(mockHostId);
        await roomManager.joinRoom(room.roomCode, 'socket-1', mockHostId, 'Alice');
        await roomManager.joinRoom(room.roomCode, 'socket-2', mockGuestId, 'Bob');

        // Guest leaves
        const updatedRoom = await roomManager.leaveRoom(room.roomCode, 'socket-2');
        expect(updatedRoom.participants).toHaveLength(1);
        expect(updatedRoom.status).toBe('WAITING');

        // Host leaves -> room closed & deleted
        const emptyRoom = await roomManager.leaveRoom(room.roomCode, 'socket-1');
        expect(emptyRoom).toBeNull();
        expect(await roomManager.getRoom(room.roomCode)).toBeNull();
    });

    it('should handle disconnect cleanup across rooms', async () => {
        const room1 = await roomManager.createRoom();
        const room2 = await roomManager.createRoom();

        await roomManager.joinRoom(room1.roomCode, 'socket-1', null, 'UserA');
        await roomManager.joinRoom(room2.roomCode, 'socket-1', null, 'UserA');

        const affected = await roomManager.handleDisconnect('socket-1');
        expect(affected).toHaveLength(2);
        expect(await roomManager.getRoom(room1.roomCode)).toBeNull();
        expect(await roomManager.getRoom(room2.roomCode)).toBeNull();
    });
});
