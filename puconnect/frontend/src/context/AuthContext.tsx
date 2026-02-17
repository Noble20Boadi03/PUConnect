import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { API_ENDPOINTS } from '../api/endpoints';
import { AuthContextType, LoginCredentials, RegisterCredentials, User, AuthResponse } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    // Check authentication status on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('accessToken');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // If token exists, verify it by fetching user profile
                // The /me endpoint should return the user details
                const response = await api.get<User>(API_ENDPOINTS.AUTH.me);
                setUser(response.data);
                setAccessToken(token);
            } catch (error) {
                console.error("Failed to restore authentication:", error);
                // If fetching profile fails (likely invalid token), clear state
                logout(); // This handles clearing tokens and redirecting
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.login, credentials);

            // Expected response structure based on AuthResponse interface
            const { accessToken: newAccessToken, refreshToken, user: userData } = response.data;

            // Save tokens
            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Update state
            setAccessToken(newAccessToken);

            // If the login response includes the user, set it. 
            // Otherwise, fetch it as per "Fetch user profile" requirement.
            if (userData) {
                setUser(userData);
            } else {
                const userResponse = await api.get<User>(API_ENDPOINTS.AUTH.me);
                setUser(userResponse.data);
            }

            // Navigate to dashboard or home
            navigate('/');

        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        try {
            await api.post(API_ENDPOINTS.AUTH.register, credentials);

            // Auto login after successful registration
            await login({
                email: credentials.email,
                password: credentials.password
            });

            // Navigation is handled by login()

        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    };

    const logout = () => {
        // Clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Clear state
        setUser(null);
        setAccessToken(null);

        // Redirect to login
        navigate('/auth/login');
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            login,
            register,
            logout,
            isAuthenticated,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
