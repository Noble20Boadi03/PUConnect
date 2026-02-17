export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    isRead: boolean;
}

export interface WebSocketMessage {
    type: 'message' | 'read_receipt' | 'connection_status';
    payload: any;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';
