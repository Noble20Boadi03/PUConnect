import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';
import { Listing } from '../../types/listing';
import { useAuth } from '../../context/AuthContext';

// Define Review Interface locally for now, or move to shared types if used elsewhere
interface Review {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

const ListingDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [listing, setListing] = useState<Listing | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchListingData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Fetch Listing
                const listingRes = await api.get<Listing>(API_ENDPOINTS.LISTINGS.getById(id));
                setListing(listingRes.data);

                // Fetch Reviews
                try {
                    const reviewsRes = await api.get<Review[]>(API_ENDPOINTS.REVIEWS.getByListing(id));
                    setReviews(reviewsRes.data);
                } catch (reviewErr) {
                    console.warn("Failed to fetch reviews", reviewErr);
                    // Don't block whole page if reviews fail
                    setReviews([]);
                }

            } catch (err: any) {
                console.error("Failed to fetch listing details", err);
                setError(err.response?.status === 404 ? "Listing not found." : "Failed to load listing details.");
            } finally {
                setLoading(false);
            }
        };

        fetchListingData();
    }, [id]);

    const handleStartChat = () => {
        if (!listing) return;
        // Navigate to chat with this user
        // Assuming /chat route handles ?userId= param or similar
        navigate(`/chat?userId=${listing.owner_id}`);
    };

    const handlePayNow = async () => {
        if (!listing) return;

        try {
            const response = await api.post(API_ENDPOINTS.PAYMENTS.initiate, {
                listing_id: listing.id,
                amount: listing.price
            });

            // Redirect to authorization URL from backend
            if (response.data.authorization_url) {
                window.location.href = response.data.authorization_url;
            } else {
                alert("Payment initiated but no redirect URL found.");
            }
        } catch (err) {
            console.error("Payment initiation failed", err);
            alert("Failed to initiate payment. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || "Listing not found"}</h2>
                <button
                    onClick={() => navigate('/listings')}
                    className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                    &larr; Back to Listings
                </button>
            </div>
        );
    }

    const isOwner = user?.id === listing.owner_id;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => navigate('/listings')}
                className="mb-6 text-sm text-gray-500 hover:text-gray-900 flex items-center"
            >
                &larr; Back to Listings
            </button>

            <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">

                {/* Image Gallery */}
                <div className="flex flex-col-reverse">
                    <div className="w-full aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                        {/* Mock image for now if none exists */}
                        <img
                            src={`https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800`}
                            alt={listing.title}
                            className="w-full h-full object-center object-cover"
                        />
                    </div>
                </div>

                {/* Listing Info */}
                <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                    <div className="mb-4">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{listing.title}</h1>
                        <div className="mt-2 flex items-center space-x-4">
                            <span className="text-2xl font-bold text-blue-600">
                                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(listing.price)}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${listing.type === 'product' ? 'bg-green-100 text-green-800 border-green-200' :
                                'bg-blue-100 text-blue-800 border-blue-200'
                                }`}>
                                {listing.type}
                            </span>
                            <span className="text-sm text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded">{listing.category}</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="sr-only">Description</h3>
                        <div className="text-base text-gray-700 space-y-6">
                            {listing.description || "No description provided."}
                        </div>
                    </div>

                    {/* Seller Info */}
                    <div className="mt-8 border-t border-gray-200 pt-8">
                        <h3 className="text-sm font-medium text-gray-900">Seller Information</h3>
                        <div className="mt-4 flex items-center">
                            <div className="flex-shrink-0">
                                <span className="inline-block h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Verified Seller</p>
                                <p className="text-xs text-gray-500">Member since {new Date(listing.created_at).getFullYear()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-10 flex sm:flex-col1">
                        {!isOwner ? (
                            <div className="flex space-x-4 w-full">
                                <button
                                    type="button"
                                    onClick={handlePayNow}
                                    className="flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Pay Now
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStartChat}
                                    className="flex-1 bg-white border border-gray-300 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Start Chat
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => navigate(`/listings/edit/${listing.id}`)} // Route to be created
                                className="w-full bg-gray-100 border border-gray-300 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Edit Listing
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16 border-t border-gray-200 pt-10">
                <h2 className="text-lg font-bold text-gray-900">Reviews</h2>
                <div className="mt-6 space-y-10 divide-y divide-gray-200 border-b border-gray-200 pb-10">
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className="pt-10 lg:grid lg:grid-cols-12 lg:gap-x-8 first:pt-0">
                                <div className="lg:col-span-8 lg:col-start-5 xl:col-span-9 xl:col-start-4 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:items-start">
                                    <div className="flex items-center xl:col-span-1">
                                        <div className="flex items-center text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`h-5 w-5 flex-shrink-0 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="ml-3 text-sm text-gray-700 capitalize font-medium">{review.userName}</p>
                                    </div>

                                    <div className="mt-4 lg:mt-6 xl:mt-0 xl:col-span-2">
                                        <div
                                            className="mt-3 space-y-6 text-sm text-gray-500"
                                            dangerouslySetInnerHTML={{ __html: review.comment }}
                                        />
                                        <p className="mt-2 text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">No reviews yet for this listing.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListingDetail;
