import express from 'express';
import { createRoom, getRoom, joinRoom, leaveRoom, getHealth } from '../controllers/roomController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Health check endpoint (public)
router.get('/health', getHealth);

// Protected Room Endpoints
router.post('/rooms', requireAuth, createRoom);
router.get('/rooms/:roomCode', requireAuth, getRoom);
router.post('/rooms/:roomCode/join', requireAuth, joinRoom);
router.post('/rooms/:roomCode/leave', requireAuth, leaveRoom);

export default router;
