/**
 * Safe LocalStorage Utility Layer
 */
const KEYS = {
    USERNAME: 'syncbooth_username',
    FILTER: 'syncbooth_last_filter',
    RECENT_ROOM: 'syncbooth_recent_room'
};

export const getStoredUsername = () => {
    try {
        return localStorage.getItem(KEYS.USERNAME) || '';
    } catch (e) {
        return '';
    }
};

export const setStoredUsername = (username) => {
    try {
        if (username) {
            localStorage.setItem(KEYS.USERNAME, username.trim());
        }
    } catch (e) {
        console.error('LocalStorage write error:', e);
    }
};

export const getStoredFilter = () => {
    try {
        return localStorage.getItem(KEYS.FILTER) || 'f-normal';
    } catch (e) {
        return 'f-normal';
    }
};

export const setStoredFilter = (filterClass) => {
    try {
        localStorage.setItem(KEYS.FILTER, filterClass);
    } catch (e) {
        console.error('LocalStorage write error:', e);
    }
};

export const getRecentRoom = () => {
    try {
        return localStorage.getItem(KEYS.RECENT_ROOM) || '';
    } catch (e) {
        return '';
    }
};

export const setRecentRoom = (roomId) => {
    try {
        localStorage.setItem(KEYS.RECENT_ROOM, roomId);
    } catch (e) {
        console.error('LocalStorage write error:', e);
    }
};
