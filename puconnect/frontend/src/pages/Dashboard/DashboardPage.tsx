import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import StatsCard from "../../components/Dashboard/StatsCard";
import ListingCard from "../../components/Dashboard/ListingCard";
import ChatPreview from "../../components/Dashboard/ChatPreview";
import QuickActions from "../../components/Dashboard/QuickActions";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { Listing } from "../../types/listing";
import { ChatMessage, Conversation } from "../../types/chat";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeListings: 0,
    totalViews: "1,247",
    messagesCount: 0,
    avgRating: "4.8",
  });
  const [recommendations, setRecommendations] = useState<Listing[]>([]);
  const [recentChats, setRecentChats] = useState<Conversation[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch data in parallel
        const [listingsRes, chatsRes, recsRes] = await Promise.all([
          api.get<Listing[]>(API_ENDPOINTS.LISTINGS.listAll),
          api.get<ChatMessage[]>(API_ENDPOINTS.CHAT.myChats),
          api.get<Listing[]>(API_ENDPOINTS.RECOMMENDATIONS.getForUser),
        ]);

        // 1. Process Listings (Active ones owned by user)
        const userListings = listingsRes.data.filter(
          (l) => l.owner_id === user?.id && l.is_active,
        );

        // 2. Process Chats (Unique conversations)
        const conversationsMap = new Map<string, Conversation>();
        let unreadTotal = 0;

        chatsRes.data.forEach((msg) => {
          const otherUserId =
            msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
          const conversationKey = `${otherUserId}-${msg.listing_id || "general"}`;

          if (msg.receiver_id === user?.id && !msg.is_read) {
            unreadTotal++;
          }

          if (!conversationsMap.has(conversationKey)) {
            conversationsMap.set(conversationKey, {
              conversation_id: conversationKey,
              user_id: otherUserId,
              user_name: msg.sender_id === user?.id ? "System User" : "You",
              listing_id: msg.listing_id || "",
              listing_title: "Loading...",
              last_message: msg.message,
              last_message_time: msg.created_at,
              unread_count:
                msg.receiver_id === user?.id && !msg.is_read ? 1 : 0,
            });
          } else {
            const existing = conversationsMap.get(conversationKey)!;
            if (msg.receiver_id === user?.id && !msg.is_read) {
              existing.unread_count += 1;
            }
          }
        });

        const sortedConversations = Array.from(conversationsMap.values()).sort(
          (a, b) =>
            new Date(b.last_message_time).getTime() -
            new Date(a.last_message_time).getTime(),
        );

        setStats((prev) => ({
          ...prev,
          activeListings: userListings.length,
          messagesCount: unreadTotal,
        }));

        setRecommendations(recsRes.data.slice(0, 4));
        setRecentChats(sortedConversations.slice(0, 3));
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 overflow-y-auto pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Welcome back, {user?.full_name?.split(" ")[0] || "Amara"}
              </h1>
              <p className="text-gray-500 font-medium mt-1">
                Here's what's happening in your marketplace
              </p>
            </div>
          </div>

          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatsCard
              title="Active Listings"
              value={stats.activeListings}
              trend="+2 this week"
              trendColor="text-blue-500"
              colorClass="bg-blue-600"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Total Views"
              value={stats.totalViews}
              trend="+18% vs last week"
              trendColor="text-green-500"
              colorClass="bg-green-600"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Messages"
              value={stats.messagesCount}
              trend="3 unread"
              trendColor="text-orange-500"
              colorClass="bg-orange-600"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Avg Rating"
              value={stats.avgRating}
              trend="From 12 reviews"
              trendColor="text-gray-400"
              colorClass="bg-yellow-600"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Recommendations Column */}
            <div className="lg:col-span-8 space-y-8">
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black text-gray-900">
                    Recommended for you
                  </h2>
                  <button
                    onClick={() => navigate("/listings")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    View all
                    <svg
                      className="w-3 h-3 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {recommendations.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-900 font-bold">
                      No recommendations found
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Try browsing the marketplace to help us understand what
                      you like.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Recent Activity/Actions Column */}
            <div className="lg:col-span-4 space-y-10">
              <QuickActions />

              <section>
                <div className="flex items-center justify-between mb-6 px-1">
                  <h2 className="text-sm font-bold text-gray-900">
                    Recent Messages
                  </h2>
                  <button
                    onClick={() => navigate("/chat")}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                  >
                    View all
                  </button>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50">
                  {recentChats.length > 0 ? (
                    recentChats.map((chat) => (
                      <ChatPreview
                        key={chat.conversation_id}
                        conversation={chat}
                      />
                    ))
                  ) : (
                    <div className="p-10 text-center">
                      <p className="text-gray-400 text-sm font-medium">
                        No active conversations
                      </p>
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
