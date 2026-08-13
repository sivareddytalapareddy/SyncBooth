import express from 'express';
import { createRoom, getRoom, deleteRoom, getHealth } from '../controllers/roomController.js';

const router = express.Router();

// Health check endpoint
router.get('/health', getHealth);

// Room API Endpoints
router.post('/rooms', createRoom);
router.get('/rooms/:roomId', getRoom);
router.delete('/rooms/:roomId', deleteRoom);

export default router;
