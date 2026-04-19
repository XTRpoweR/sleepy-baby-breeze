import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { dataRefreshBus, type DataRefreshTopic } from '@/utils/profileEvents';

export type ChatMessage = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
};

export type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

type ActionEvent = {
  tool: string;
  args: any;
  result: { ok: boolean; error?: string; result?: any };
};

export const useChatAssistant = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('chat_conversations')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false })
      .limit(50);
    setConversations(data || []);
  }, [user]);

  const selectConversation = useCallback(async (id: string) => {
    setActiveConversationId(id);
    setIsLoading(true);
    const { data } = await supabase
      .from('chat_messages')
      .select('id, role, content')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });
    setMessages((data || []) as ChatMessage[]);
    setIsLoading(false);
  }, []);

  const newConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    await supabase.from('chat_conversations').delete().eq('id', id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      newConversation();
    }
  }, [activeConversationId, newConversation]);

  const notifyAction = (evt: ActionEvent) => {
    const titles: Record<string, string> = {
      start_sleep_session: 'Sleep started',
      end_sleep_session: 'Sleep ended',
      log_feeding: 'Feeding logged',
      log_diaper: 'Diaper logged',
      log_custom_activity: 'Activity logged',
      update_notification_settings: 'Notifications updated',
    };
    const title = titles[evt.tool];
    if (!title) return;
    if (evt.result.ok) {
      toast({ title: `✅ ${title}` });
      // Broadcast a refresh hint so open pages reload their data instantly
      const topicMap: Record<string, DataRefreshTopic> = {
        start_sleep_session: 'activities',
        end_sleep_session: 'activities',
        log_feeding: 'activities',
        log_diaper: 'activities',
        log_custom_activity: 'activities',
        update_notification_settings: 'notification_settings',
      };
      const topic = topicMap[evt.tool];
      if (topic) dataRefreshBus.emit(topic);
    } else {
      toast({
        title: title,
        description: evt.result.error || 'Failed',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!session || !text.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setIsStreaming(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          message: text,
          conversationId: activeConversationId,
        },
      });

      if (error) {
        const status = (error as any).context?.status;
        if (status === 429) {
          toast({ title: t('chat.errorRateLimit'), variant: 'destructive' });
        } else if (status === 402) {
          toast({ title: t('chat.errorCredits'), variant: 'destructive' });
        } else {
          toast({ title: t('chat.errorGeneric'), variant: 'destructive' });
        }
        setMessages((prev) => prev.slice(0, -2));
        return;
      }

      const convId: string | undefined = data?.conversationId;
      const content: string = data?.content || '';
      const actions: ActionEvent[] = data?.actions || [];

      if (convId && !activeConversationId) {
        setActiveConversationId(convId);
      }

      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: 'assistant', content };
        return next;
      });

      // Surface action results as toasts
      actions.forEach(notifyAction);

      // Refresh conversations list
      loadConversations();
    } catch (e) {
      console.error('sendMessage error:', e);
      toast({ title: t('chat.errorGeneric'), variant: 'destructive' });
      setMessages((prev) => prev.slice(0, -2));
    } finally {
      setIsStreaming(false);
    }
  }, [session, activeConversationId, toast, t, loadConversations]);

  useEffect(() => {
    if (user) loadConversations();
  }, [user, loadConversations]);

  return {
    conversations,
    activeConversationId,
    messages,
    isStreaming,
    isLoading,
    sendMessage,
    selectConversation,
    newConversation,
    deleteConversation,
    loadConversations,
  };
};
