import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../../types/chat';

interface ChatWindowProps {
    messages: Message[];
    currentUserId: string;
    onSend: (message: string) => void;
    className?: string;
    partnerName?: string;
    connectionStatus?: 'connected' | 'disconnected' | 'connecting' | 'error';
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    messages,
    currentUserId,
    onSend,
    className = '',
    partnerName = 'Chat',
    connectionStatus = 'connected'
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSend(newMessage);
            setNewMessage('');
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
            {/* Header - Optional if managed by parent, but nice to have distinct window feel */}
            <div className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm shrink-0">
                <div className="flex items-center space-x-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                        {partnerName.charAt(0)}
                    </span>
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">{partnerName}</h3>
                        {connectionStatus !== 'connected' && (
                            <p className="text-xs text-red-500 capitalize">{connectionStatus}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.senderId === currentUserId;
                        return (
                            <div
                                key={msg.id || Math.random().toString()} // Fallback key if id missing temporarily
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm text-sm ${isOwn
                                            ? 'bg-indigo-600 text-white rounded-br-sm'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                    <div
                                        className={`mt-1 text-[10px] flex items-center justify-end space-x-1 ${isOwn ? 'text-indigo-200' : 'text-gray-400'
                                            }`}
                                    >
                                        <span>{formatTime(msg.createdAt)}</span>
                                        {isOwn && (
                                            <span>
                                                {msg.isRead ? (
                                                    <span title="Read">✓✓</span>
                                                ) : (
                                                    <span title="Sent">✓</span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t p-3 shrink-0">
                <form onSubmit={handleSend} className="flex items-end space-x-2">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 max-h-32 min-h-[44px] rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none overflow-hidden"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                            // Auto-resize logic could go here
                        }}
                        style={{ height: 'auto' }} // Simple auto-height hack if needed, strictly controlled input better
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || connectionStatus !== 'connected'}
                        className="inline-flex items-center justify-center rounded-full bg-indigo-600 p-3 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};
