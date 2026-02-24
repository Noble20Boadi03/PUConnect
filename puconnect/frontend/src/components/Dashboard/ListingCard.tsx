import React from 'react';
import { Listing, formatPrice } from '../../types/listing';

interface ListingCardProps {
    listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer">
            {/* Image Section */}
            <div className="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 text-[10px] font-bold text-blue-600 bg-blue-50/80 backdrop-blur-sm rounded-lg uppercase tracking-wider">
                        {listing.category}
                    </span>
                </div>
                <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 text-[10px] font-bold text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg uppercase tracking-wider shadow-sm border border-gray-100">
                        {listing.type || 'Product'}
                    </span>
                </div>

                <div className="text-4xl font-black text-gray-200 select-none group-hover:scale-110 transition-transform duration-500">
                    {listing.type === 'service' ? 'SVC' : 'PRD'}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {listing.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed min-h-[32px]">
                    {listing.description || 'No description provided.'}
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-black text-blue-600">
                        {formatPrice(listing.price)}
                    </span>
                    <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs font-bold text-gray-700">4.8</span>
                        <span className="text-[10px] text-gray-400 font-medium">(12)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingCard;
