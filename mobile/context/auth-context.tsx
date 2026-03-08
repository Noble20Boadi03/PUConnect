import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, AuthTokens } from '../types';
import { api } from '../services/api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    register: (userData: any) => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    async function loadStorageData() {
        try {
            const storedToken = await SecureStore.getItemAsync('userToken');
            if (storedToken) {
                setToken(storedToken);
                const userData = await api.getMe(storedToken);
                setUser(userData);
            }
        } catch (e) {
            console.error('Failed to load auth data', e);
        } finally {
            setIsLoading(false);
        }
    }

    async function signIn(email: string, password: string) {
        const tokens = await api.login(email, password);
        await SecureStore.setItemAsync('userToken', tokens.access_token);
        setToken(tokens.access_token);

        const userData = await api.getMe(tokens.access_token);
        setUser(userData);
    }

    async function register(userData: any) {
        await api.register(userData);
    }

    async function signOut() {
        await SecureStore.deleteItemAsync('userToken');
        setToken(null);
        setUser(null);
    }

    async function refreshUser() {
        if (token) {
            try {
                const refreshedUserData = await api.getMe(token);
                setUser(refreshedUserData);
            } catch (error) {
                console.error('Failed to refresh user', error);
            }
        }
    }

    return (
        <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut, register, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
