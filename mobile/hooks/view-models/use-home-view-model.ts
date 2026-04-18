import { useState, useRef, useCallback } from 'react';
import { BackHandler, Platform, ToastAndroid } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/services/api';
import { Listing } from '@/types';
import { CAMPUS_CATEGORIES, DetailedCategory } from '@/constants/categories';
import { UiState } from '@/types/ui-state';
import { Gradients } from '@/constants/theme';

export interface HomeDashboardData {
    popular: { category: DetailedCategory; colors: readonly [string, string, ...string[]] }[];
    trending: Listing[];
    featuredOffers: Listing[];
    featuredGigs: Listing[];
}

export type HomeUiState = UiState<HomeDashboardData>;
export type HomeFilter = 'All' | 'Experts' | 'Gigs';

export function useHomeViewModel() {
    const [uiState, setUiState] = useState<HomeUiState>({ status: 'loading' });
    const [activeFilter, setActiveFilter] = useState<HomeFilter>('All');
    const lastRefreshTimestamp = useRef(0);
    const lastBackPress = useRef(0);

    // ── Double Back to Exit ───────────────────────────────────────────────
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                const currentTime = Date.now();
                if (currentTime - lastBackPress.current < 2000) {
                    BackHandler.exitApp();
                    return true;
                }
                lastBackPress.current = currentTime;
                if (Platform.OS === 'android') {
                    ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
                }
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    // ── Data Fetching ─────────────────────────────────────────────────────
    const fetchDashboardData = useCallback(async (filter: HomeFilter, signal?: AbortSignal) => {
        try {
            let type: 'service_offer' | 'service_request' | undefined = undefined;
            if (filter === 'Experts') type = 'service_offer';
            else if (filter === 'Gigs') type = 'service_request';

            const data = await api.getListings(0, 20, { type }, signal);

            if (data.length === 0) {
                setUiState({ status: 'empty' });
                return;
            }

            const popularCats = [
                { category: CAMPUS_CATEGORIES.find(c => c.id === 'tutoring')!, colors: Gradients.primary },
                { category: CAMPUS_CATEGORIES.find(c => c.id === 'tech')!, colors: Gradients.secondary },
                { category: CAMPUS_CATEGORIES.find(c => c.id === 'design')!, colors: Gradients.tertiary },
                { category: CAMPUS_CATEGORIES.find(c => c.id === 'career')!, colors: ['#047857', '#065f46'] as const }, // Forest Green
                { category: CAMPUS_CATEGORIES.find(c => c.id === 'photo')!, colors: ['#0891b2', '#0e7490'] as const }, // Deep Teal
            ].filter(item => item.category);

            const offers = data.filter(l => l.type === 'service_offer');
            const gigs = data.filter(l => l.type === 'service_request');

            setUiState({
                status: 'content',
                data: {
                    popular: popularCats,
                    trending: data.slice(0, 10),
                    featuredOffers: offers,
                    featuredGigs: gigs,
                },
                isRefreshing: false,
            });
        } catch (error: any) {
            if (error.message === 'Aborted') return;
            setUiState({ status: 'error', message: error.message ?? 'Failed to load listings' });
        }
    }, []);

    // ── Throttled Focus Refresh ───────────────────────────────────────────
    useFocusEffect(
        useCallback(() => {
            const controller = new AbortController();
            const now = Date.now();
            const throttleMs = 5 * 60 * 1000;

            if (now - lastRefreshTimestamp.current > throttleMs) {
                setUiState(prev =>
                    prev.status === 'content'
                        ? { ...prev, isRefreshing: true }
                        : { status: 'loading' }
                );
                fetchDashboardData(activeFilter, controller.signal);
                lastRefreshTimestamp.current = now;
            }

            return () => controller.abort();
        }, [fetchDashboardData, activeFilter])
    );

    // ── Pull to Refresh ───────────────────────────────────────────────────
    const onRefresh = useCallback(() => {
        const controller = new AbortController();
        setUiState(prev =>
            prev.status === 'content'
                ? { ...prev, isRefreshing: true }
                : { status: 'loading' }
        );
        fetchDashboardData(activeFilter, controller.signal);
        lastRefreshTimestamp.current = Date.now();
    }, [fetchDashboardData, activeFilter]);

    return { uiState, onRefresh, activeFilter, setActiveFilter };
}
