
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Bell, BellOff, Moon, Baby, TrendingUp, Target, UtensilsCrossed, Clock, Info, AlertCircle, Globe, CheckCircle, Zap, Sparkles, Send } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SmartNotifications = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSendingTest, setIsSendingTest] = useState(false);
  const { 
    permission, 
    settings, 
    isLoading, 
    requestPermission, 
    updateSettings,
    isSupported 
  } = useNotifications();
  
  useSmartNotifications();

  const handleSendTestNotification = async () => {
    setIsSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-notification');
      if (error) throw error;
      
      if (data?.error === 'no_subscription') {
        toast({
          title: "لا يوجد اشتراك",
          description: "يرجى تفعيل الإشعارات أولاً ثم المحاولة مرة أخرى",
          variant: "destructive",
        });
      } else {
        toast({
          title: "تم الإرسال! 🎉",
          description: `تم إرسال ${data?.sent || 0} إشعار تجريبي بنجاح`,
        });
      }
    } catch (error: any) {
      console.error('Test notification error:', error);
      toast({
        title: "خطأ",
        description: "فشل إرسال الإشعار التجريبي",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handlePermissionRequest = async () => {
    await requestPermission();
  };

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleQuietHoursChange = (key: string, value: any) => {
    updateSettings({
      quietHours: {
        ...settings.quietHours,
        [key]: value
      }
    });
  };

  const activeCount = [
    settings.feedingReminders,
    settings.sleepReminders,
    settings.milestoneReminders,
    settings.patternAlerts
  ].filter(Boolean).length;

  const categories = [
    {
      key: 'feedingReminders',
      icon: UtensilsCrossed,
      label: t('notifications.feedingReminders'),
      desc: t('notifications.feedingRemindersDesc'),
      gradient: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      checked: settings.feedingReminders,
      hasInterval: true,
    },
    {
      key: 'sleepReminders',
      icon: Moon,
      label: t('notifications.sleepReminders'),
      desc: t('notifications.sleepRemindersDesc'),
      gradient: 'from-purple-500/10 to-indigo-500/10',
      borderColor: 'border-purple-200',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      checked: settings.sleepReminders,
    },
    {
      key: 'milestoneReminders',
      icon: Target,
      label: t('notifications.milestoneReminders'),
      desc: t('notifications.milestoneRemindersDesc'),
      gradient: 'from-emerald-500/10 to-green-500/10',
      borderColor: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      checked: settings.milestoneReminders,
    },
    {
      key: 'patternAlerts',
      icon: TrendingUp,
      label: t('notifications.patternAlerts'),
      desc: t('notifications.patternAlertsDesc'),
      gradient: 'from-orange-500/10 to-amber-500/10',
      borderColor: 'border-orange-200',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      checked: settings.patternAlerts,
    },
  ];

  const steps = [
    { icon: Bell, label: t('notifications.enableButton'), num: 1 },
    { icon: Baby, label: t('notifications.reminderTypes'), num: 2 },
    { icon: Zap, label: t('notifications.howItWorks'), num: 3 },
  ];

  return (
    <FeatureGate feature="notifications">
      <div className="space-y-5">
        {/* Permission Alerts */}
        {!isSupported && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-amber-100">
                  <Info className="h-4 w-4 text-amber-600" />
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-amber-900">{t('notifications.notSupported')}</p>
                  <p className="text-amber-700">Use Chrome, Firefox, or Safari on HTTPS for full support.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isSupported && permission === 'denied' && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-destructive">{t('notifications.blocked')}</p>
                  <p className="text-muted-foreground">Click the lock icon in your address bar → Set Notifications to "Allow" → Refresh.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Card */}
        <Card className="overflow-hidden border-0 shadow-md">
          <div className={`p-5 ${permission === 'granted' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} text-white`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  {permission === 'granted' ? (
                    <Bell className="h-5 w-5 text-white animate-pulse" />
                  ) : (
                    <BellOff className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {permission === 'granted' ? t('notifications.enabled') : t('notifications.enableTitle')}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {permission === 'granted' 
                      ? `${activeCount}/4 ${t('notifications.reminderTypes')}`
                      : t('notifications.enablePrompt')
                    }
                  </p>
                </div>
              </div>
              {permission === 'granted' && (
                <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Active</span>
                </div>
              )}
            </div>

            {permission === 'granted' ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-white/80">
                  <span>{t('notifications.reminderTypes')}</span>
                  <span>{activeCount}/4</span>
                </div>
                <Progress value={(activeCount / 4) * 100} className="h-2 bg-white/20 [&>div]:bg-white" />
              </div>
            ) : isSupported && permission === 'default' ? (
              <Button 
                onClick={handlePermissionRequest}
                disabled={isLoading}
                className="w-full bg-white text-blue-600 hover:bg-white/90 font-medium"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isLoading ? t('notifications.requesting') : t('notifications.enableButton')}
              </Button>
            ) : null}
          </div>
        </Card>

        {/* Notification Categories Grid */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            {t('notifications.reminderTypes')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Card 
                  key={cat.key} 
                  className={`relative overflow-hidden transition-all duration-200 ${cat.checked ? cat.borderColor + ' shadow-sm' : 'border-border opacity-70'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} ${cat.checked ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                  <CardContent className="relative p-3.5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg ${cat.checked ? cat.iconBg : 'bg-muted'} transition-colors`}>
                        <Icon className={`h-4 w-4 ${cat.checked ? cat.iconColor : 'text-muted-foreground'} transition-colors`} />
                      </div>
                      <Switch
                        checked={cat.checked}
                        onCheckedChange={(checked) => handleSettingChange(cat.key, checked)}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground leading-tight">{cat.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cat.desc}</p>
                    </div>
                    {/* Inline feeding interval */}
                    {cat.hasInterval && cat.checked && (
                      <Select
                        value={settings.feedingInterval.toString()}
                        onValueChange={(value) => handleSettingChange('feedingInterval', parseInt(value))}
                      >
                        <SelectTrigger className="h-8 text-xs bg-background/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="120">{t('notifications.intervals.2hours')}</SelectItem>
                          <SelectItem value="150">{t('notifications.intervals.2.5hours')}</SelectItem>
                          <SelectItem value="180">{t('notifications.intervals.3hours')}</SelectItem>
                          <SelectItem value="210">{t('notifications.intervals.3.5hours')}</SelectItem>
                          <SelectItem value="240">{t('notifications.intervals.4hours')}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quiet Hours - Compact */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${settings.quietHours.enabled ? 'bg-indigo-100' : 'bg-muted'}`}>
                  <Moon className={`h-4 w-4 transition-colors ${settings.quietHours.enabled ? 'text-indigo-600' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{t('notifications.quietHours')}</p>
                  <p className="text-xs text-muted-foreground">{t('notifications.quietHoursDesc')}</p>
                </div>
              </div>
              <Switch
                checked={settings.quietHours.enabled}
                onCheckedChange={(checked) => handleQuietHoursChange('enabled', checked)}
              />
            </div>
            {settings.quietHours.enabled && (
              <div className="mt-3 pt-3 border-t flex items-center gap-3">
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                    className="h-8 text-xs flex-1"
                  />
                  <span className="text-xs text-muted-foreground">→</span>
                  <Input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                    className="h-8 text-xs flex-1"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works - Stepper */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t('notifications.howItWorks')}
            </h3>
            <div className="flex items-start justify-between gap-2">
              {steps.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <div key={i} className="flex flex-col items-center text-center flex-1 relative">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <StepIcon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground leading-tight">{step.label}</span>
                    {i < steps.length - 1 && (
                      <div className="absolute top-4 left-[calc(50%+20px)] w-[calc(100%-40px)] h-px bg-border" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureGate>
  );
};
