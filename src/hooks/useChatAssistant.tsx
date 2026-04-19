import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

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

  const sendMessage = useCallback(async (text: string) => {
    if (!session || !text.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setIsStreaming(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: text,
          conversationId: activeConversationId,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast({ title: t('chat.errorRateLimit'), variant: 'destructive' });
        } else if (resp.status === 402) {
          toast({ title: t('chat.errorCredits'), variant: 'destructive' });
        } else {
          toast({ title: t('chat.errorGeneric'), variant: 'destructive' });
        }
        setMessages((prev) => prev.slice(0, -2));
        return;
      }

      if (!resp.body) throw new Error('No body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';
      let convId = activeConversationId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') continue;
          try {
            const parsed = JSON.parse(json);
            if (parsed.conversationId && !convId) {
              convId = parsed.conversationId;
              setActiveConversationId(convId);
            }
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: 'assistant', content: assistantText };
                return next;
              });
            }
          } catch {
            // partial
          }
        }
      }

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
