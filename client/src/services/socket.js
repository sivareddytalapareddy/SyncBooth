import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || window.location.origin;

/**
 * Socket.IO Singleton Client Instance
 */
export const socket = io(SERVER_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
