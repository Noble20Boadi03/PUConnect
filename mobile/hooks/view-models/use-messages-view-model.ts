import { useState, useRef, useCallback } from 'react';
import { InteractionManager } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/services/api';
import { ChatMessage } from '@/types';
import { useAuth } from '@/context/auth-context';

export type MessagesUiState =
    | { status: 'loading' }
    | { status: 'empty_inbox' }
    | { status: 'content'; data: ChatMessage[]; isRefreshing?: boolean }
    | { status: 'error'; message: string };

export function useMessagesViewModel() {
    const { token, user } = useAuth();
    const [uiState, setUiState] = useState<MessagesUiState>({ status: 'loading' });
    const lastRefreshTimestamp = useRef(0);

    const fetchMessages = useCallback(async (signal?: AbortSignal) => {
        try {
            const data = await api.getMessages(token!, signal);

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
            const controller = new AbortController();
            const now = Date.now();
            const throttleMs = 5 * 60 * 1000;

            const interactionTask = InteractionManager.runAfterInteractions(() => {
                if (now - lastRefreshTimestamp.current > throttleMs) {
                    setUiState((prev) =>
                        prev.status === 'content'
                            ? { ...prev, isRefreshing: true }
                            : { status: 'loading' }
                    );
                    fetchMessages(controller.signal);
                    lastRefreshTimestamp.current = now;
                }
            });

            return () => {
                controller.abort();
                interactionTask.cancel();
            };
        }, [fetchMessages])
    );

    const onRefresh = useCallback(() => {
        const controller = new AbortController();
        setUiState((prev) =>
            prev.status === 'content'
                ? { ...prev, isRefreshing: true }
                : { status: 'loading' }
        );
        fetchMessages(controller.signal);
        lastRefreshTimestamp.current = Date.now();
    }, [fetchMessages]);

    return { uiState, user, onRefresh };
}
