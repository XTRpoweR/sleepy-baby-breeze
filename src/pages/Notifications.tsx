
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell } from 'lucide-react';
import { SmartNotifications } from '@/components/notifications/SmartNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const Notifications = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">{t('notifications.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t('notifications.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('notifications.subtitle')}</p>
          </div>
        </div>

        {/* Smart Notifications Component */}
        <SmartNotifications />
      </div>
    </div>
  );
};

export default Notifications;
