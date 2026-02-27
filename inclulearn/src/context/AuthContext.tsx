'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser } from '@/lib/api';

type AuthContextType = {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    login: (user: AuthUser, token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    /* Hydrate from localStorage on mount */
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('edulearn_token');
            const storedUser = localStorage.getItem('edulearn_user');
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch {
            // invalid JSON — clear storage
            localStorage.removeItem('edulearn_token');
            localStorage.removeItem('edulearn_user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (user: AuthUser, token: string) => {
        localStorage.setItem('edulearn_token', token);
        localStorage.setItem('edulearn_user', JSON.stringify(user));
        setUser(user);
        setToken(token);
    };

    const logout = () => {
        localStorage.removeItem('edulearn_token');
        localStorage.removeItem('edulearn_user');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}
