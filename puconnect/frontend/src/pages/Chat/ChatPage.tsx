import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { ConversationList } from '../../components/chat/ConversationList';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';
import { Conversation } from '../../types/chat';

const ChatPage: React.FC = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const partnerId = searchParams.get('userId');
    const listingId = searchParams.get('listingId');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [partnerName, setPartnerName] = useState('Chat');

    const { messages, sendMessage, status } = useWebSocket(partnerId);

    // Fetch conversations and group them
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoadingConversations(true);
                const response = await api.get(API_ENDPOINTS.CHAT.myChats);
                const rawMessages = response.data;

                // Group messages by (other_user, listing)
                const convMap = new Map<string, Conversation>();

                rawMessages.forEach((msg: any) => {
                    const otherUserId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
                    const key = `${otherUserId}-${msg.listing_id}`;

                    if (!convMap.has(key)) {
                        convMap.set(key, {
                            user_id: otherUserId,
                            user_name: `User ${otherUserId.substring(0, 4)}`, // Fallback/Mock
                            listing_id: msg.listing_id,
                            listing_title: `Listing ${msg.listing_id.substring(0, 4)}`, // Fallback/Mock
                            last_message: msg.message,
                            last_message_time: msg.created_at,
                            unread_count: (msg.receiver_id === user?.id && !msg.is_read) ? 1 : 0
                        });
                    } else {
                        const existing = convMap.get(key)!;
                        if (msg.receiver_id === user?.id && !msg.is_read) {
                            existing.unread_count += 1;
                        }
                        // Update last message if this one is newer
                        if (new Date(msg.created_at) > new Date(existing.last_message_time)) {
                            existing.last_message = msg.message;
                            existing.last_message_time = msg.created_at;
                        }
                    }
                });

                const sortedConvs = Array.from(convMap.values()).sort(
                    (a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
                );

                setConversations(sortedConvs);

                // If no conversation is selected but we have some, select the first one?
                // Actually, let's keep it optional for now.
            } catch (error) {
                console.error("Failed to fetch conversations", error);
            } finally {
                setLoadingConversations(false);
            }
        };

        if (user) {
            fetchConversations();
        }
    }, [user]);

    // Update partner name and select logic
    useEffect(() => {
        if (partnerId) {
            const currentConv = conversations.find(c => c.user_id === partnerId && c.listing_id === listingId);
            if (currentConv) {
                setPartnerName(currentConv.user_name);
            } else {
                setPartnerName(`Chat Partner (${partnerId.substring(0, 5)}...)`);
            }
        }
    }, [partnerId, listingId, conversations]);

    const handleSelectConversation = (conv: Conversation) => {
        setSearchParams({ userId: conv.user_id, listingId: conv.listing_id });
    };

    const handleSend = (content: string) => {
        if (partnerId) {
            sendMessage(content, partnerId, listingId || undefined);
        }
    };

    if (!user) return <div className="p-4 text-center mt-20">Please log in to use chat.</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
            {/* Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 border-r flex flex-col shrink-0 transition-all ${partnerId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                    <div className="mt-2 relative">
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                        <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <ConversationList
                    conversations={conversations}
                    selectedId={partnerId}
                    onSelect={handleSelectConversation}
                    loading={loadingConversations}
                />
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col min-w-0 bg-gray-50 transition-all ${!partnerId ? 'hidden md:flex' : 'flex'}`}>
                {partnerId ? (
                    <div className="flex flex-col h-full relative">
                        {/* Mobile Back Button */}
                        <div className="md:hidden absolute left-4 top-3.5 z-10">
                            <button
                                onClick={() => setSearchParams({})}
                                className="p-2 -ml-2 text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>

                        <ChatWindow
                            messages={messages}
                            currentUserId={user.id}
                            onSend={handleSend}
                            partnerName={partnerName}
                            connectionStatus={status}
                            className="flex-1"
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="text-center max-w-sm">
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm text-indigo-600 mb-8 transform transition-transform hover:scale-105">
                                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Inbox</h2>
                            <p className="text-gray-500 mt-4 text-lg">
                                Select a conversation to start chatting with buyers and sellers.
                            </p>
                            <button
                                onClick={() => window.location.href = '/listings'}
                                className="mt-8 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                            >
                                Browse Listings
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
