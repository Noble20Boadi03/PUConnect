import { AuthTokens, Listing, User, ChatMessage } from '../types';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
    if (__DEV__) {
        const debuggerHost = Constants.expoConfig?.hostUri;
        if (debuggerHost) {
            // debuggerHost is typically "192.168.x.x:8081". We extract the IP.
            const ip = debuggerHost.split(':')[0];
            return `http://${ip}:8000/api/v1`;
        }
        // Fallback for Android emulator if Expo Constants fails
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8000/api/v1';
        }
        // Fallback for iOS simulator
        return 'http://localhost:8000/api/v1';
    }
    // Production URL would go here
    return 'https://api.puconnect.app/v1';
};

const API_URL = getApiUrl();

// Helper to get headers with token
const getHeaders = (token?: string) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const api = {
    // Auth
    login: async (email: string, password: string): Promise<AuthTokens> => {
        const body = new URLSearchParams();
        body.append('username', email);
        body.append('password', password);

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Login failed');
        }
        return response.json();
    },

    register: async (userData: any): Promise<User> => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error('Registration failed');
        return response.json();
    },

    getMe: async (token: string): Promise<User> => {
        const response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: getHeaders(token),
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
    },

    updateProfile: async (profileData: Partial<User>, token: string): Promise<User> => {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PATCH',
            headers: getHeaders(token),
            body: JSON.stringify(profileData),
        });
        if (!response.ok) throw new Error('Failed to update profile');
        return response.json();
    },

    // Listings
    getListings: async (skip = 0, limit = 100): Promise<Listing[]> => {
        const response = await fetch(`${API_URL}/listings/?skip=${skip}&limit=${limit}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch listings');
        return response.json();
    },

    getListing: async (id: string): Promise<Listing> => {
        const response = await fetch(`${API_URL}/listings/${id}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch listing');
        return response.json();
    },

    createListing: async (listingData: any, token: string): Promise<Listing> => {
        const response = await fetch(`${API_URL}/listings/`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(listingData),
        });
        if (!response.ok) throw new Error('Failed to create listing');
        return response.json();
    },

    // Chat
    getMessages: async (token: string): Promise<ChatMessage[]> => {
        const response = await fetch(`${API_URL}/chat/my-chats`, {
            method: 'GET',
            headers: getHeaders(token),
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    },

    getConversation: async (token: string, userId: string, listingId?: string): Promise<ChatMessage[]> => {
        let url = `${API_URL}/chat/conversations/${userId}`;
        if (listingId) url += `?listing_id=${listingId}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(token),
        });
        if (!response.ok) throw new Error('Failed to fetch conversation');
        return response.json();
    },

    sendMessage: async (messageData: { receiver_id: string, listing_id: string, message: string }, token: string): Promise<ChatMessage> => {
        const response = await fetch(`${API_URL}/chat/`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(messageData),
        });
        if (!response.ok) throw new Error('Failed to send message');
        return response.json();
    },
};
