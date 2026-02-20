import React from 'react';
import { Conversation, formatMessageTime } from '../../types/chat';

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: string | null;
    onSelect: (conversation: Conversation) => void;
    loading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    selectedId,
    onSelect,
    loading = false
}) => {
    if (loading) {
        return (
            <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500 text-sm">No conversations yet.</p>
            </div>
        );
    }

    return (
        <div className="overflow-y-auto h-full">
            {conversations.map((conv) => {
                const isSelected = selectedId === conv.user_id && conv.listing_id; // Simple check for now
                return (
                    <button
                        key={`${conv.user_id}-${conv.listing_id}`}
                        onClick={() => onSelect(conv)}
                        className={`w-full flex items-center space-x-3 px-4 py-4 transition-colors hover:bg-gray-50 border-b border-gray-100 ${isSelected ? 'bg-indigo-50 hover:bg-indigo-50 border-r-4 border-r-indigo-600' : ''
                            }`}
                    >
                        <div className="relative shrink-0">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                {conv.user_name.charAt(0)}
                            </div>
                            {conv.unread_count > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                    {conv.unread_count}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-gray-900 truncate">
                                    {conv.user_name}
                                </h4>
                                <span className="text-[10px] text-gray-500">
                                    {formatMessageTime(conv.last_message_time)}
                                </span>
                            </div>
                            <p className="text-[11px] text-indigo-600 font-medium truncate mt-0.5">
                                {conv.listing_title}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                {conv.last_message}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
