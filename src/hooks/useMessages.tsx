
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  baby_id: string;
  sender_id: string;
  message_type: string;
  content: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface MessageWithSender extends Message {
  sender_name: string;
  sender_email: string;
  is_own_message: boolean;
}

export const useMessages = (babyId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!user || !babyId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('family_messages')
        .select(`
          *,
          profiles:sender_id (
            full_name,
            email
          )
        `)
        .eq('baby_id', babyId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
        return;
      }

      const messagesWithSender: MessageWithSender[] = (data || []).map(msg => ({
        ...msg,
        sender_name: msg.profiles?.full_name || msg.profiles?.email?.split('@')[0] || 'Unknown',
        sender_email: msg.profiles?.email || '',
        is_own_message: msg.sender_id === user.id
      }));

      setMessages(messagesWithSender);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, babyId, toast]);

  const sendMessage = useCallback(async (
    content: string,
    messageType: string = 'text',
    attachmentUrl?: string,
    attachmentType?: string
  ) => {
    if (!user || !babyId) return false;

    setSending(true);
    try {
      const { error } = await supabase
        .from('family_messages')
        .insert({
          baby_id: babyId,
          sender_id: user.id,
          message_type: messageType,
          content,
          attachment_url: attachmentUrl,
          attachment_type: attachmentType
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  }, [user, babyId, toast]);

  const markAsRead = useCallback(async (messageId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('message_participants')
        .update({ read_at: new Date().toISOString() })
        .eq('message_id', messageId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!babyId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'family_messages',
          filter: `baby_id=eq.${babyId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [babyId, fetchMessages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    sending,
    sendMessage,
    markAsRead,
    refetch: fetchMessages
  };
};
