
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User,
  LogOut,
  Crown,
  Settings,
  Bell,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserProfileDropdown = () => {
  const { user, signOut } = useAuth();
  const { isPremium, loading } = useSubscription();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleManageSubscription = () => {
    navigate('/account');
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  const userDisplayName = user?.user_metadata?.full_name || user?.email || 'User';
  const userInitials = userDisplayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-sm">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900 truncate max-w-32">
              {userDisplayName}
            </span>
            {!loading && isPremium && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg border">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{userDisplayName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleNotifications} className="cursor-pointer">
          <Bell className="h-4 w-4 mr-2" />
          <span>{t('notifications.title')}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleManageSubscription} className="cursor-pointer">
          <Settings className="h-4 w-4 mr-2" />
          <span>Account Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          <span>{t('navigation.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
