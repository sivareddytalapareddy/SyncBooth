import { roomManager } from '../rooms/roomManager.js';

/**
 * Socket.IO Signaling Service for WebRTC & Sync Events
 * @param {import('socket.io').Server} io 
 */
export const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        /**
         * Participant attempts to join a room
         */
        socket.on('join-room', ({ roomId, username }) => {
            try {
                const { room, participant } = roomManager.joinRoom(roomId, socket.id, username);
                
                socket.join(room.id);

                // Notify joining client
                socket.emit('room-joined', {
                    room,
                    participant
                });

                // If second participant joined, inform existing participants
                if (room.participants.length === 2) {
                    socket.to(room.id).emit('peer-joined', {
                        socketId: socket.id,
                        username: participant.username
                    });

                    // Emit ready event to both clients in the room
                    io.to(room.id).emit('room-ready', { room });
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
        socket.on('offer', ({ targetSocketId, offer }) => {
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
        socket.on('answer', ({ targetSocketId, answer }) => {
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
        socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
            if (targetSocketId) {
                io.to(targetSocketId).emit('ice-candidate', {
                    senderSocketId: socket.id,
                    candidate
                });
            }
        });

        /**
         * Trigger synchronized 3-2-1 countdown for capture
         */
        socket.on('start-countdown', ({ roomId }) => {
            const room = roomManager.getRoom(roomId);
            if (room) {
                room.status = 'CAPTURING';
                io.to(room.id).emit('countdown-started', {
                    startTime: Date.now() + 500 // 500ms offset for network delay
                });
            }
        });

        /**
         * Synchronize active filter selection between peers
         */
        socket.on('select-filter', ({ roomId, filterName, filterClass, css }) => {
            socket.to(roomId).emit('peer-filter-selected', {
                filterName,
                filterClass,
                css
            });
        });

        /**
         * Explicit leave room
         */
        socket.on('leave-room', ({ roomId }) => {
            const room = roomManager.leaveRoom(roomId, socket.id);
            socket.leave(roomId);
            socket.to(roomId).emit('peer-left', { socketId: socket.id });
            if (room) {
                io.to(roomId).emit('room-updated', { room });
            }
        });

        /**
         * Handle client disconnect
         */
        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
            const affectedRooms = roomManager.handleDisconnect(socket.id);

            affectedRooms.forEach(({ roomId, updatedRoom }) => {
                socket.to(roomId).emit('peer-left', { socketId: socket.id });
                if (updatedRoom) {
                    io.to(roomId).emit('room-updated', { room: updatedRoom });
                }
            });
        });
    });
};
