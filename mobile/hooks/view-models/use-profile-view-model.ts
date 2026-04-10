import { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { UiState } from '@/types/ui-state';
import { useAuth } from '@/context/auth-context';
import { User } from '@/types';

export type ProfileUiState =
    | { status: 'loading' }
    | { status: 'guest' }              // Not logged in
    | { status: 'content'; data: User; isProfileIncomplete: boolean }
    | { status: 'error'; message: string };

export function useProfileViewModel() {
    const { user, token, isLoading, signIn, signOut, refreshUser } = useAuth();
    const lastRefreshTimestamp = useRef(0);

    // ── Compute UiState from AuthContext ──────────────────────────────────
    let uiState: ProfileUiState;

    if (isLoading) {
        uiState = { status: 'loading' };
    } else if (!token || !user) {
        uiState = { status: 'guest' };
    } else {
        const isProfileIncomplete = !user.bio || !user.skillTags || user.skillTags.length === 0;
        uiState = { status: 'content', data: user, isProfileIncomplete };
    }

    // ── Throttled Focus Refresh ───────────────────────────────────────────
    useFocusEffect(
        useCallback(() => {
            if (!token) return;

            const controller = new AbortController();
            const now = Date.now();
            const throttleMs = 5 * 60 * 1000;

            if (now - lastRefreshTimestamp.current > throttleMs) {
                refreshUser(controller.signal);
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
