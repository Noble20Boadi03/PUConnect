import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';

/**
 * Subscribes to the unread message count for the current user in real time.
 * Returns the total number of unread messages where receiver_id = current user.
 */
export function useUnreadCount() {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    useEffect(() => {
        if (!user?.id) {
            setUnreadCount(0);
            return;
        }

        // ── Initial fetch ────────────────────────────────────────────────────
        async function fetchCount() {
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', user!.id)
                .eq('is_read', false);
            setUnreadCount(count ?? 0);
        }
        fetchCount();

        // ── Realtime subscription ────────────────────────────────────────────
        const channel = supabase
            .channel(`unread-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',                       // INSERT (new msg) or UPDATE (marked read)
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${user.id}`,
                },
                () => {
                    // Re-fetch the count on any change affecting this user's received messages
                    fetchCount();
                }
            )
            .subscribe();

        channelRef.current = channel;
        return () => {
            channel.unsubscribe();
            channelRef.current = null;
        };
    }, [user?.id]);

    return unreadCount;
}
