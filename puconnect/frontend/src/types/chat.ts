/**
 * Chat/Messaging Types
 * 
 * ALIGNED WITH BACKEND:
 * - app/schemas/chat.py
 */

// ============================================================================
// CHAT TYPES
// ============================================================================

/**
 * Chat message interface - MATCHES backend ChatResponse
 * Backend: app/schemas/chat.py - ChatResponse
 */
export interface ChatMessage {
    id: string;                    // UUID from backend
    sender_id: string;             // Changed from senderId
    receiver_id: string;           // Changed from receiverId
    listing_id: string;            // Added from backend
    message: string;               // Changed from content
    is_read: boolean;              // Changed from isRead
    created_at: string;            // ISO datetime string
    updated_at: string;            // Added - new field in backend
}

export type Message = ChatMessage;

/**
 * Chat creation data - MATCHES backend ChatCreate
 * Backend: app/schemas/chat.py - ChatCreate
 */
export interface ChatCreate {
    receiver_id: string;
    listing_id: string;
    message: string;
}

/**
 * Chat update data - MATCHES backend ChatUpdate
 * Backend: app/schemas/chat.py - ChatUpdate
 */
export interface ChatUpdate {
    is_read?: boolean;
}

/**
 * Conversation summary (for chat list)
 */
export interface Conversation {
    user_id: string;               // The other user in the conversation
    user_name: string;             // Display name
    listing_id: string;
    listing_title: string;
    last_message: string;
    last_message_time: string;
    unread_count: number;
}

/**
 * Unread count response
 */
export interface UnreadCountResponse {
    unread_count: number;
}

// ============================================================================
// WEBSOCKET TYPES
// ============================================================================

/**
 * WebSocket message types
 */
export enum WebSocketMessageType {
    MESSAGE = 'message',
    READ_RECEIPT = 'read_receipt',
    TYPING = 'typing',
    CONNECTION_STATUS = 'connection_status'
}

/**
 * WebSocket message
 */
export interface WebSocketMessage {
    type: WebSocketMessageType;
    payload: any;
}

/**
 * Connection status
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert backend ChatMessage to frontend ChatMessage (if needed)
 */
export function mapBackendChatMessage(backendMessage: any): ChatMessage {
    return {
        id: backendMessage.id,
        sender_id: backendMessage.sender_id,
        receiver_id: backendMessage.receiver_id,
        listing_id: backendMessage.listing_id,
        message: backendMessage.message,
        is_read: backendMessage.is_read,
        created_at: backendMessage.created_at,
        updated_at: backendMessage.updated_at
    };
}

/**
 * Check if message is from current user
 */
export function isOwnMessage(message: ChatMessage, currentUserId: string): boolean {
    return message.sender_id === currentUserId;
}

/**
 * Format message time for display
 */
export function formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
}
