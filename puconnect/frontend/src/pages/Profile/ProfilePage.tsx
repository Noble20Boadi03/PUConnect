import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Dashboard/Sidebar';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';
import TransactionHistory from './TransactionHistory';
// import { User } from '../../types/auth';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        university_id: user?.university_id || '',
        email: user?.email || '',
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name,
                university_id: user.university_id,
                email: user.email,
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await api.patch(API_ENDPOINTS.USERS.updateProfile, formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
            // In a real app, you might want to refresh the user context here
            // window.location.reload(); 
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                        <p className="text-gray-600 mt-1">Manage your profile information and preferences.</p>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Banner & Avatar Section */}
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                            <div className="absolute -bottom-16 left-8">
                                <div className="h-32 w-32 rounded-2xl bg-white p-2 shadow-lg">
                                    <div className="h-full w-full rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold">
                                        {user.full_name ? user.full_name.charAt(0) : ''}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-20 pb-8 px-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                                    <p className="text-gray-500">{user.role.toUpperCase()} • ID: {user.university_id}</p>
                                </div>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${isEditing
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                                        }`}
                                >
                                    {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                                </button>
                            </div>

                            {message && (
                                <div className={`mb-6 p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">University ID</label>
                                        <input
                                            type="text"
                                            name="university_id"
                                            value={formData.university_id}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Account Role</label>
                                        <input
                                            type="text"
                                            value={user.role}
                                            disabled
                                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center transition-all disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Updating...
                                                </>
                                            ) : 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Stats & Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-gray-500 text-sm font-medium mb-1">Member Since</div>
                            <div className="text-xl font-bold text-gray-900">
                                {new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-gray-500 text-sm font-medium mb-1">University Verified</div>
                            <div className="text-xl font-bold text-green-600 flex items-center">
                                Verified
                                <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-gray-500 text-sm font-medium mb-1">Trust Score</div>
                            <div className="text-xl font-bold text-blue-600">Excellent</div>
                        </div>
                    </div>

                    {/* Security Section Placeholder */}
                    <div className="mt-8 bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-blue-900 text-lg">Security Settings</h3>
                                <p className="text-blue-700 text-sm">Review your password and account security options.</p>
                            </div>
                        </div>
                        <button className="text-blue-700 font-bold hover:underline">Manage Security</button>
                    </div>

                    {/* Transaction History Section */}
                    <TransactionHistory />
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
