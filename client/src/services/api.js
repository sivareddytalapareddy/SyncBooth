/**
 * Target Server Base URL Resolution
 * Uses VITE_SERVER_URL environment variable in production, fallback to relative path or localhost in dev.
 */
export const getTargetServerUrl = () => {
    const envUrl = import.meta.env.VITE_SERVER_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
        return envUrl.trim().replace(/\/$/, '');
    }
    return '';
};

/**
 * Helper for API requests with credentials, headers, and cold-start retries
 */
const apiFetch = async (endpoint, options = {}, retries = 2) => {
    const baseUrl = getTargetServerUrl();
    const token = localStorage.getItem('syncbooth_auth_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(`${baseUrl}${endpoint}`, {
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
        } catch (err) {
            // Retry network/fetch errors caused by backend cold start
            if (attempt < retries && (err.name === 'TypeError' || (err.message && err.message.includes('fetch')))) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
                continue;
            }
            if (err.name === 'TypeError' || (err.message && err.message.includes('Failed to fetch'))) {
                throw new Error('Backend server is starting up or unreachable. Please verify VITE_SERVER_URL and try again.');
            }
            throw err;
        }
    }
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
        const baseUrl = getTargetServerUrl();
        const res = await fetch(`${baseUrl}/api/health`);
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
