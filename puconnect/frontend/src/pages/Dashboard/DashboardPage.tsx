import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import StatsCard from '../../components/Dashboard/StatsCard';
import ListingCard from '../../components/Dashboard/ListingCard';
import ChatPreview from '../../components/Dashboard/ChatPreview';
import PaymentSummary from '../../components/Dashboard/PaymentSummary';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';
import { Listing } from '../../types/listing';
import { ChatMessage, Conversation } from '../../types/chat';
import { Payment, PaymentStatus } from '../../types/payment';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalListings: 0,
        activeChats: 0,
        pendingPayments: 0,
    });
    const [recommendations, setRecommendations] = useState<Listing[]>([]);
    const [recentChats, setRecentChats] = useState<Conversation[]>([]);
    const [recentPayments, setRecentPayments] = useState<Payment[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch all data in parallel
                const [listingsRes, chatsRes, paymentsRes, recsRes] = await Promise.all([
                    api.get<Listing[]>(API_ENDPOINTS.LISTINGS.listAll),
                    api.get<ChatMessage[]>(API_ENDPOINTS.CHAT.myChats),
                    api.get<Payment[]>(API_ENDPOINTS.PAYMENTS.list),
                    api.get<Listing[]>(API_ENDPOINTS.RECOMMENDATIONS.getForUser),
                ]);

                // 1. Process Listings (Total owned by user)
                const userListings = listingsRes.data.filter(l => l.owner_id === user?.id);

                // 2. Process Chats (Unique conversations)
                const conversationsMap = new Map<string, Conversation>();
                chatsRes.data.forEach(msg => {
                    const otherUserId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
                    const conversationKey = `${otherUserId}-${msg.listing_id}`;

                    if (!conversationsMap.has(conversationKey)) {
                        conversationsMap.set(conversationKey, {
                            user_id: otherUserId,
                            user_name: msg.sender_id === user?.id ? 'System User' : 'You', // In a real app, fetch user names
                            listing_id: msg.listing_id,
                            listing_title: 'Loading...', // Ideally listing details should be joined
                            last_message: msg.message,
                            last_message_time: msg.created_at,
                            unread_count: msg.receiver_id === user?.id && !msg.is_read ? 1 : 0
                        });
                    } else {
                        const existing = conversationsMap.get(conversationKey)!;
                        if (msg.receiver_id === user?.id && !msg.is_read) {
                            existing.unread_count += 1;
                        }
                    }
                });
                const conversations = Array.from(conversationsMap.values());

                // 3. Process Payments
                const pending = paymentsRes.data.filter(p => p.status === PaymentStatus.PENDING);

                setStats({
                    totalListings: userListings.length,
                    activeChats: conversations.length,
                    pendingPayments: pending.length,
                });

                setRecommendations(recsRes.data.slice(0, 4));
                setRecentChats(conversations.slice(0, 3));
                setRecentPayments(paymentsRes.data.slice(0, 5));

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Welcome Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {user?.full_name}!
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Here's what's happening with your PUConnect account today.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatsCard
                            title="Total Listings"
                            value={stats.totalListings}
                            colorClass="text-blue-600 bg-blue-600"
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            }
                        />
                        <StatsCard
                            title="Active Chats"
                            value={stats.activeChats}
                            colorClass="text-green-600 bg-green-600"
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            }
                        />
                        <StatsCard
                            title="Pending Payments"
                            value={stats.pendingPayments}
                            colorClass="text-orange-600 bg-orange-600"
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recommendations */}
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
                                </div>
                                {recommendations.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {recommendations.map(listing => (
                                            <ListingCard key={listing.id} listing={listing} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
                                        <p className="text-gray-500">No recommendations found. Try browsing some products!</p>
                                    </div>
                                )}
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Recent Payments</h2>
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">History</button>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                    {recentPayments.length > 0 ? (
                                        recentPayments.map(payment => (
                                            <PaymentSummary key={payment.id} payment={payment} />
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <p className="text-gray-500">No recent payments.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Recent Chats */}
                        <div className="space-y-8">
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Recent Chats</h2>
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">All Chats</button>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm divide-y divide-gray-100">
                                    {recentChats.length > 0 ? (
                                        recentChats.map((chat, idx) => (
                                            <ChatPreview key={idx} conversation={chat} />
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <p className="text-gray-500">No active conversations.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
