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
    refreshUser: (signal?: AbortSignal) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    const normalizeUser = (response: any): User => {
        let profilePictureUrl = response.profilePictureUrl ?? response.profile_picture_url;

        // Make URL absolute if it's relative
        if (profilePictureUrl && profilePictureUrl.startsWith('/')) {
            const baseUrl = api.getApiUrl().replace('/api/v1', '');
            profilePictureUrl = `${baseUrl}${profilePictureUrl}`;
        }

        return {
            ...response,
            fullName: response.fullName ?? response.full_name,
            universityId: response.universityId ?? response.university_id,
            skillTags: response.skillTags ?? response.skill_tags,
            experienceLevel: response.experienceLevel ?? response.experience_level,
            portfolioLinks: response.portfolioLinks ?? response.portfolio_links,
            isAvailable: response.isAvailable ?? response.is_available,
            profilePictureUrl,
            reputationScore: response.reputationScore ?? response.reputation_score,
            completedProjects: response.completedProjects ?? response.completed_projects,
            verifiedStudent: response.verifiedStudent ?? response.verified_student,
            canOfferServices: response.canOfferServices ?? response.can_offer_services,
        };
    };

    async function loadStorageData() {
        try {
            const storedToken = await SecureStore.getItemAsync('userToken');
            if (storedToken) {
                setToken(storedToken);
                const response = await api.getMe(storedToken) as any;

                setUser(normalizeUser(response));
            }
        } catch (e) {
            console.error('Failed to load auth data', e);
        } finally {
            setIsLoading(false);
        }
    }

    async function signIn(email: string, password: string) {
        // BYPASS AUTH CHECKS FOR TESTING
        const dummyToken = 'dev_dummy_token';
        // await SecureStore.setItemAsync('userToken', dummyToken);
        setToken(dummyToken);
        setUser(normalizeUser({ 
            fullName: 'Test User', 
            email: email || 'test@domain.edu',
            universityId: '20270000',
            skillTags: ['React Native', 'Expo'],
            isAvailable: true,
            verifiedStudent: true,
            canOfferServices: false,
        }));
        /*
        const tokens = await api.login(email, password);
        await SecureStore.setItemAsync('userToken', tokens.access_token);
        setToken(tokens.access_token);

        const userDataResponse = await api.getMe(tokens.access_token) as any;
        setUser(normalizeUser(userDataResponse));
        */
    }

    async function register(userData: any) {
        // BYPASS AUTH CHECKS FOR TESTING
        // await api.register(userData);
        console.log("Mock Registration:", userData);
    }

    async function signOut() {
        await SecureStore.deleteItemAsync('userToken');
        setToken(null);
        setUser(null);
    }

    async function refreshUser(signal?: AbortSignal) {
        if (token) {
            try {
                const response = await api.getMe(token, signal) as any;
                setUser(normalizeUser(response));
            } catch (error: any) {
                if (error.message === 'Aborted') return;
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
