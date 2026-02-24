import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Conversation, formatMessageTime } from '../../types/chat';

interface ChatPreviewProps {
    conversation: Conversation;
}

const ChatPreview: React.FC<ChatPreviewProps> = ({ conversation }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/chat?userId=${conversation.user_id}&listingId=${conversation.listing_id}`)}
            className="flex items-center p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer group"
        >
            <div className="relative flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ring-1 ring-gray-100 uppercase">
                    {conversation.user_name.charAt(0)}
                </div>
                {conversation.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm">
                        {conversation.unread_count}
                    </span>
                )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900 truncate">
                        {conversation.user_name}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                        {formatMessageTime(conversation.last_message_time)}
                    </p>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5 group-hover:text-gray-700">
                    {conversation.last_message}
                </p>
            </div>
        </div>
    );
};

export default ChatPreview;
