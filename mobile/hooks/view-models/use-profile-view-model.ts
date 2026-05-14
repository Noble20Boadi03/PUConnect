import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { UiState } from '@/types/ui-state';
import { useAuth } from '@/context/auth-context';
import { User, Listing } from '@/types';
import { api } from '@/services/api';

export type ProfileUiState =
    | { status: 'loading' }
    | { status: 'content'; data: User; listings: Listing[]; isProfileIncomplete: boolean; isRefreshingListings: boolean }
    | { status: 'error'; message: string };

export function useProfileViewModel() {
    const { user, token, isLoading, signIn, signOut, refreshUser } = useAuth();
    const [listings, setListings] = useState<Listing[]>([]);
    const [isListingsLoading, setIsListingsLoading] = useState(false);
    const [isRefreshingListings, setIsRefreshingListings] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const lastRefreshTimestamp = useRef(0);

    // ── Fetch User Listings ───────────────────────────────────────────────
    const fetchListings = useCallback(async (isRefreshing = false) => {
        if (!user?.id) return;
        
        if (isRefreshing) setIsRefreshingListings(true);
        else setIsListingsLoading(true);

        try {
            const data = await api.getListingsByOwner(user.id);
            setListings(data);
        } catch (err: any) {
            console.error('Failed to fetch user listings:', err);
            // We don't set the global error here to allow profile info to still show
        } finally {
            setIsListingsLoading(false);
            setIsRefreshingListings(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) {
            fetchListings();
        }
    }, [user?.id, fetchListings]);

    // ── Compute UiState from AuthContext ──────────────────────────────────
    const uiState: ProfileUiState = useMemo(() => {
        if (error) {
            return { status: 'error', message: error };
        }
        if (isLoading || (isListingsLoading && listings.length === 0)) {
            return { status: 'loading' };
        } else if (!token || !user) {
            return { status: 'error', message: 'Unable to load profile data.' };
        } else {
            const isProfileIncomplete = !user.bio || !user.skillTags || user.skillTags.length === 0;
            return { status: 'content', data: user, listings, isProfileIncomplete, isRefreshingListings };
        }
    }, [isLoading, token, user, error, isListingsLoading, listings, isRefreshingListings]);

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
                fetchListings(true);
                lastRefreshTimestamp.current = now;
            }

            return () => controller.abort();
        }, [token, refreshUser, fetchListings])
    );

    // ── Actions ───────────────────────────────────────────────────────────
    const handleLogin = useCallback(async (email: string, password: string) => {
        await signIn(email, password);
    }, [signIn]);

    const handleLogout = useCallback(async () => {
        await signOut();
    }, [signOut]);

    const handleRefresh = useCallback(() => {
        if (token) {
            refreshUser();
            fetchListings(true);
        }
    }, [token, refreshUser, fetchListings]);

    return { uiState, handleLogin, handleLogout, handleRefresh };
}
