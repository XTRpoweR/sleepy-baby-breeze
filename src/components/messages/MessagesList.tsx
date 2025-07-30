
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Camera,
  Clock,
  User
} from 'lucide-react';

interface Message {
  id: string;
  message_type: string;
  content: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  created_at: string;
  sender_name: string;
  sender_email: string;
  is_own_message: boolean;
}

interface MessagesListProps {
  messages: Message[];
}

export const MessagesList = ({ messages }: MessagesListProps) => {
  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-base mb-2">No messages yet</p>
        <p className="text-sm text-gray-500">Start a conversation with your family!</p>
      </div>
    );
  }

  const renderMessageContent = (message: Message) => {
    if (message.message_type === 'photo' && message.attachment_url) {
      return (
        <div className="space-y-2">
          <img 
            src={message.attachment_url} 
            alt="Shared photo"
            className="max-w-xs rounded-lg border"
          />
          {message.content && (
            <p className="text-sm">{message.content}</p>
          )}
        </div>
      );
    }

    return (
      <p className="text-sm sm:text-base whitespace-pre-wrap">
        {message.content}
      </p>
    );
  };

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case 'photo':
        return <Camera className="h-3 w-3" />;
      case 'quick_update':
        return <Clock className="h-3 w-3" />;
      default:
        return <MessageCircle className="h-3 w-3" />;
    }
  };

  const getMessageTypeBadge = (messageType: string) => {
    switch (messageType) {
      case 'photo':
        return <Badge variant="secondary" className="text-xs">Photo</Badge>;
      case 'quick_update':
        return <Badge variant="outline" className="text-xs">Quick Update</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.is_own_message ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] rounded-lg p-3 ${
              message.is_own_message
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {/* Sender info for others' messages */}
            {!message.is_own_message && (
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-3 w-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">
                  {message.sender_name}
                </span>
                {getMessageTypeBadge(message.message_type)}
              </div>
            )}

            {/* Message content */}
            <div className="space-y-2">
              {renderMessageContent(message)}
              
              {/* Message metadata */}
              <div className={`flex items-center justify-between text-xs ${
                message.is_own_message ? 'text-blue-100' : 'text-gray-500'
              }`}>
                <div className="flex items-center space-x-1">
                  {getMessageTypeIcon(message.message_type)}
                  <span>
                    {format(new Date(message.created_at), 'MMM dd, HH:mm')}
                  </span>
                </div>
                {message.is_own_message && getMessageTypeBadge(message.message_type)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
