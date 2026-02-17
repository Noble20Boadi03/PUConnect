import { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../api/endpoints';
import { Message, ConnectionStatus } from '../types/chat';

interface UseWebSocketReturn {
    messages: Message[];
    sendMessage: (content: string, receiverId: string) => void;
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

    // Mock initial messages for demo purposes if backend not ready
    // Remove this in production
    /*
    useEffect(() => {
        if(chatPartnerId) {
             setMessages([
                 { id: '1', senderId: 'other', receiverId: user?.id || '', content: 'Hello there!', createdAt: new Date(Date.now() - 100000).toISOString(), isRead: true },
                 { id: '2', senderId: user?.id || '', receiverId: 'other', content: 'Hi! Is the item still available?', createdAt: new Date(Date.now() - 90000).toISOString(), isRead: true },
             ]);
        }
    }, [chatPartnerId, user?.id]);
    */

    const connect = useCallback(() => {
        if (!user || !chatPartnerId || !accessToken) return;

        setStatus('connecting');

        // Construct WS URL
        // We typically connect to a main endpoint and then subscribe to topics, 
        // OR connect to a specific user channel. 
        // The API_ENDPOINTS.CHAT.websocketUrl takes userId. Assuming it connects "as" the user or "to" chat?
        // Usually it's: ws://host/ws/chat?token=...
        // Let's assume the endpoint provided is the connection endpoint for the CURRENT USER to receive messages.

        const url = new URL(API_ENDPOINTS.CHAT.websocketUrl(user.id));
        // Append auth token as query param since standard WS API doesn't support headers easily
        url.searchParams.append('token', accessToken);

        const socket = new WebSocket(url.toString());

        socket.onopen = () => {
            if (isMounted.current) setStatus('connected');
            console.log('WS Connected');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Handle different message types
                if (data.type === 'message') {
                    // Only add if it belongs to current chat conversation
                    const msg = data.payload as Message;
                    if (msg.senderId === chatPartnerId || msg.receiverId === chatPartnerId) {
                        setMessages(prev => [...prev, msg]);
                    }
                }
                // Handle read receipts, etc.
            } catch (e) {
                console.error('Failed to parse WS message', e);
            }
        };

        socket.onclose = () => {
            if (isMounted.current) {
                setStatus('disconnected');
                // Attempt reconnect
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

    const sendMessage = useCallback((content: string, receiverId: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN && user) {
            const messagePayload = {
                type: 'send_message',
                payload: {
                    content,
                    receiverId,
                    // temporary ID until confirmed by server
                    id: Math.random().toString(36).substr(2, 9),
                    senderId: user.id,
                    createdAt: new Date().toISOString(),
                    isRead: false
                }
            };
            ws.current.send(JSON.stringify(messagePayload));

            // Optimistically add to UI
            // Cast to Message type. In real world, wait for ack or bounce back.
            setMessages(prev => [...prev, messagePayload.payload as Message]);
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

            // Update local state
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, isRead: true } : m
            ));
        }
    }, []);

    return { messages, sendMessage, status, markAsRead };
};
