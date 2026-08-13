import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Pure JavaScript Persistent User Store
 * Replaces native C++ SQLite bindings to avoid GLIBC Linux shared library mismatch during cloud deployment.
 */
const usersMap = new Map();
let currentId = 1;

const isTest = process.env.NODE_ENV === 'test';
const dataFilePath = isTest ? null : (process.env.USERS_FILE_PATH || path.join(__dirname, '../../syncbooth_users.json'));

// Load persisted users if file exists
if (dataFilePath && fs.existsSync(dataFilePath)) {
    try {
        const raw = fs.readFileSync(dataFilePath, 'utf8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.users)) {
            data.users.forEach(u => {
                usersMap.set(u.id, u);
                if (u.id >= currentId) currentId = u.id + 1;
            });
        }
    } catch (e) {
        console.warn('Could not load stored users file:', e.message);
    }
}

const saveUsersToFile = () => {
    if (!dataFilePath) return;
    try {
        const usersArray = Array.from(usersMap.values());
        fs.writeFileSync(dataFilePath, JSON.stringify({ users: usersArray }, null, 2));
    } catch (e) {
        console.warn('Could not save users file:', e.message);
    }
};

export const dbGet = async (sql, params = []) => {
    const lowerSql = sql.toLowerCase();

    // Select by email
    if (lowerSql.includes('where lower(email) = ?')) {
        const targetEmail = (params[0] || '').toLowerCase();
        for (const user of usersMap.values()) {
            if (user.email.toLowerCase() === targetEmail) {
                return { ...user };
            }
        }
        return null;
    }

    // Select by ID
    if (lowerSql.includes('where id = ?')) {
        const id = Number(params[0]);
        const user = usersMap.get(id);
        if (user) {
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at
            };
        }
        return null;
    }

    return null;
};

export const dbRun = async (sql, params = []) => {
    const lowerSql = sql.toLowerCase();

    if (lowerSql.includes('insert into users')) {
        const [name, email, password_hash] = params;
        const id = currentId++;
        const created_at = new Date().toISOString();
        const newUser = { id, name, email, password_hash, created_at };
        usersMap.set(id, newUser);
        saveUsersToFile();
        return { lastID: id, changes: 1 };
    }

    return { lastID: 0, changes: 0 };
};

export const dbQuery = async (sql, params = []) => {
    return Array.from(usersMap.values());
};

export const clearUsersForTest = () => {
    usersMap.clear();
    currentId = 1;
};

export default { dbGet, dbRun, dbQuery, clearUsersForTest };
