const BASE_API = "/api/v1";

const API_ENDPOINTS = {
  AUTH: {
    register: `${BASE_API}/auth/register`,
    login: `${BASE_API}/auth/login`,
    refresh: `${BASE_API}/auth/refresh`,
    me: `${BASE_API}/auth/me`,
  },
  USERS: {
    getProfile: `${BASE_API}/users/me`,
    updateProfile: `${BASE_API}/users/me`,
  },
  LISTINGS: {
    create: `${BASE_API}/listings`,
    listAll: `${BASE_API}/listings`,
    getById: (id: string) => `${BASE_API}/listings/${id}`,
    update: (id: string) => `${BASE_API}/listings/${id}`,
    delete: (id: string) => `${BASE_API}/listings/${id}`,
  },
  REVIEWS: {
    create: `${BASE_API}/reviews`,
    getByListing: (listingId: string) => `${BASE_API}/reviews/listing/${listingId}`,
  },
  PAYMENTS: {
    initiate: `${BASE_API}/payments/initiate`,
    verify: `${BASE_API}/payments/verify`,
  },
  RECOMMENDATIONS: {
    getForUser: `${BASE_API}/recommendations`,
  },
  CHAT: {
    websocketUrl: (userId: string) => `${BASE_API}/chat/${userId}`,
  },
};

export default API_ENDPOINTS;
