import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';
import { ListingType } from '../../types/listing';

const CreateListingPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Determine the type from URL query string
    const typeParam = searchParams.get('type');
    const initialType = typeParam === 'service' ? ListingType.SERVICE : ListingType.PRODUCT;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: initialType === ListingType.SERVICE ? 'services' : 'electronics',
        type: initialType,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const categories = [
        'electronics',
        'textbooks',
        'furniture',
        'clothing',
        'services',
        'other'
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                is_active: true
            };
            await api.post(API_ENDPOINTS.LISTINGS.create, payload);
            navigate('/listings');
        } catch (err: any) {
            console.error("Failed to create listing", err);
            setError(err.response?.data?.detail || "Failed to create listing. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header Info */}
                    <div className="mb-8 flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-gray-500 hover:text-gray-900 font-bold transition-colors group"
                        >
                            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </button>
                        <div className="text-right">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${formData.type === ListingType.SERVICE
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                                }`}>
                                {formData.type} listing
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
                        {/* Decorative Header */}
                        <div className={`px-8 py-12 text-white relative overflow-hidden ${formData.type === ListingType.SERVICE
                                ? 'bg-gradient-to-br from-teal-500 to-green-600'
                                : 'bg-gradient-to-br from-indigo-500 to-blue-600'
                            }`}>
                            {/* Abstract background elements */}
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black opacity-10 rounded-full blur-3xl"></div>

                            <div className="relative z-10">
                                <h1 className="text-4xl font-black tracking-tight leading-tight">
                                    {formData.type === ListingType.SERVICE ? 'Share your expertise' : 'Find a new home for it'}
                                </h1>
                                <p className="text-blue-50/80 mt-3 font-medium text-lg max-w-md">
                                    {formData.type === ListingType.SERVICE
                                        ? "List your service and start helping your fellow Pan-Atlantic university students."
                                        : "Selling is easy. Just add a title, price, and description to get started."}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            {error && (
                                <div className="bg-red-50 border-2 border-red-100 p-5 rounded-2xl flex items-start space-x-3">
                                    <svg className="w-6 h-6 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-red-700 font-bold">{error}</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Title Input */}
                                <div className="group">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-blue-500 transition-colors">
                                        Listing Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder={formData.type === ListingType.SERVICE ? "e.g., Python Programming Tutor" : "e.g., Slightly used Calculus Textbook"}
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 bg-gray-50/50 focus:bg-white transition-all outline-none text-gray-800 font-semibold placeholder:text-gray-300"
                                    />
                                </div>

                                {/* Price and Category Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="group">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-blue-500 transition-colors">
                                            Price (₦)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                                            <input
                                                type="number"
                                                name="price"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                className="w-full pl-10 pr-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 bg-gray-50/50 focus:bg-white transition-all outline-none text-gray-800 font-semibold placeholder:text-gray-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-blue-500 transition-colors">
                                            Category
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 bg-gray-50/50 focus:bg-white transition-all outline-none text-gray-800 font-semibold appearance-none cursor-pointer capitalize"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description Input */}
                                <div className="group">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-blue-500 transition-colors">
                                        Detailed Description
                                    </label>
                                    <textarea
                                        name="description"
                                        rows={6}
                                        required
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Tell us more about it! Condition, delivery details, availability, etc."
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-500 bg-gray-50/50 focus:bg-white transition-all outline-none text-gray-800 font-semibold placeholder:text-gray-300 resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-5 rounded-2xl text-white font-black text-lg transition-all active:scale-[0.98] shadow-xl hover:shadow-2xl ${loading
                                            ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                            : formData.type === ListingType.SERVICE
                                                ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-200'
                                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                        }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Publishing...
                                        </div>
                                    ) : (
                                        `List ${formData.type === ListingType.SERVICE ? 'Service' : 'Product'} Now`
                                    )}
                                </button>
                                <p className="text-center text-gray-400 text-xs mt-6 font-bold uppercase tracking-tighter">
                                    By posting, you agree to PUConnect marketplace terms
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateListingPage;
