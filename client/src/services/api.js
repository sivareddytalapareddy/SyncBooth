const BASE_URL = import.meta.env.VITE_SERVER_URL || '';

/**
 * Helper for API requests with credentials and headers
 */
const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('syncbooth_auth_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include' // Include HTTP-only cookies
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const error = new Error(data.message || data.error || `HTTP ${res.status}`);
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
};

/**
 * Room Management APIs
 */
export const createRoomApi = async () => {
    const data = await apiFetch('/api/rooms', { method: 'POST' });
    return data.data; // { roomCode, maxCapacity, status, room }
};

export const getRoomApi = async (roomCode) => {
    const data = await apiFetch(`/api/rooms/${roomCode}`);
    return data.data;
};

export const joinRoomApi = async (roomCode) => {
    const data = await apiFetch(`/api/rooms/${roomCode}/join`, { method: 'POST' });
    return data.data;
};

export const leaveRoomApi = async (roomCode) => {
    try {
        await apiFetch(`/api/rooms/${roomCode}/leave`, { method: 'POST' });
    } catch {
        // Ignore errors on leave
    }
};

export const checkHealthApi = async () => {
    try {
        const res = await fetch(`${BASE_URL}/api/health`);
        return res.ok;
    } catch {
        return false;
    }
};

/**
 * Authentication REST API Endpoints
 */
export const registerApi = async (username, email, password) => {
    const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    });
    return data.data; // { token, user }
};

export const loginApi = async (email, password) => {
    const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    return data.data; // { token, user }
};

export const getMeApi = async () => {
    const data = await apiFetch('/api/auth/me', { method: 'GET' });
    return data.data; // safe user object
};

export const logoutApi = async () => {
    try {
        await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
        // Ignore errors on logout
    }
};

export default {
    createRoomApi,
    getRoomApi,
    joinRoomApi,
    leaveRoomApi,
    checkHealthApi,
    registerApi,
    loginApi,
    getMeApi,
    logoutApi
};
