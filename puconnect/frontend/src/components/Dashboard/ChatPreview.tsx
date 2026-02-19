import React from 'react';
import { Conversation, formatMessageTime } from '../../types/chat';

interface ChatPreviewProps {
    conversation: Conversation;
}

const ChatPreview: React.FC<ChatPreviewProps> = ({ conversation }) => {
    return (
        <div className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150 cursor-pointer">
            <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {conversation.user_name.charAt(0)}
                </div>
                {conversation.unread_count > 0 && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-white"></span>
                )}
            </div>
            <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                        {conversation.user_name}
                    </p>
                    <p className="text-xs text-gray-500">
                        {formatMessageTime(conversation.last_message_time)}
                    </p>
                </div>
                <p className="text-xs text-blue-500 font-medium mb-1 truncate">
                    Re: {conversation.listing_title}
                </p>
                <p className="text-sm text-gray-500 truncate">
                    {conversation.last_message}
                </p>
            </div>
        </div>
    );
};

export default ChatPreview;
