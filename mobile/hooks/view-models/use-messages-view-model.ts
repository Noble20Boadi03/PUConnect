import { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { api } from '@/services/api';
import { ChatMessage } from '@/types';
import { useAuth } from '@/context/auth-context';

export type MessagesUiState =
    | { status: 'loading' }
    | { status: 'guest' }
    | { status: 'empty_inbox' }
    | { status: 'content'; data: ChatMessage[]; isRefreshing?: boolean }
    | { status: 'error'; message: string };

export function useMessagesViewModel() {
    const { token, user } = useAuth();
    const [uiState, setUiState] = useState<MessagesUiState>(
        token ? { status: 'loading' } : { status: 'guest' }
    );
    const lastRefreshTimestamp = useRef(0);

    const fetchMessages = useCallback(async (signal?: AbortSignal) => {
        if (!token) {
            setUiState({ status: 'guest' });
            return;
        }

        try {
            const data = await api.getMessages(token, signal);

            if (data.length === 0) {
                setUiState({ status: 'empty_inbox' });
            } else {
                setUiState({ status: 'content', data, isRefreshing: false });
            }
        } catch (error: any) {
            if (error.message === 'Aborted') return;
            setUiState({ status: 'error', message: error.message ?? 'Failed to load messages' });
        }
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            if (!token) {
                setUiState({ status: 'guest' });
                return;
            }

            const controller = new AbortController();
            const now = Date.now();
            const throttleMs = 5 * 60 * 1000;

            if (now - lastRefreshTimestamp.current > throttleMs) {
                setUiState((prev) =>
                    prev.status === 'content'
                        ? { ...prev, isRefreshing: true }
                        : { status: 'loading' }
                );
                fetchMessages(controller.signal);
                lastRefreshTimestamp.current = now;
            }

            return () => controller.abort();
        }, [token, fetchMessages])
    );

    const onRefresh = useCallback(() => {
        if (!token) return;
        const controller = new AbortController();
        setUiState((prev) =>
            prev.status === 'content'
                ? { ...prev, isRefreshing: true }
                : { status: 'loading' }
        );
        fetchMessages(controller.signal);
        lastRefreshTimestamp.current = Date.now();
    }, [token, fetchMessages]);

    return { uiState, user, onRefresh };
}
