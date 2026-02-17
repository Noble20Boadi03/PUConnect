/**
 * Review Types
 * 
 * ALIGNED WITH BACKEND:
 * - app/schemas/review.py
 */

// ============================================================================
// REVIEW TYPES
// ============================================================================

/**
 * Review interface - MATCHES backend ReviewResponse
 * Backend: app/schemas/review.py - ReviewResponse
 */
export interface Review {
    id: string;                    // UUID from backend
    rating: number;                // 1-5
    comment: string | null;        // Nullable in backend
    reviewer_id: string;           // User who wrote the review
    listing_id: string;            // Listing being reviewed
    created_at: string;            // ISO datetime string
    updated_at: string;            // Added - new field in backend
}

/**
 * Review creation data - MATCHES backend ReviewCreate
 * Backend: app/schemas/review.py - ReviewCreate
 */
export interface ReviewCreate {
    rating: number;                // 1-5 (validated in backend)
    comment?: string | null;
    listing_id: string;
}

/**
 * Review update data - MATCHES backend ReviewUpdate
 * Backend: app/schemas/review.py - ReviewUpdate
 */
export interface ReviewUpdate {
    rating?: number;               // 1-5 (validated in backend)
    comment?: string | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert backend Review to frontend Review (if needed)
 */
export function mapBackendReview(backendReview: any): Review {
    return {
        id: backendReview.id,
        rating: backendReview.rating,
        comment: backendReview.comment,
        reviewer_id: backendReview.reviewer_id,
        listing_id: backendReview.listing_id,
        created_at: backendReview.created_at,
        updated_at: backendReview.updated_at
    };
}

/**
 * Validate rating (1-5)
 */
export function isValidRating(rating: number): boolean {
    return rating >= 1 && rating <= 5 && Number.isInteger(rating);
}

/**
 * Format rating for display (e.g., "4.5 stars")
 */
export function formatRating(rating: number): string {
    return `${rating.toFixed(1)} ${rating === 1 ? 'star' : 'stars'}`;
}

/**
 * Get star array for rendering (e.g., [1, 1, 1, 0.5, 0] for 3.5 rating)
 */
export function getStarArray(rating: number): number[] {
    const stars: number[] = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars.push(1);
        } else if (rating > i - 1) {
            stars.push(rating - (i - 1));
        } else {
            stars.push(0);
        }
    }
    return stars;
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
}
