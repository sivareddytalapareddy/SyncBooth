import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import roomRoutes from './routes/roomRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { setupSocketHandlers } from './services/socketService.js';
import { roomManager } from './rooms/roomManager.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || '*';

// Middleware
app.use(cors({
    origin: CLIENT_URL === '*' ? true : CLIENT_URL,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// REST Routes
app.use('/api', roomRoutes);
app.use('/api/auth', authRoutes);

// Socket.IO Setup
const io = new SocketIOServer(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Attach Socket Handlers
setupSocketHandlers(io);

// Periodically clean stale rooms (every 30 minutes)
setInterval(() => {
    roomManager.cleanStaleRooms();
}, 30 * 60 * 1000);

// Start server if main module
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`=================================`);
        console.log(`SyncBooth Backend Server Running`);
        console.log(`HTTP API: http://localhost:${PORT}/api`);
        console.log(`Socket.IO Signaling: Ready`);
        console.log(`=================================`);
    });
}

export { app, server, io };
