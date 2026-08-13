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
