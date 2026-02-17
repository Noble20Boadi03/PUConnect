/**
 * Common/Shared Types
 * 
 * Types used across multiple modules
 */

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API error response
 */
export interface APIError {
    detail: string | ErrorDetail[];
    status_code?: number;
}

/**
 * Detailed error information (for validation errors)
 */
export interface ErrorDetail {
    loc: (string | number)[];
    msg: string;
    type: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    skip: number;
    limit: number;
    has_more: boolean;
}

/**
 * Success response wrapper
 */
export interface SuccessResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
    skip?: number;
    limit?: number;
}

/**
 * Sort parameters
 */
export interface SortParams {
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Date range filter
 */
export interface DateRange {
    start_date?: string;
    end_date?: string;
}

/**
 * Price range filter
 */
export interface PriceRange {
    min_price?: number;
    max_price?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Omit multiple properties
 */
export type OmitMultiple<T, K extends keyof T> = Omit<T, K>;

// ============================================================================
// FORM TYPES
// ============================================================================

/**
 * Form field error
 */
export interface FieldError {
    field: string;
    message: string;
}

/**
 * Form state
 */
export interface FormState<T> {
    values: T;
    errors: Record<keyof T, string>;
    touched: Record<keyof T, boolean>;
    isSubmitting: boolean;
    isValid: boolean;
}

// ============================================================================
// LOADING STATES
// ============================================================================

/**
 * Loading state for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Async operation state
 */
export interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Type guard to check if error is APIError
 */
export function isAPIError(error: any): error is APIError {
    return error && typeof error === 'object' && 'detail' in error;
}

/**
 * Extract error message from various error formats
 */
export function getErrorMessage(error: unknown): string {
    if (typeof error === 'string') return error;

    if (isAPIError(error)) {
        if (typeof error.detail === 'string') return error.detail;
        if (Array.isArray(error.detail)) {
            return error.detail.map(e => e.msg).join(', ');
        }
    }

    if (error instanceof Error) return error.message;

    return 'An unknown error occurred';
}
