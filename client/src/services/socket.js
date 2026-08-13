import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || '';

/**
 * Socket.IO Singleton Client Instance
 */
export const socket = io(SERVER_URL, {
    autoConnect: false,
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

export const connectSocket = (token) => {
    const authToken = token || localStorage.getItem('syncbooth_auth_token');
    if (authToken) {
        socket.auth = { token: authToken };
    }
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

export default socket;
