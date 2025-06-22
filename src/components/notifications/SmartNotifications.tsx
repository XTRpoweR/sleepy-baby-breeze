
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, BellOff, Settings, Clock, Baby, TrendingUp, Info, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { FeatureGate } from '@/components/subscription/FeatureGate';

export const SmartNotifications = () => {
  const { t } = useTranslation();
  const { 
    permission, 
    settings, 
    isLoading, 
    requestPermission, 
    updateSettings, 
    isSupported 
  } = useNotifications();
  
  useSmartNotifications(); // Activate smart notifications
  
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  return (
    <FeatureGate feature="notifications">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <span>{t('pages.notifications.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!isSupported && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {t('pages.notifications.browserNotSupported')}
                  </AlertDescription>
                </Alert>
              )}

              {isSupported && permission === 'default' && (
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{t('pages.notifications.enableNotifications')}</span>
                    <Button 
                      onClick={handlePermissionRequest}
                      disabled={isLoading}
                      size="sm"
                    >
                      {isLoading ? t('pages.notifications.requesting') : t('pages.notifications.enableButton')}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {isSupported && permission === 'denied' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('pages.notifications.notificationsBlocked')}
                    <br />
                    {t('pages.notifications.blockedStep1')}
                    <br />
                    {t('pages.notifications.blockedStep2')}
                    <br />
                    {t('pages.notifications.blockedStep3')}
                  </AlertDescription>
                </Alert>
              )}

              {permission === 'granted' && (
                <Alert>
                  <Bell className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    {t('pages.notifications.notificationsEnabled')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification Types - Only show if notifications are granted */}
        {permission === 'granted' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Baby className="h-5 w-5 text-purple-600" />
                <span>{t('pages.notifications.reminderTypes')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="feeding-reminders">{t('pages.notifications.feedingReminders')}</Label>
                  <p className="text-sm text-gray-600">{t('pages.notifications.feedingRemindersDesc')}</p>
                </div>
                <Switch
                  id="feeding-reminders"
                  checked={settings.feedingReminders}
                  onCheckedChange={(checked) => handleSettingChange('feedingReminders', checked)}
                />
              </div>

              {settings.feedingReminders && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="feeding-interval">{t('pages.notifications.reminderInterval')}</Label>
                  <Select
                    value={settings.feedingInterval.toString()}
                    onValueChange={(value) => handleSettingChange('feedingInterval', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="150">2.5 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                      <SelectItem value="210">3.5 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sleep-reminders">{t('pages.notifications.sleepReminders')}</Label>
                  <p className="text-sm text-gray-600">{t('pages.notifications.sleepRemindersDesc')}</p>
                </div>
                <Switch
                  id="sleep-reminders"
                  checked={settings.sleepReminders}
                  onCheckedChange={(checked) => handleSettingChange('sleepReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="milestone-reminders">{t('pages.notifications.milestoneReminders')}</Label>
                  <p className="text-sm text-gray-600">{t('pages.notifications.milestoneRemindersDesc')}</p>
                </div>
                <Switch
                  id="milestone-reminders"
                  checked={settings.milestoneReminders}
                  onCheckedChange={(checked) => handleSettingChange('milestoneReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pattern-alerts">{t('pages.notifications.patternAlerts')}</Label>
                  <p className="text-sm text-gray-600">{t('pages.notifications.patternAlertsDesc')}</p>
                </div>
                <Switch
                  id="pattern-alerts"
                  checked={settings.patternAlerts}
                  onCheckedChange={(checked) => handleSettingChange('patternAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advanced Settings - Only show if notifications are granted */}
        {permission === 'granted' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span>{t('pages.notifications.advancedSettings')}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Hide' : 'Show'}
                </Button>
              </CardTitle>
            </CardHeader>
            {showAdvanced && (
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="quiet-hours">{t('pages.notifications.quietHours')}</Label>
                      <p className="text-sm text-gray-600">{t('pages.notifications.quietHoursDesc')}</p>
                    </div>
                    <Switch
                      id="quiet-hours"
                      checked={settings.quietHours.enabled}
                      onCheckedChange={(checked) => handleQuietHoursChange('enabled', checked)}
                    />
                  </div>

                  {settings.quietHours.enabled && (
                    <div className="ml-6 grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quiet-start">{t('pages.notifications.startTime')}</Label>
                        <Input
                          id="quiet-start"
                          type="time"
                          value={settings.quietHours.start}
                          onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="quiet-end">{t('pages.notifications.endTime')}</Label>
                        <Input
                          id="quiet-end"
                          type="time"
                          value={settings.quietHours.end}
                          onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>{t('pages.notifications.howItWorks')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('pages.notifications.feedingRemindersWork')}</h4>
                <p>{t('pages.notifications.feedingRemindersWorkDesc')}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('pages.notifications.sleepSuggestionsWork')}</h4>
                <p>{t('pages.notifications.sleepSuggestionsWorkDesc')}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('pages.notifications.milestoneAlertsWork')}</h4>
                <p>{t('pages.notifications.milestoneAlertsWorkDesc')}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('pages.notifications.patternAnalysisWork')}</h4>
                <p>{t('pages.notifications.patternAnalysisWorkDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureGate>
  );
};
