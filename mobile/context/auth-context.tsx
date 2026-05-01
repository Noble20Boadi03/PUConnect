import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    register: (userData: { email: string; password: string; full_name: string }) => Promise<void>;
    refreshUser: (signal?: AbortSignal) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Maps a Supabase profiles row (snake_case) to the app's User type (camelCase). */
function mapProfile(row: any): User {
    return {
        id: row.id,
        email: row.email,
        fullName: row.full_name ?? '',
        universityId: row.university_id ?? '',
        role: row.role ?? 'student',
        isActive: row.is_active ?? true,
        bio: row.bio,
        skillTags: row.skill_tags ?? [],
        experienceLevel: row.experience_level ?? 'beginner',
        portfolioLinks: row.portfolio_links ?? [],
        isAvailable: row.is_available ?? true,
        profilePictureUrl: row.profile_picture_url,
        reputationScore: row.reputation_score,
        completedProjects: row.completed_projects ?? 0,
        review_count: row.review_count ?? 0,
        verifiedStudent: row.verified_student ?? false,
        department: row.department,
        graduationYear: row.graduation_year,
        canOfferServices: row.can_offer_services ?? false,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

/** Fetches the authenticated user's profile row from the profiles table. */
async function fetchProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('[Auth] Failed to fetch profile:', error.message);
        return null;
    }
    return mapProfile(data);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Load the existing session on app start (handles persisted sessions)
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            await applySession(session);
            setIsLoading(false);
        });

        // 2. Listen for auth state changes (sign in, sign out, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            await applySession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    async function applySession(session: Session | null) {
        if (session?.user) {
            setToken(session.access_token);
            const profile = await fetchProfile(session.user.id);
            setUser(profile);
        } else {
            setToken(null);
            setUser(null);
        }
    }

    async function signIn(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        // applySession is called automatically via onAuthStateChange
    }

    async function register({ email, password, full_name }: { email: string; password: string; full_name: string }) {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name }, // saved to profiles via handle_new_user trigger
            },
        });
        if (error) throw new Error(error.message);
    }

    async function signOut() {
        await supabase.auth.signOut();
        // applySession(null) is called automatically via onAuthStateChange
    }

    async function refreshUser(_signal?: AbortSignal) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            setUser(profile);
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
