import { useState, useRef, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { UiState } from '@/types/ui-state';
import { useAuth } from '@/context/auth-context';
import { User } from '@/types';

export type ProfileUiState =
    | { status: 'loading' }
    | { status: 'content'; data: User; isProfileIncomplete: boolean }
    | { status: 'error'; message: string };

export function useProfileViewModel() {
    const { user, token, isLoading, signIn, signOut, refreshUser } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const lastRefreshTimestamp = useRef(0);

    // ── Compute UiState from AuthContext ──────────────────────────────────
    const uiState: ProfileUiState = useMemo(() => {
        if (error) {
            return { status: 'error', message: error };
        }
        if (isLoading) {
            return { status: 'loading' };
        } else if (!token || !user) {
            return { status: 'error', message: 'Unable to load profile data.' };
        } else {
            const isProfileIncomplete = !user.bio || !user.skillTags || user.skillTags.length === 0;
            return { status: 'content', data: user, isProfileIncomplete };
        }
    }, [isLoading, token, user, error]);

    // ── Throttled Focus Refresh ───────────────────────────────────────────
    useFocusEffect(
        useCallback(() => {
            if (!token) return;

            const controller = new AbortController();
            const now = Date.now();
            const throttleMs = 5 * 60 * 1000;

            if (now - lastRefreshTimestamp.current > throttleMs) {
                setError(null);
                refreshUser(controller.signal).catch(err => {
                    if (err.message !== 'Aborted') {
                        setError(err.message || 'Failed to refresh profile');
                    }
                });
                lastRefreshTimestamp.current = now;
            }

            return () => controller.abort();
        }, [token, refreshUser])
    );

    // ── Actions ───────────────────────────────────────────────────────────
    const handleLogin = useCallback(async (email: string, password: string) => {
        await signIn(email, password);
    }, [signIn]);

    const handleLogout = useCallback(async () => {
        await signOut();
    }, [signOut]);

    return { uiState, handleLogin, handleLogout };
}
