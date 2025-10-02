
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">{t('notifications.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-4">
          <Button 
            variant="ghost" 
            size={isMobile ? "sm" : "default"}
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('navigation.back')}
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('notifications.title')}</h1>
          <p className="text-gray-600">{t('notifications.subtitle')}</p>
        </div>

        {/* Smart Notifications Component */}
        <SmartNotifications />
      </div>
    </div>
  );
};

export default Notifications;
