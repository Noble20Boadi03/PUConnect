/**
 * Supabase Service Layer
 * Replaces all mock data with live Supabase queries.
 * Keeps the same exported `api` interface so all view models and screens work unchanged.
 */

import { supabase } from '../lib/supabase';
import { AuthTokens, Listing, User, ChatMessage, Review, ConversationLifecycle } from '../types';

// ── Mappers: DB snake_case → App camelCase ────────────────────────────────────

function mapProfile(row: any): User {
    return {
        id: row.id,
        email: row.email,
        fullName: row.full_name ?? '',
        universityId: row.university_id ?? '',
        role: row.role ?? 'student',
        isActive: row.is_active ?? true,
        bio: row.bio ?? '',
        skillTags: row.skill_tags ?? [],
        experienceLevel: row.experience_level ?? 'beginner',
        portfolioLinks: row.portfolio_links ?? [],
        isAvailable: row.is_available ?? true,
        profilePictureUrl: row.profile_picture_url,
        reputationScore: row.reputation_score ?? 0,
        completedProjects: row.completed_projects ?? 0,
        review_count: row.review_count ?? 0,
        verifiedStudent: row.verified_student ?? false,
        department: row.department,
        graduationYear: row.graduation_year,
        canOfferServices: row.can_offer_services ?? false,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapListing(row: any): Listing {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        price: row.price,
        budget: row.budget,
        category: row.category,
        subcategory: row.subcategory,
        type: row.type,
        ownerId: row.owner_id,
        isActive: row.is_active,
        deadline: row.deadline,
        requiredSkills: row.required_skills ?? [],
        teamSize: row.team_size,
        media_url: row.media_url,
        level: row.level,
        department: row.department,
        tags: row.tags ?? [],
        average_rating: row.average_rating,
        review_count: row.review_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapMessage(row: any): ChatMessage {
    return {
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        listingId: row.listing_id,
        listingTitle: row.listing_title,
        listingThumbnail: row.listing_thumbnail,
        message: row.message,
        isRead: row.is_read,
        senderName: row.sender_profile?.full_name,
        senderAvatar: row.sender_profile?.profile_picture_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

/** Sorts two user IDs consistently for conversation_lifecycles unique key */
function sortedPair(a: string, b: string): [string, string] {
    return a < b ? [a, b] : [b, a];
}

async function getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    return user.id;
}

// ── Exported API ──────────────────────────────────────────────────────────────

export const getApiUrl = () => process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

export const api = {

    // ── Auth (thin wrappers — auth-context uses Supabase directly) ────────────

    login: async (email: string, password: string): Promise<AuthTokens> => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        return {
            access_token: data.session?.access_token ?? '',
            refresh_token: data.session?.refresh_token ?? '',
            token_type: 'bearer',
        };
    },

    register: async (userData: any): Promise<User> => {
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: { data: { full_name: userData.full_name ?? userData.fullName } },
        });
        if (error) throw new Error(error.message);
        return mapProfile({ id: data.user?.id, email: userData.email, full_name: userData.full_name ?? userData.fullName });
    },

    getMe: async (_token: string, signal?: AbortSignal): Promise<User> => {
        const userId = await getCurrentUserId();
        let query = supabase.from('profiles').select('*').eq('id', userId).single();
        if (signal) query = query.abortSignal(signal);
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return mapProfile(data);
    },

    updateProfile: async (profileData: Partial<User>, _token: string): Promise<User> => {
        const userId = await getCurrentUserId();
        const dbData: Record<string, any> = {};
        if (profileData.fullName !== undefined)        dbData.full_name = profileData.fullName;
        if (profileData.bio !== undefined)             dbData.bio = profileData.bio;
        if (profileData.skillTags !== undefined)       dbData.skill_tags = profileData.skillTags;
        if (profileData.experienceLevel !== undefined) dbData.experience_level = profileData.experienceLevel;
        if (profileData.portfolioLinks !== undefined)  dbData.portfolio_links = profileData.portfolioLinks;
        if (profileData.isAvailable !== undefined)     dbData.is_available = profileData.isAvailable;
        if (profileData.profilePictureUrl !== undefined) dbData.profile_picture_url = profileData.profilePictureUrl;
        if (profileData.universityId !== undefined)    dbData.university_id = profileData.universityId;
        if (profileData.department !== undefined)      dbData.department = profileData.department;
        if (profileData.graduationYear !== undefined)  dbData.graduation_year = profileData.graduationYear;
        if (profileData.canOfferServices !== undefined) dbData.can_offer_services = profileData.canOfferServices;
        if (profileData.verifiedStudent !== undefined) dbData.verified_student = profileData.verifiedStudent;

        const { data, error } = await supabase
            .from('profiles')
            .update(dbData)
            .eq('id', userId)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return mapProfile(data);
    },

    getTalent: async (_search = '', _skip = 0, _limit = 10): Promise<User[]> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('can_offer_services', true)
            .eq('is_active', true)
            .limit(_limit);
        if (error) throw new Error(error.message);
        return (data ?? []).map(mapProfile);
    },

    getSkillGaps: async (): Promise<any> => {
        return { gaps: [] };
    },

    // ── Listings ──────────────────────────────────────────────────────────────

    getListings: async (
        _skip = 0,
        _limit = 20,
        _filters?: {
            category?: string;
            subcategory?: string;
            tag?: string;
            level?: string;
            type?: 'service_offer' | 'service_request';
            department?: string;
            minPrice?: number;
            maxPrice?: number;
            sortBy?: string;
        },
        signal?: AbortSignal
    ): Promise<Listing[]> => {
        let query = supabase.from('listings').select('*').eq('is_active', true);

        if (_filters?.category)    query = query.eq('category', _filters.category);
        if (_filters?.subcategory) query = query.eq('subcategory', _filters.subcategory);
        if (_filters?.level)       query = query.eq('level', _filters.level);
        if (_filters?.type)        query = query.eq('type', _filters.type);
        if (_filters?.department)  query = query.eq('department', _filters.department);
        if (_filters?.minPrice != null) query = query.gte('price', _filters.minPrice);
        if (_filters?.maxPrice != null) query = query.lte('price', _filters.maxPrice);
        if (_filters?.tag)         query = query.contains('tags', [_filters.tag]);

        if (_filters?.sortBy === 'price')       query = query.order('price', { ascending: true });
        else if (_filters?.sortBy === 'rating') query = query.order('average_rating', { ascending: false });
        else                                    query = query.order('created_at', { ascending: false });

        query = query.range(_skip, _skip + _limit - 1);
        if (signal) query = query.abortSignal(signal);

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return (data ?? []).map(mapListing);
    },

    getListing: async (id: string, signal?: AbortSignal): Promise<Listing> => {
        let query = supabase.from('listings').select('*').eq('id', id).single();
        if (signal) query = query.abortSignal(signal);
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return mapListing(data);
    },

    createListing: async (listingData: Partial<Listing>, _token: string): Promise<Listing> => {
        const userId = await getCurrentUserId();
        const { data, error } = await supabase
            .from('listings')
            .insert({
                title: listingData.title,
                description: listingData.description,
                price: listingData.price,
                budget: listingData.budget,
                category: listingData.category,
                subcategory: listingData.subcategory,
                type: listingData.type,
                owner_id: userId,
                is_active: true,
                deadline: listingData.deadline,
                required_skills: listingData.requiredSkills ?? [],
                team_size: listingData.teamSize,
                media_url: listingData.media_url,
                level: listingData.level,
                department: listingData.department,
                tags: listingData.tags ?? [],
            })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return mapListing(data);
    },

    updateListing: async (id: string, patch: Partial<Listing>, _token: string): Promise<Listing> => {
        const dbData: Record<string, any> = {};
        if (patch.title !== undefined)          dbData.title = patch.title;
        if (patch.description !== undefined)    dbData.description = patch.description;
        if (patch.price !== undefined)          dbData.price = patch.price;
        if (patch.budget !== undefined)         dbData.budget = patch.budget;
        if (patch.category !== undefined)       dbData.category = patch.category;
        if (patch.subcategory !== undefined)    dbData.subcategory = patch.subcategory;
        if (patch.type !== undefined)           dbData.type = patch.type;
        if (patch.level !== undefined)          dbData.level = patch.level;
        if (patch.tags !== undefined)           dbData.tags = patch.tags;
        if (patch.media_url !== undefined)      dbData.media_url = patch.media_url;
        if (patch.requiredSkills !== undefined) dbData.required_skills = patch.requiredSkills;
        if (patch.isActive !== undefined)       dbData.is_active = patch.isActive;

        const { data, error } = await supabase
            .from('listings')
            .update(dbData)
            .eq('id', id)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return mapListing(data);
    },

    deleteListing: async (id: string, _token: string): Promise<void> => {
        const { error } = await supabase
            .from('listings')
            .update({ is_active: false })
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    searchListings: async (query: string, signal?: AbortSignal): Promise<Listing[]> => {
        const q = query.trim();
        let dbQuery = supabase.from('listings').select('*').eq('is_active', true);

        if (q) {
            dbQuery = dbQuery.or(
                `title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,subcategory.ilike.%${q}%`
            );
        }

        dbQuery = dbQuery.order('created_at', { ascending: false }).limit(40);
        if (signal) dbQuery = dbQuery.abortSignal(signal);

        const { data, error } = await dbQuery;
        if (error) throw new Error(error.message);
        return (data ?? []).map(mapListing);
    },

    // ── Users / Profiles ──────────────────────────────────────────────────────

    getUserById: async (id: string, signal?: AbortSignal): Promise<User | null> => {
        let query = supabase.from('profiles').select('*').eq('id', id).single();
        if (signal) query = query.abortSignal(signal);
        const { data, error } = await query;
        if (error) return null;
        return mapProfile(data);
    },

    getListingsByOwner: async (ownerId: string, signal?: AbortSignal): Promise<Listing[]> => {
        let query = supabase
            .from('listings')
            .select('*')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false });
        if (signal) query = query.abortSignal(signal);
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return (data ?? []).map(mapListing);
    },

    getProvidersBySubcategory: async (subcategory: string, signal?: AbortSignal): Promise<any[]> => {
        let query = supabase
            .from('listings')
            .select('owner_id, price, budget, profiles!inner(*)')
            .eq('subcategory', subcategory)
            .eq('is_active', true);
        if (signal) query = query.abortSignal(signal);
        const { data, error } = await query;
        if (error) throw new Error(error.message);

        // Group by owner, keep minimum price
        const providerMap: Record<string, { profile: any; minPrice: number }> = {};
        for (const row of data ?? []) {
            const price = row.price ?? row.budget ?? 0;
            if (!providerMap[row.owner_id] || price < providerMap[row.owner_id].minPrice) {
                providerMap[row.owner_id] = { profile: (row as any).profiles, minPrice: price };
            }
        }
        return Object.values(providerMap).map(p => ({
            ...mapProfile(p.profile),
            startingPrice: p.minPrice,
        }));
    },

    // ── Messages ──────────────────────────────────────────────────────────────

    getMessages: async (_token: string, signal?: AbortSignal): Promise<ChatMessage[]> => {
        const userId = await getCurrentUserId();
        let query = supabase
            .from('messages')
            .select('*, sender_profile:profiles!sender_id(full_name, profile_picture_url)')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });
        if (signal) query = query.abortSignal(signal);
        const { data, error } = await query;
        if (error) throw new Error(error.message);

        // Group into conversations: keep the latest message per peer+listing thread
        const groups: Record<string, ChatMessage> = {};
        for (const row of data ?? []) {
            const peerId = row.sender_id === userId ? row.receiver_id : row.sender_id;
            const key = `${peerId}|${row.listing_id ?? ''}`;
            const mapped = mapMessage(row);
            if (!groups[key]) groups[key] = { ...mapped, peerId } as any;
        }
        return Object.values(groups);
    },

    getConversation: async (_token: string, userId: string, listingId?: string): Promise<ChatMessage[]> => {
        const myId = await getCurrentUserId();
        let query = supabase
            .from('messages')
            .select('*, sender_profile:profiles!sender_id(full_name, profile_picture_url)')
            .or(
                `and(sender_id.eq.${myId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${myId})`
            )
            .order('created_at', { ascending: true });

        if (listingId) query = query.eq('listing_id', listingId);

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return (data ?? []).map(mapMessage);
    },

    sendMessage: async (
        messageData: { receiver_id: string; listing_id: string; message: string },
        _token: string
    ): Promise<ChatMessage> => {
        const senderId = await getCurrentUserId();
        const { data, error } = await supabase
            .from('messages')
            .insert({
                sender_id: senderId,
                receiver_id: messageData.receiver_id,
                listing_id: messageData.listing_id || null,
                message: messageData.message,
                is_read: false,
            })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return mapMessage(data);
    },

    // ── Conversation Lifecycle ────────────────────────────────────────────────

    getConversationLifecycle: async (
        meId: string,
        peerId: string,
        listingId: string | undefined,
        _token: string
    ): Promise<ConversationLifecycle> => {
        const [a, b] = sortedPair(meId, peerId);
        let query = supabase
            .from('conversation_lifecycles')
            .select('state')
            .eq('user_a_id', a)
            .eq('user_b_id', b);

        if (listingId) query = query.eq('listing_id', listingId);
        else query = query.is('listing_id', null);

        const { data } = await query.maybeSingle();
        return (data?.state as ConversationLifecycle) ?? 'open';
    },

    setConversationLifecycle: async (
        meId: string,
        peerId: string,
        listingId: string | undefined,
        state: ConversationLifecycle,
        _token: string
    ): Promise<void> => {
        const [a, b] = sortedPair(meId, peerId);
        const { error } = await supabase
            .from('conversation_lifecycles')
            .upsert(
                { user_a_id: a, user_b_id: b, listing_id: listingId ?? null, state },
                { onConflict: 'user_a_id,user_b_id,listing_id' }
            );
        if (error) throw new Error(error.message);
    },

    // ── Reviews ───────────────────────────────────────────────────────────────

    submitReview: async (
        payload: { listingId: string; targetUserId: string; rating: number; comment: string },
        _token: string
    ): Promise<Review> => {
        const authorId = await getCurrentUserId();
        const { data, error } = await supabase
            .from('reviews')
            .insert({
                listing_id: payload.listingId,
                author_user_id: authorId,
                target_user_id: payload.targetUserId,
                rating: payload.rating,
                comment: payload.comment,
            })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return {
            id: data.id,
            listingId: data.listing_id,
            authorUserId: data.author_user_id,
            targetUserId: data.target_user_id,
            rating: data.rating,
            comment: data.comment,
            createdAt: data.created_at,
        };
    },

    getReviewsByTargetUser: async (targetUserId: string, signal?: AbortSignal): Promise<Review[]> => {
        let query = supabase
            .from('reviews')
            .select('*, author:profiles!author_user_id(full_name, profile_picture_url)')
            .eq('target_user_id', targetUserId)
            .order('created_at', { ascending: false });
        if (signal) query = query.abortSignal(signal);
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return (data ?? []).map(row => ({
            id: row.id,
            listingId: row.listing_id,
            authorUserId: row.author_user_id,
            targetUserId: row.target_user_id,
            rating: row.rating,
            comment: row.comment,
            createdAt: row.created_at,
            // Extra fields available to the UI
            authorName: (row as any).author?.full_name,
            authorAvatar: (row as any).author?.profile_picture_url,
        }));
    },

    // ── Subcategory Filters ───────────────────────────────────────────────────

    getSubcategoryFilters: async (subcategory: string): Promise<any[]> => {
        const { data, error } = await supabase
            .from('subcategory_filters')
            .select('*')
            .eq('subcategory', subcategory)
            .eq('is_active', true)
            .order('display_order', { ascending: true });
        if (error) {
            console.warn('[API] Failed to fetch filters:', error.message);
            return [];
        }
        return (data ?? []).map(row => ({
            id: row.id,
            subcategory: row.subcategory,
            filter_label: row.filter_label,
            filter_type: row.filter_type,
            filter_options: Array.isArray(row.filter_options) ? row.filter_options : JSON.parse(row.filter_options ?? '[]'),
            display_order: row.display_order,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }));
    },

    // ── Storage ───────────────────────────────────────────────────────────────

    uploadImage: async (uri: string, _token: string): Promise<{ url: string }> => {
        const userId = await getCurrentUserId();
        const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
        const fileName = `${userId}/${Date.now()}.${ext}`;

        const response = await fetch(uri);
        const blob = await response.blob();

        const { data, error } = await supabase.storage
            .from('profile-pictures')
            .upload(fileName, blob, { contentType: `image/${ext}`, upsert: true });
        if (error) throw new Error(error.message);

        const { data: { publicUrl } } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(data.path);

        return { url: publicUrl };
    },

    getApiUrl,
};
