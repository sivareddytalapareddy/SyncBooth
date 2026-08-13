import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';
import { roomManager } from '../src/rooms/roomManager.js';

describe('REST API Endpoints', () => {
    let authToken = '';

    beforeEach(async () => {
        roomManager.rooms.clear();

        // Obtain auth token for protected routes
        const regRes = await request(app)
            .post('/api/auth/register')
            .send({
                username: `Tester_${Date.now()}`,
                email: `tester_${Date.now()}_${Math.random()}@syncbooth.app`,
                password: 'password123'
            });
        
        if (regRes.body?.data?.token) {
            authToken = regRes.body.data.token;
        }
    });

    it('GET /api/health - should return 200 OK', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.service).toBe('SyncBooth API');
    });

    it('POST /api/rooms - should require authentication', async () => {
        const res = await request(app).post('/api/rooms');
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/rooms - should create a new room and return 201 Created when authenticated', async () => {
        const res = await request(app)
            .post('/api/rooms')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.roomCode).toBeDefined();
        expect(res.body.data.roomCode).toHaveLength(6);
        expect(res.body.data.status).toBe('WAITING');
    });

    it('GET /api/rooms/:roomCode - should return room details if exists', async () => {
        const room = await roomManager.createRoom();
        const res = await request(app)
            .get(`/api/rooms/${room.roomCode}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.roomCode).toBe(room.roomCode);
    });

    it('GET /api/rooms/:roomCode - should return 404 for non-existent room', async () => {
        const res = await request(app)
            .get('/api/rooms/NONEX1')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Room not found');
    });
});
