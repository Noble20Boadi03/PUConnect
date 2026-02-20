import { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../api/endpoints';
import { Message, ConnectionStatus } from '../types/chat';

interface UseWebSocketReturn {
    messages: Message[];
    sendMessage: (content: string, receiverId: string, listingId?: string) => void;
    status: ConnectionStatus;
    markAsRead: (messageId: string) => void;
}

export const useWebSocket = (chatPartnerId: string | null): UseWebSocketReturn => {
    const { user, accessToken } = useAuth();
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [messages, setMessages] = useState<Message[]>([]);
    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<number | undefined>(undefined);
    const isMounted = useRef(true);

    const connect = useCallback(() => {
        if (!user || !chatPartnerId || !accessToken) return;

        setStatus('connecting');

        const websocketUrl = API_ENDPOINTS.CHAT.websocketUrl(user.id);
        const url = new URL(websocketUrl);
        url.searchParams.append('token', accessToken);

        const socket = new WebSocket(url.toString());

        socket.onopen = () => {
            if (isMounted.current) setStatus('connected');
            console.log('WS Connected');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // Construct a Message object from raw data
                const msg = {
                    id: data.id || Math.random().toString(36).substr(2, 9),
                    sender_id: data.sender_id || data.senderId,
                    receiver_id: data.receiver_id || data.receiverId,
                    listing_id: data.listing_id || data.listingId,
                    message: data.message || data.content,
                    created_at: data.created_at || data.timestamp || new Date().toISOString(),
                    is_read: data.is_read || data.isRead || false,
                    updated_at: data.updated_at || new Date().toISOString()
                } as Message;

                if (msg.sender_id === chatPartnerId || msg.receiver_id === chatPartnerId) {
                    setMessages(prev => [...prev, msg]);
                }
            } catch (e) {
                console.error('Failed to parse WS message', e);
            }
        };

        socket.onclose = () => {
            if (isMounted.current) {
                setStatus('disconnected');
                reconnectTimeout.current = window.setTimeout(connect, 3000);
            }
        };

        socket.onerror = (err) => {
            console.error('WS Error', err);
            if (isMounted.current) setStatus('error');
            socket.close();
        };

        ws.current = socket;
    }, [user, chatPartnerId, accessToken]);

    useEffect(() => {
        isMounted.current = true;
        connect();

        return () => {
            isMounted.current = false;
            if (ws.current) {
                ws.current.close();
            }
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
        };
    }, [connect]);

    const sendMessage = useCallback((content: string, receiverId: string, listingId?: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN && user) {
            const messagePayload = {
                message: content,
                receiver_id: receiverId,
                listing_id: listingId || '00000000-0000-0000-0000-000000000000',
            };
            ws.current.send(JSON.stringify(messagePayload));

            // Optimistically add to UI
            setMessages(prev => [...prev, {
                ...messagePayload,
                id: Math.random().toString(36).substr(2, 9),
                sender_id: user.id,
                created_at: new Date().toISOString(),
                is_read: false,
                updated_at: new Date().toISOString()
            } as Message]);
        } else {
            console.warn("WebSocket not connected");
        }
    }, [user]);

    const markAsRead = useCallback((messageId: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'mark_read',
                payload: { messageId }
            }));

            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, is_read: true } : m
            ));
        }
    }, []);

    return { messages, sendMessage, status, markAsRead };
};
