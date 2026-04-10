import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { Listing, SubcategoryFilter } from '@/types';
import { UiState } from '@/types/ui-state';

export interface SubcategoryData {
    listings: Listing[];
    filtersConfig: SubcategoryFilter[];
}

export type SubcategoryUiState = UiState<SubcategoryData>;

interface SubcategoryParams {
    subcategoryTitle: string;
    category?: string;
}

export function useSubcategoryViewModel({ subcategoryTitle, category }: SubcategoryParams) {
    const [uiState, setUiState] = useState<SubcategoryUiState>({ status: 'loading' });
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const [activeModalFilter, setActiveModalFilter] = useState<SubcategoryFilter | null>(null);

    // ── Load listings whenever subcategory or filters change ─────────────
    useEffect(() => {
        const controller = new AbortController();

        const fetchListings = async () => {
            setUiState(prev =>
                prev.status === 'content'
                    ? { ...prev, isRefreshing: true }
                    : { status: 'loading' }
            );

            try {
                const apiFilters: any = { category, subcategory: subcategoryTitle };

                Object.entries(activeFilters).forEach(([key, value]) => {
                    const lowerKey = key.toLowerCase();
                    if (lowerKey.includes('rating')) apiFilters.sortBy = 'rating';
                    else if (lowerKey.includes('price')) apiFilters.sortBy = 'price';
                    else if (lowerKey === 'department') apiFilters.department = value;
                    else if (lowerKey === 'academic level' || lowerKey === 'level') apiFilters.level = value;
                    else apiFilters.tag = value;
                });

                const listings = await api.getListings(0, 20, apiFilters, controller.signal);

                setUiState(prev => ({
                    status: 'content',
                    isRefreshing: false,
                    data: {
                        listings,
                        filtersConfig: prev.status === 'content' ? prev.data.filtersConfig : [],
                    },
                }));

                if (listings.length === 0) {
                    setUiState(prev => ({
                        status: 'content',
                        isRefreshing: false,
                        data: {
                            listings: [],
                            filtersConfig: prev.status === 'content' ? prev.data.filtersConfig : [],
                        },
                    }));
                }
            } catch (error: any) {
                if (error.message === 'Aborted') return;
                setUiState({ status: 'error', message: error.message ?? 'Failed to load listings' });
            }
        };

        fetchListings();
        return () => controller.abort();
    }, [subcategoryTitle, activeFilters, category]);

    // ── Load dynamic filter config (independent of filter selection) ──────
    useEffect(() => {
        const controller = new AbortController();

        const loadFilters = async () => {
            try {
                const filters = await api.getSubcategoryFilters(subcategoryTitle);
                setUiState(prev => {
                    if (prev.status !== 'content') return prev;
                    return {
                        ...prev,
                        data: { ...prev.data, filtersConfig: filters },
                    };
                });
            } catch (err: any) {
                if (err.message === 'Aborted') return;
                console.error('Failed to load subcategory filters', err);
            }
        };

        loadFilters();
        return () => controller.abort();
    }, [subcategoryTitle]);

    // ── Actions ───────────────────────────────────────────────────────────
    const selectFilter = useCallback((filterLabel: string, optionValue: string) => {
        setActiveFilters(prev => ({ ...prev, [filterLabel]: optionValue }));
        setActiveModalFilter(null);
    }, []);

    const clearFilter = useCallback((filterLabel: string) => {
        if (filterLabel === '__all__') {
            setActiveFilters({});
        } else {
            setActiveFilters(prev => {
                const next = { ...prev };
                delete next[filterLabel];
                return next;
            });
        }
    }, []);

    const onRefresh = useCallback(() => {
        // Force refetch by clearing and resetting the state
        setUiState({ status: 'loading' });
        // Trigger fetch by re-creating active filters reference (no-op if empty)
        setActiveFilters(prev => ({ ...prev }));
    }, []);

    return {
        uiState,
        activeFilters,
        activeModalFilter,
        setActiveModalFilter,
        selectFilter,
        clearFilter,
        onRefresh,
    };
}
