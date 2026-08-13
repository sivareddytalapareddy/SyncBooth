const BASE_URL = import.meta.env.VITE_SERVER_URL || '';

/**
 * SyncBooth REST API Service Layer
 */
export const createRoomApi = async () => {
    const res = await fetch(`${BASE_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create room (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data.data; // { id, participants, maxCapacity, status }
};

export const getRoomApi = async (roomId) => {
    const res = await fetch(`${BASE_URL}/api/rooms/${roomId}`);

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const err = new Error(errorData.error || `Room fetch failed (HTTP ${res.status})`);
        err.status = res.status;
        throw err;
    }

    const data = await res.json();
    return data.data;
};

export const checkHealthApi = async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    return res.ok;
};

/**
 * Authentication REST API Endpoints
 */
export const registerApi = async (name, email, password) => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
    }

    return data.data; // { token, user }
};

export const loginApi = async (email, password) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
    }

    return data.data; // { token, user }
};

export const getMeApi = async (token) => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || 'Session verification failed.');
    }

    return data.data; // user object
};

export const logoutApi = async (token) => {
    try {
        await fetch(`${BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    } catch {
        // Ignore network errors during logout
    }
};
