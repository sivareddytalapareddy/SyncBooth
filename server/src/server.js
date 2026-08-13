import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './db/database.js';
import roomRoutes from './routes/roomRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { setupSocketHandlers } from './services/socketService.js';
import { roomManager } from './rooms/roomManager.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable trust proxy for HTTPS hosting environments like Render/Heroku
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect MongoDB database
connectDB();

// Dynamic CORS Origin Validator
const isAllowedOrigin = (origin) => {
    if (!origin) return true; // Allow non-browser agents (Postman, curl, server-to-server)
    if (CLIENT_URL === '*' || origin === CLIENT_URL) return true;
    if (origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173') return true;
    // Allow vercel preview / production deployments
    if (/\.vercel\.app$/.test(origin)) return true;
    return false;
};

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow during initial setup
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// REST API Routes
app.use('/api', roomRoutes);
app.use('/api/auth', authRoutes);

// Socket.IO Setup
const io = new SocketIOServer(server, {
    cors: {
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
            } else {
                callback(null, true);
            }
        },
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
