import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Plus, Trash2, History, Loader2, LifeBuoy, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useChatAssistant } from '@/hooks/useChatAssistant';
import { useSubscription } from '@/hooks/useSubscription';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { HumanSupportDialog } from './HumanSupportDialog';

const HIDDEN_ROUTES = ['/auth', '/reset-password', '/invitation'];

export const ChatAssistant = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    activeConversationId,
    messages,
    isStreaming,
    isLoading,
    sendMessage,
    selectConversation,
    newConversation,
    deleteConversation,
  } = useChatAssistant();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  if (!user) return null;
  if (HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r))) return null;

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    sendMessage(text);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 h-14 w-14 rounded-full shadow-lg"
          aria-label={t('chat.title')}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={cn(
          'flex flex-col p-0 gap-0',
          isMobile ? 'h-[100dvh] w-full max-w-full' : 'w-full sm:max-w-md',
        )}
      >
        <SheetHeader className="p-4 border-b flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2 min-w-0">
            <MessageCircle className="h-5 w-5 shrink-0" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base leading-tight truncate">{t('chat.title')}</SheetTitle>
                <Badge
                  variant={isPremium ? 'default' : 'secondary'}
                  className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                >
                  {isPremium ? t('chat.tier.premium') : t('chat.tier.free')}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground truncate">{t('chat.subtitle')}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSupportOpen(true)}
              aria-label={t('chat.support.title')}
              title={t('chat.support.title')}
            >
              <LifeBuoy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory((s) => !s)}
              aria-label={t('chat.history')}
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                newConversation();
                setShowHistory(false);
              }}
              aria-label={t('chat.newChat')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {!subLoading && !isPremium ? (
          <PremiumLockScreen onClose={() => setOpen(false)} />
        ) : showHistory ? (
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.length === 0 && (
                <p className="text-sm text-muted-foreground p-4 text-center">
                  {t('chat.noHistory')}
                </p>
              )}
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer',
                    activeConversationId === c.id && 'bg-accent',
                  )}
                  onClick={() => {
                    selectConversation(c.id);
                    setShowHistory(false);
                  }}
                >
                  <span className="flex-1 text-sm truncate">{c.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(c.id);
                    }}
                    aria-label={t('chat.delete')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <>
            <ScrollArea className="flex-1" ref={scrollRef as any}>
              <div className="p-4 space-y-4">
                {messages.length === 0 && !isLoading && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">{t('chat.welcome')}</p>
                  </div>
                )}
                {isLoading && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex',
                      m.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                        m.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted',
                      )}
                    >
                      {m.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none break-words [&>*]:my-1">
                          {m.content ? (
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          ) : (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-3 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t('chat.placeholder')}
                disabled={isStreaming}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={isStreaming || !input.trim()}
                aria-label={t('chat.send')}
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
      <HumanSupportDialog
        open={supportOpen}
        onOpenChange={setSupportOpen}
        recentMessages={messages}
      />
    </Sheet>
  );
};

export default ChatAssistant;
