import { useState, useRef, useCallback } from 'react';
import { BackHandler, Platform, ToastAndroid } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/services/api';
import { Listing } from '@/types';
import { UiState } from '@/types/ui-state';

export interface HomeDashboardData {
    popular: Listing[];
    recommended: Listing[];
    recent: Listing[];
    trending: Listing[];
    lastOrderRecs: Listing[];
}

export type HomeUiState = UiState<HomeDashboardData>;

export function useHomeViewModel() {
    const [uiState, setUiState] = useState<HomeUiState>({ status: 'loading' });
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
    const fetchDashboardData = useCallback(async (signal?: AbortSignal) => {
        try {
            const data = await api.getListings(0, 10, undefined, signal);

            if (data.length === 0) {
                setUiState({ status: 'empty' });
                return;
            }

            setUiState({
                status: 'content',
                data: {
                    popular: data.slice(0, 5),
                    recommended: data.slice(2, 7),
                    trending: data.slice(5, 10),
                    recent: data.slice(1, 4),
                    lastOrderRecs: data.slice(4, 9),
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
                fetchDashboardData(controller.signal);
                lastRefreshTimestamp.current = now;
            }

            return () => controller.abort();
        }, [fetchDashboardData])
    );

    // ── Pull to Refresh ───────────────────────────────────────────────────
    const onRefresh = useCallback(() => {
        const controller = new AbortController();
        setUiState(prev =>
            prev.status === 'content'
                ? { ...prev, isRefreshing: true }
                : { status: 'loading' }
        );
        fetchDashboardData(controller.signal);
        lastRefreshTimestamp.current = Date.now();
    }, [fetchDashboardData]);

    return { uiState, onRefresh };
}
