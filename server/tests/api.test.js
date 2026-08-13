import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';
import { roomManager } from '../src/rooms/roomManager.js';

describe('REST API Endpoints', () => {
    beforeEach(() => {
        roomManager.rooms.clear();
    });

    it('GET /api/health - should return 200 OK', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.service).toBe('SyncBooth API');
    });

    it('POST /api/rooms - should create a new room and return 201 Created', async () => {
        const res = await request(app).post('/api/rooms');
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBeDefined();
        expect(res.body.data.id).toHaveLength(6);
        expect(res.body.data.status).toBe('WAITING');
    });

    it('GET /api/rooms/:roomId - should return room details if exists', async () => {
        const room = roomManager.createRoom();
        const res = await request(app).get(`/api/rooms/${room.id}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(room.id);
    });

    it('GET /api/rooms/:roomId - should return 404 for non-existent room', async () => {
        const res = await request(app).get('/api/rooms/NONEX1');
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Room not found');
    });

    it('DELETE /api/rooms/:roomId - should delete an existing room', async () => {
        const room = roomManager.createRoom();
        const res = await request(app).delete(`/api/rooms/${room.id}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const checkRes = await request(app).get(`/api/rooms/${room.id}`);
        expect(checkRes.status).toBe(404);
    });
});
