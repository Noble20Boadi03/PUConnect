export interface Listing {
    id: string;
    title: string;
    description: string;
    price: number;
    category: 'textbooks' | 'electronics' | 'furniture' | 'clothing' | 'other';
    imageUrls: string[];
    sellerId: string;
    sellerName?: string; // Added optional sellerName
    createdAt: string;
    condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
}

export interface ListingFilters {
    search: string;
    category: string;
    minPrice: number | '';
    maxPrice: number | '';
}
