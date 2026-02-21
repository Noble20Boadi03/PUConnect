import React from 'react';
import { Listing } from '../../types/listing';
import { Link } from 'react-router-dom';

interface ListingCardProps {
    listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
    return (
        <Link to={`/listings/${listing.id}`} className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Image Container */}
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-100 lg:aspect-none group-hover:opacity-90 transition-opacity lg:h-48 relative">
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm capitalize">
                        {listing.category}
                    </span>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex flex-1 flex-col p-4 space-y-2">
                <div className="flex justify-between items-start">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1 mr-2" title={listing.title}>
                        {listing.title}
                    </h3>
                    <p className="text-sm font-bold text-blue-600 shrink-0">
                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(listing.price)}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-gray-50 text-gray-600 capitalize">
                        {listing.type}
                    </span>
                    <span className="text-xs text-blue-600 font-medium group-hover:underline">
                        View Details &rarr;
                    </span>
                </div>
            </div>
        </Link>
    );
};
