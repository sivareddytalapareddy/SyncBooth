import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';

describe('Authentication API Endpoints', () => {
    const testUser = {
        name: 'Test Photoboother',
        email: `test_${Date.now()}@syncbooth.app`,
        password: 'password123'
    };

    let authToken = '';

    it('POST /api/auth/register - should successfully register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
        expect(res.body.data.user.name).toBe(testUser.name);
        expect(res.body.data.user.password_hash).toBeUndefined();

        authToken = res.body.data.token;
    });

    it('POST /api/auth/register - should reject duplicate email registration', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain('already exists');
    });

    it('POST /api/auth/register - should reject invalid email or short password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Short', email: 'invalid-email', password: '123' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login - should successfully authenticate existing user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    });

    it('POST /api/auth/login - should reject incorrect password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Invalid email or password.');
    });

    it('GET /api/auth/me - should return authenticated user profile', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe(testUser.email.toLowerCase());
    });

    it('GET /api/auth/me - should reject request with missing or invalid token', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer invalid_token_xyz');

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });
});
