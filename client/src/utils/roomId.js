/**
 * Utility functions for Room ID validation and shareable link formatting.
 */

export const isValidRoomCode = (code) => {
    if (!code || typeof code !== 'string') return false;
    return /^[A-Z0-9]{6}$/.test(code.trim().toUpperCase());
};

export const getRoomShareUrl = (roomId) => {
    const origin = window.location.origin;
    return `${origin}/room/${roomId}`;
};
