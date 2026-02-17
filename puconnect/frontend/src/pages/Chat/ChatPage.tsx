import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { ChatWindow } from '../../components/chat/ChatWindow';

const ChatPage: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const partnerId = searchParams.get('userId'); // Who are we chatting with?

    const { messages, sendMessage, status } = useWebSocket(partnerId || null);

    // UI State
    const [partnerName, setPartnerName] = useState('Chat');

    // Fetch partner details if we have their ID
    useEffect(() => {
        if (partnerId) {
            // Mock fetching partner name or call API
            // api.get(`/users/${partnerId}`).then(res => setPartnerName(res.data.name));
            setPartnerName(`Chat Partner (${partnerId.substring(0, 5)}...)`);
        }
    }, [partnerId]);


    const handleSend = (content: string) => {
        if (partnerId) {
            sendMessage(content, partnerId);
        }
    };

    if (!user) return <div className="p-4">Please log in to use chat.</div>;

    if (!partnerId) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-700">Select a conversation</h2>
                    <p className="text-gray-500 mt-2">Choose a user or listing to start chatting.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)]">
            <ChatWindow
                messages={messages}
                currentUserId={user.id}
                onSend={handleSend}
                partnerName={partnerName}
                connectionStatus={status}
            />
        </div>
    );
};

export default ChatPage;
