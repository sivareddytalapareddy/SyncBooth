import { roomManager } from '../rooms/roomManager.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'syncbooth_jwt_secret_key_2026_change_in_production';

/**
 * Socket.IO Signaling & Sync Service
 * @param {import('socket.io').Server} io 
 */
export const setupSocketHandlers = (io) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                socket.userId = decoded.id;
            } catch (err) {
                // Allow socket connection even if token fails, but mark unauthenticated
            }
        }
        next();
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        /**
         * Join room handler
         */
        socket.on('join-room', async ({ roomCode, roomId, username }) => {
            const targetCode = roomCode || roomId;
            try {
                const { room, participant } = await roomManager.joinRoom(
                    targetCode,
                    socket.id,
                    socket.userId,
                    username
                );
                
                socket.join(room.roomCode);

                // Notify joining client
                socket.emit('room-joined', {
                    roomCode: room.roomCode,
                    room,
                    participant
                });

                // If second participant joined, inform existing participant
                if (room.participants.length === 2) {
                    socket.to(room.roomCode).emit('peer-joined', {
                        socketId: socket.id,
                        userId: participant.userId,
                        username: participant.username
                    });

                    // Emit ready event to both clients in the room
                    io.to(room.roomCode).emit('room-ready', { 
                        roomCode: room.roomCode,
                        room 
                    });
                }
            } catch (err) {
                console.warn(`[Socket] Join room error for ${socket.id}: ${err.message}`);
                socket.emit('room-error', {
                    message: err.message,
                    code: err.code || 'JOIN_ERROR'
                });
            }
        });

        /**
         * WebRTC Signaling: Forward Offer to peer
         */
        socket.on('offer', ({ targetSocketId, offer, roomCode, roomId }) => {
            if (targetSocketId) {
                io.to(targetSocketId).emit('offer', {
                    senderSocketId: socket.id,
                    offer
                });
            }
        });

        /**
         * WebRTC Signaling: Forward Answer to peer
         */
        socket.on('answer', ({ targetSocketId, answer, roomCode, roomId }) => {
            if (targetSocketId) {
                io.to(targetSocketId).emit('answer', {
                    senderSocketId: socket.id,
                    answer
                });
            }
        });

        /**
         * WebRTC Signaling: Forward ICE Candidates to peer
         */
        socket.on('ice-candidate', ({ targetSocketId, candidate, roomCode, roomId }) => {
            if (targetSocketId) {
                io.to(targetSocketId).emit('ice-candidate', {
                    senderSocketId: socket.id,
                    candidate
                });
            }
        });

        /**
         * Trigger synchronized countdown for photo capture
         */
        socket.on('start-countdown', async ({ roomCode, roomId }) => {
            const targetCode = roomCode || roomId;
            const room = await roomManager.getRoom(targetCode);
            if (room) {
                room.status = 'CAPTURING';
                const startTime = Date.now() + 300; // Network jitter compensation offset
                io.to(room.roomCode).emit('countdown-started', {
                    startTime
                });
            }
        });

        /**
         * Synchronize filter selection between peers
         */
        socket.on('select-filter', ({ roomCode, roomId, filterName, filterClass, css }) => {
            const targetCode = roomCode || roomId;
            socket.to(targetCode).emit('peer-filter-selected', {
                filterName,
                filterClass,
                css
            });
        });

        /**
         * Explicit leave room
         */
        socket.on('leave-room', async ({ roomCode, roomId }) => {
            const targetCode = roomCode || roomId;
            const room = await roomManager.leaveRoom(targetCode, socket.id);
            if (targetCode) {
                socket.leave(targetCode);
                socket.to(targetCode).emit('peer-left', { socketId: socket.id });
                if (room) {
                    io.to(targetCode).emit('room-updated', { room });
                }
            }
        });

        /**
         * Handle client disconnect
         */
        socket.on('disconnect', async () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
            const affectedRooms = await roomManager.handleDisconnect(socket.id);

            affectedRooms.forEach(({ roomCode, updatedRoom }) => {
                socket.to(roomCode).emit('peer-left', { socketId: socket.id });
                if (updatedRoom) {
                    io.to(roomCode).emit('room-updated', { room: updatedRoom });
                }
            });
        });
    });
};

export default setupSocketHandlers;
