import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { User, SubcategoryFilter } from '@/types';
import { UiState } from '@/types/ui-state';

export interface SubcategoryData {
    providers: (User & { startingPrice?: number })[];
    filtersConfig: SubcategoryFilter[];
}

export type SubcategoryUiState = UiState<SubcategoryData>;

interface SubcategoryParams {
    subcategoryTitle: string;
    category?: string;
}

export function useSubcategoryViewModel({ subcategoryTitle, category }: SubcategoryParams) {
    const [uiState, setUiState] = useState<SubcategoryUiState>({ status: 'loading' });
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
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

                Object.entries(activeFilters).forEach(([key, values]) => {
                    const lowerKey = key.toLowerCase();
                    const valStr = values.join(',');
                    if (lowerKey.includes('rating')) apiFilters.sortBy = 'rating';
                    else if (lowerKey.includes('price')) apiFilters.sortBy = 'price';
                    else if (lowerKey === 'department') apiFilters.department = valStr;
                    else if (lowerKey === 'academic level' || lowerKey === 'level') apiFilters.level = valStr;
                    else apiFilters.tag = valStr;
                });

                const [providers, filters] = await Promise.all([
                    api.getProvidersBySubcategory(subcategoryTitle, controller.signal),
                    api.getSubcategoryFilters(subcategoryTitle)
                ]);

                setUiState(prev => ({
                    status: 'content',
                    isRefreshing: false,
                    data: {
                        providers,
                        filtersConfig: filters,
                    },
                }));

                if (providers.length === 0) {
                    setUiState(prev => ({
                        status: 'content',
                        isRefreshing: false,
                        data: {
                            providers: [],
                            filtersConfig: filters,
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

    // ── Actions ───────────────────────────────────────────────────────────
    const selectFilter = useCallback((filterLabel: string, optionValue: string, isMulti: boolean = false) => {
        setActiveFilters(prev => {
            const current = prev[filterLabel] || [];
            if (isMulti) {
                if (current.includes(optionValue)) {
                    const next = current.filter(val => val !== optionValue);
                    if (next.length === 0) {
                        const copy = { ...prev };
                        delete copy[filterLabel];
                        return copy;
                    }
                    return { ...prev, [filterLabel]: next };
                } else {
                    return { ...prev, [filterLabel]: [...current, optionValue] };
                }
            } else {
                return { ...prev, [filterLabel]: [optionValue] };
            }
        });
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
