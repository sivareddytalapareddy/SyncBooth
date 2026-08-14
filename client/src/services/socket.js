import { io } from 'socket.io-client';
import { getTargetServerUrl } from './api.js';

const initialUrl = getTargetServerUrl();

/**
 * Socket.IO Singleton Client Instance
 */
export const socket = io(initialUrl, {
    autoConnect: false,
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1500
});

export const connectSocket = (token) => {
    const targetUrl = getTargetServerUrl();
    if (targetUrl && socket.io.uri !== targetUrl) {
        socket.io.uri = targetUrl;
    }
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
