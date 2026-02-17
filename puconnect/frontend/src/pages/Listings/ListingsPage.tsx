import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { Listing } from '../../types/listing';
import { ListingCard } from '../../components/listing/ListingCard';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';

const PAGE_SIZE = 12;

const ListingsPage: React.FC = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');



    const [priceRange, setPriceRange] = useState<{ min: number | ''; max: number | '' }>({ min: '', max: '' });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch Listings
    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                // In a real production app, we would pass filters to backend for server-side filtering
                // For this requirements ("Paginate results (client-side first)"), we'll fetch all and filter in memory
                // or fetch a reasonable initial batch. Let's assume listAll returns a list.
                const response = await api.get<Listing[]>(API_ENDPOINTS.LISTINGS.listAll);
                setListings(response.data);
                setFilteredListings(response.data);
            } catch (err) {
                console.error("Failed to fetch listings", err);
                setError("Failed to load listings. Please try again later.");
                // Fallback / Mock Data for demonstration if API fails or is empty during dev
                // (Optional: remove this in strict production)
                // setListings([]); 
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    // Apply Filters Effect
    useEffect(() => {
        let result = listings;

        // Search Filter
        if (debouncedSearchTerm) {
            const lowerTerm = debouncedSearchTerm.toLowerCase();
            result = result.filter(listing =>
                listing.title.toLowerCase().includes(lowerTerm) ||
                listing.description.toLowerCase().includes(lowerTerm)
            );
        }

        // Category Filter
        if (selectedCategory !== 'all') {
            result = result.filter(listing => listing.category === selectedCategory);
        }

        // Price Filter
        if (priceRange.min !== '') {
            result = result.filter(listing => listing.price >= (priceRange.min as number));
        }
        if (priceRange.max !== '') {
            result = result.filter(listing => listing.price <= (priceRange.max as number));
        }

        setFilteredListings(result);
        setCurrentPage(1); // Reset to first page on filter change
    }, [listings, debouncedSearchTerm, selectedCategory, priceRange]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredListings.length / PAGE_SIZE);
    const paginatedListings = filteredListings.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const categories = ['all', 'textbooks', 'electronics', 'furniture', 'clothing', 'other'];

    if (loading && listings.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 text-indigo-600 hover:text-indigo-500 underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Marketplace Listings</h1>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                        type="text"
                        placeholder="Search listings..."
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border capitalize"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Price Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                    <div className="flex space-x-2">
                        <input
                            type="number"
                            placeholder="Min"
                            className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : '' }))}
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : '' }))}
                        />
                    </div>
                </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedListings.length > 0 ? (
                    paginatedListings.map(listing => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No listings found matching your criteria.
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center space-x-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-700 flex items-center">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ListingsPage;
