import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi, logoutApi } from '../services/api.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'syncbooth_auth_token';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
    const [isLoading, setIsLoading] = useState(true);

    // Verify session on app load
    useEffect(() => {
        const verifySession = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const userData = await getMeApi(token);
                setUser(userData);
            } catch (err) {
                console.warn('Session verification failed, logging out:', err.message);
                localStorage.removeItem(TOKEN_KEY);
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifySession();
    }, [token]);

    const login = async (email, password) => {
        const data = await loginApi(email, password);
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    const register = async (name, email, password) => {
        const data = await registerApi(name, email, password);
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    const logout = async () => {
        if (token) {
            await logoutApi(token);
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
