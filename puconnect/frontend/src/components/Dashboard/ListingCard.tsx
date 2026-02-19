import React from 'react';
import { Listing, formatPrice } from '../../types/listing';

interface ListingCardProps {
    listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Placeholder for image */}
            <div className="h-40 bg-gray-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full uppercase">
                        {listing.category}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                        {formatPrice(listing.price)}
                    </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
                    {listing.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                    {listing.description || 'No description provided.'}
                </p>
            </div>
        </div>
    );
};

export default ListingCard;
