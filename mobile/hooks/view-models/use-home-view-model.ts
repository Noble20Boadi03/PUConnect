import { useState, useRef, useCallback, useEffect } from 'react';
import { BackHandler, Platform, ToastAndroid, InteractionManager } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/services/api';
import { Listing } from '@/types';
import { CAMPUS_CATEGORIES, DetailedCategory } from '@/constants/categories';
import { UiState } from '@/types/ui-state';
import { Gradients } from '@/constants/theme';

export interface HomeDashboardData {
    popularSubcategories: { title: string; icon: string; colors: readonly [string, string, ...string[]]; categoryId: string }[];
    recentlyViewed: Listing[];
    featuredServices: Listing[];
    featuredRequests: Listing[];
}

export type HomeUiState = UiState<HomeDashboardData>;
export type HomeFilter = 'All' | 'Services' | 'Requests';

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
            if (filter === 'Services') type = 'service_offer';
            else if (filter === 'Requests') type = 'service_request';

            const data = await api.getListings(0, 20, { type }, signal);

            if (data.length === 0) {
                setUiState({ status: 'empty' });
                return;
            }

            // Popular subcategories (synced with actual categories)
            const popularSubcategories = [
                { title: 'Subject Tutoring', icon: 'book-open-page-variant', colors: Gradients.primary, categoryId: 'academics' },
                { title: 'Website & App Development', icon: 'code-tags', colors: Gradients.secondary, categoryId: 'tech_design' },
                { title: 'Graphic Design', icon: 'palette-outline', colors: Gradients.tertiary, categoryId: 'media_music' },
                { title: 'Event Photography/Video', icon: 'camera-outline', colors: ['#047857', '#065f46'] as const, categoryId: 'media_music' },
                { title: 'CV & Cover Letters', icon: 'file-document-outline', colors: ['#0891b2', '#0e7490'] as const, categoryId: 'biz_career' },
                { title: 'Campus Delivery', icon: 'moped', colors: ['#7c3aed', '#6d28d9'] as const, categoryId: 'campus_life' },
            ];

            const offers = data.filter(l => l.type === 'service_offer');
            const requests = data.filter(l => l.type === 'service_request');

            // Recently viewed (mocked with 3 items from data)
            const recentlyViewed = data.slice(0, 3);

            setUiState({
                status: 'content',
                data: {
                    popularSubcategories,
                    recentlyViewed,
                    featuredServices: offers,
                    featuredRequests: requests,
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

            const interactionTask = InteractionManager.runAfterInteractions(() => {
                if (now - lastRefreshTimestamp.current > throttleMs) {
                    setUiState(prev =>
                        prev.status === 'content'
                            ? { ...prev, isRefreshing: true }
                            : { status: 'loading' }
                    );
                    fetchDashboardData(activeFilter, controller.signal);
                    lastRefreshTimestamp.current = now;
                }
            });

            return () => {
                controller.abort();
                interactionTask.cancel();
            };
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
