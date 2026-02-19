/**
 * Central source of truth for backend routes.
 * Grouped by domain to prevent hardcoded strings.
 */

const API_PREFIX = "/api/v1";

export const API_ENDPOINTS = {
  AUTH: {
    register: `${API_PREFIX}/auth/register`,
    login: `${API_PREFIX}/auth/login`,
    refresh: `${API_PREFIX}/auth/refresh`,
    me: `${API_PREFIX}/auth/me`,
  },
  USERS: {
    getProfile: `${API_PREFIX}/users/profile`,
    updateProfile: `${API_PREFIX}/users/profile`,
  },
  LISTINGS: {
    create: `${API_PREFIX}/listings/`,
    listAll: `${API_PREFIX}/listings/`,
    getById: (id: string) => `${API_PREFIX}/listings/${id}`,
    update: (id: string) => `${API_PREFIX}/listings/${id}`,
    delete: (id: string) => `${API_PREFIX}/listings/${id}`,
  },
  REVIEWS: {
    create: `${API_PREFIX}/reviews`,
    getByListing: (listingId: string) => `${API_PREFIX}/reviews/listing/${listingId}`,
  },
  PAYMENTS: {
    initiate: `${API_PREFIX}/payments/initiate`,
    verify: (reference: string) => `${API_PREFIX}/payments/verify/${reference}`,
    list: `${API_PREFIX}/payments/`,
  },
  RECOMMENDATIONS: {
    getForUser: `${API_PREFIX}/recommendations`,
  },
  CHAT: {
    myChats: `${API_PREFIX}/chat/my-chats`,
    unreadCount: `${API_PREFIX}/chat/unread/count`,
    websocketUrl: (userId: string) => {
      // Construct WebSocket URL dynamically based on current location
      // This assumes the API is served from the same host or proxy
      if (typeof window !== "undefined") {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.host;
        return `${protocol}//${host}/ws/chat/${userId}`;
      }
      // Fallback or server-side stub (standard localhost for dev if needed)
      return `ws://localhost:8000/ws/chat/${userId}`;
    },
  },
} as const;
