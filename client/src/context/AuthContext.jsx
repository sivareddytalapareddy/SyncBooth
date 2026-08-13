import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi, logoutApi } from '../services/api.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'syncbooth_auth_token';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
    const [isLoading, setIsLoading] = useState(true);

    // Verify session on app boot
    useEffect(() => {
        const verifySession = async () => {
            try {
                const userData = await getMeApi();
                setUser(userData);
            } catch (err) {
                // If stored token or cookie is invalid/expired, clear local auth
                localStorage.removeItem(TOKEN_KEY);
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifySession();
    }, []);

    const login = async (email, password) => {
        const data = await loginApi(email, password);
        if (data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
            setToken(data.token);
        }
        setUser(data.user);
        return data.user;
    };

    const register = async (username, email, password) => {
        const data = await registerApi(username, email, password);
        if (data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
            setToken(data.token);
        }
        setUser(data.user);
        return data.user;
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch {
            // Ignore error
        }
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
