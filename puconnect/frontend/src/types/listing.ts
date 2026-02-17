/**
 * Listing Types
 * 
 * ALIGNED WITH BACKEND:
 * - app/schemas/listing.py
 * - app/models/enums.py (ListingType)
 */

// ============================================================================
// ENUMS (Must match backend exactly)
// ============================================================================

/**
 * Listing type enum - MATCHES backend ListingType
 * Backend: app/models/enums.py
 */
export enum ListingType {
    SERVICE = 'service',
    PRODUCT = 'product'
}

// ============================================================================
// LISTING TYPES
// ============================================================================

/**
 * Listing interface - MATCHES backend ListingResponse
 * Backend: app/schemas/listing.py - ListingResponse
 */
export interface Listing {
    id: string;                    // UUID from backend
    title: string;
    description: string | null;    // Nullable in backend
    price: number;
    category: string;              // Free-form string in backend
    type: ListingType;             // Added from backend
    owner_id: string;              // Changed from sellerId (matches backend)
    is_active: boolean;            // Added from backend
    created_at: string;            // ISO datetime string
    updated_at: string;            // Added - new field in backend
}

/**
 * Listing creation data - MATCHES backend ListingCreate
 * Backend: app/schemas/listing.py - ListingCreate
 */
export interface ListingCreate {
    title: string;
    description?: string | null;
    price: number;
    category: string;
    type: ListingType;
    is_active?: boolean;           // Optional, defaults to true
}

/**
 * Listing update data - MATCHES backend ListingUpdate
 * Backend: app/schemas/listing.py - ListingUpdate
 */
export interface ListingUpdate {
    title?: string;
    description?: string | null;
    price?: number;
    category?: string;
    type?: ListingType;
    is_active?: boolean;
}

/**
 * Listing filters for search/filtering
 */
export interface ListingFilters {
    search: string;
    category: string;
    type?: ListingType;
    min_price?: number;
    max_price?: number;
    is_active?: boolean;
    owner_id?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert backend Listing to frontend Listing (if needed)
 */
export function mapBackendListing(backendListing: any): Listing {
    return {
        id: backendListing.id,
        title: backendListing.title,
        description: backendListing.description,
        price: backendListing.price,
        category: backendListing.category,
        type: backendListing.type as ListingType,
        owner_id: backendListing.owner_id,
        is_active: backendListing.is_active,
        created_at: backendListing.created_at,
        updated_at: backendListing.updated_at
    };
}

/**
 * Check if listing is a service
 */
export function isService(listing: Listing): boolean {
    return listing.type === ListingType.SERVICE;
}

/**
 * Check if listing is a product
 */
export function isProduct(listing: Listing): boolean {
    return listing.type === ListingType.PRODUCT;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(price);
}
