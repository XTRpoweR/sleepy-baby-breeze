import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, Bed, Baby, Bell, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onClose?: () => void;
}

export const PremiumLockScreen = ({ onClose }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    { icon: Bed, key: 'sleep' },
    { icon: Baby, key: 'feeding' },
    { icon: Activity, key: 'diapers' },
    { icon: Bell, key: 'notifications' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
          <Sparkles className="h-10 w-10 text-primary-foreground" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-background border-2 border-background flex items-center justify-center">
          <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-2">{t('chat.premiumGate.title')}</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {t('chat.premiumGate.description')}
      </p>

      <div className="w-full max-w-sm space-y-2 mb-6">
        {features.map(({ icon: Icon, key }) => (
          <div
            key={key}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-left"
          >
            <Icon className="h-5 w-5 text-primary shrink-0" />
            <span className="text-sm">
              {t(`chat.premiumGate.features.${key}`)}
            </span>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        className="w-full max-w-sm"
        onClick={() => {
          onClose?.();
          navigate('/subscription');
        }}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {t('chat.premiumGate.cta')}
      </Button>

      <p className="text-xs text-muted-foreground mt-3">
        {t('chat.premiumGate.trialNote')}
      </p>
    </div>
  );
};
