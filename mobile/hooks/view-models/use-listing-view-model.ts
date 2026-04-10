import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { Listing } from '@/types';
import { UiState } from '@/types/ui-state';
import { useAuth } from '@/context/auth-context';

export interface ListingDetailData {
    listing: Listing;
    isOwner: boolean;
}

export type ListingUiState = UiState<ListingDetailData>;

export function useListingViewModel(id: string) {
    const { user } = useAuth();
    const [uiState, setUiState] = useState<ListingUiState>({ status: 'loading' });

    const fetchListing = useCallback(async (signal?: AbortSignal) => {
        setUiState({ status: 'loading' });
        try {
            const response = await api.getListing(id, signal) as any;
            const listing: Listing = {
                ...response,
                ownerId: response.ownerId ?? response.owner_id,
                createdAt: response.createdAt ?? response.created_at,
                requiredSkills: response.requiredSkills ?? response.required_skills,
            };

            setUiState({
                status: 'content',
                data: {
                    listing,
                    isOwner: user?.id === listing.ownerId,
                },
            });
        } catch (error: any) {
            if (error.message === 'Aborted') return;
            setUiState({ status: 'error', message: error.message ?? 'Failed to load listing' });
        }
    }, [id, user?.id]);

    useEffect(() => {
        const controller = new AbortController();
        fetchListing(controller.signal);
        return () => controller.abort();
    }, [id]);

    return { uiState };
}
