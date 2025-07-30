
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMessages } from '@/hooks/useMessages';
import { MessagesList } from './MessagesList';
import { QuickTemplates } from './QuickTemplates';
import { PhotoUpload } from './PhotoUpload';
import { 
  MessageCircle, 
  Send, 
  Paperclip,
  Info,
  RefreshCw
} from 'lucide-react';

interface MessagesContainerProps {
  babyId: string;
}

export const MessagesContainer = ({ babyId }: MessagesContainerProps) => {
  const { messages, loading, sending, sendMessage, refetch } = useMessages(babyId);
  const [newMessage, setNewMessage] = useState('');
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const success = await sendMessage(newMessage.trim());
    if (success) {
      setNewMessage('');
      inputRef.current?.focus();
    }
  };

  const handleQuickTemplate = async (template: string) => {
    const success = await sendMessage(template, 'quick_update');
    if (success) {
      setShowQuickTemplates(false);
    }
  };

  const handlePhotoUpload = async (photoUrl: string, caption?: string) => {
    const success = await sendMessage(caption || 'Shared a photo', 'photo', photoUrl, 'image');
    if (success) {
      setShowPhotoUpload(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (loading) {
    return (
      <Card className="mx-2 sm:mx-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Family Messages</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Loading messages...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Information Alert */}
      <Alert className="mx-2 sm:mx-0 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Family Messaging:</strong> Share updates, ask questions, and coordinate care with all family members. 
          Messages are visible to everyone with access to this baby's profile.
        </AlertDescription>
      </Alert>

      {/* Messages Card */}
      <Card className="mx-2 sm:mx-0 shadow-sm">
        <CardHeader className="pb-4 sm:pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <span>Messages ({messages.length})</span>
            </CardTitle>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages List */}
          <div className="min-h-[300px] max-h-[500px] overflow-y-auto">
            <MessagesList messages={messages} />
          </div>

          {/* Message Input */}
          <div className="border-t pt-4 space-y-3">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={sending}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPhotoUpload(!showPhotoUpload)}
                className="px-3"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || sending}
                className="px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowQuickTemplates(!showQuickTemplates)}
                className="text-xs"
              >
                Quick Updates
              </Button>
              <Badge variant="secondary" className="text-xs">
                Real-time messaging
              </Badge>
            </div>

            {/* Quick Templates */}
            {showQuickTemplates && (
              <QuickTemplates 
                onSelectTemplate={handleQuickTemplate}
                onClose={() => setShowQuickTemplates(false)}
              />
            )}

            {/* Photo Upload */}
            {showPhotoUpload && (
              <PhotoUpload
                babyId={babyId}
                onPhotoUploaded={handlePhotoUpload}
                onClose={() => setShowPhotoUpload(false)}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
