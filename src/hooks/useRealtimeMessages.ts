import { useEffect, useState, useMemo } from 'react';
import { createClient } from '../utils/supabase/client';

export interface Message {
    id: string;
    group_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

/**
 * Custom React hook for subscribing securely to study group chat messages.
 * Leverages Supabase Realtime and handles clean unsubscribe calls to prevent leaks.
 */
export function useRealtimeMessages(groupId: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        if (!groupId) return;

        // 1. Load existing message history (respects database RLS)
        const fetchInitialMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('group_id', groupId)
                .order('created_at', { ascending: true });

            if (!error && data) {
                setMessages(data as Message[]);
            }
        };

        fetchInitialMessages();

        // 2. Open auth-based Postgres Changes channel
        // Client automatically passes the active session JWT cookie for validation
        const channel = supabase
            .channel(`group:${groupId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `group_id=eq.${groupId}`
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages((prev) => [...prev, newMessage]);
                }
            )
            .subscribe((status) => {
                console.log(`[Realtime Chat] Channel status for group ${groupId}:`, status);
            });

        // 3. SECURE CLEANUP: Unsubscribe from channel on unmount to prevent memory leaks
        return () => {
            supabase.removeChannel(channel);
        };
    }, [groupId, supabase]);

    /**
     * Inserts a new message (trigger checks will sanitize input & rate-limit frequency)
     */
    const sendMessage = async (content: string) => {
        const { error } = await supabase
            .from('messages')
            .insert({
                group_id: groupId,
                content
            });
        return { error };
    };

    return { messages, sendMessage };
}
