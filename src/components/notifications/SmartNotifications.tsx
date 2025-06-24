
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, BellOff, Settings, Clock, Baby, TrendingUp, Info, AlertCircle, Globe, Save, CheckCircle } from 'lucide-react';
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
    saveSettings,
    isSupported 
  } = useNotifications();
  
  useSmartNotifications(); // Activate smart notifications
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handlePermissionRequest = async () => {
    await requestPermission();
  };

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value });
    setHasUnsavedChanges(false); // updateSettings auto-saves now
  };

  const handleQuietHoursChange = (key: string, value: any) => {
    updateSettings({
      quietHours: {
        ...settings.quietHours,
        [key]: value
      }
    });
    setHasUnsavedChanges(false); // updateSettings auto-saves now
  };

  const handleManualSave = () => {
    saveSettings();
    setHasUnsavedChanges(false);
  };

  return (
    <FeatureGate feature="notifications">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <span>{t('notifications.enableTitle')}</span>
              </div>
              {permission === 'granted' && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Active</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!isSupported && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>{t('notifications.notSupported')}</p>
                      <div className="text-sm text-gray-600">
                        <p><strong>Possible solutions:</strong></p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Use a modern browser (Chrome, Firefox, Safari, or Edge)</li>
                          <li>Make sure you're on HTTPS (not HTTP)</li>
                          <li>Try refreshing the page</li>
                          <li>Check if notifications are enabled in your browser settings</li>
                        </ul>
                      </div>
                      <p className="text-sm text-blue-600">
                        <strong>Alternative:</strong> You can still use all tracking features - just bookmark this page to check your baby's patterns manually!
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {isSupported && permission === 'default' && (
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{t('notifications.enablePrompt')}</span>
                    <Button 
                      onClick={handlePermissionRequest}
                      disabled={isLoading}
                      size="sm"
                    >
                      {isLoading ? t('notifications.requesting') : t('notifications.enableButton')}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {isSupported && permission === 'denied' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>{t('notifications.blocked')}</p>
                      <div className="text-sm">
                        <p><strong>To enable notifications:</strong></p>
                        <ol className="list-decimal pl-5 space-y-1">
                          <li>Click the lock/shield icon in your browser's address bar</li>
                          <li>Set "Notifications" to "Allow"</li>
                          <li>Refresh this page</li>
                        </ol>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {permission === 'granted' && (
                <Alert>
                  <Bell className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    {t('notifications.enabled')} You'll receive smart reminders based on your settings below.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Show tracking options even if notifications aren't supported */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Baby className="h-5 w-5 text-purple-600" />
                <span>
                  {isSupported && permission === 'granted' 
                    ? t('notifications.reminderTypes')
                    : 'Tracking Preferences'
                  }
                </span>
              </div>
              <Button
                onClick={handleManualSave}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Settings</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isSupported && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <Globe className="h-4 w-4 inline mr-2" />
                  While notifications aren't available, you can still configure your tracking preferences. 
                  These settings will be saved and used when you visit the app to check on your baby's patterns.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="feeding-reminders">{t('notifications.feedingReminders')}</Label>
                <p className="text-sm text-gray-600">{t('notifications.feedingRemindersDesc')}</p>
              </div>
              <Switch
                id="feeding-reminders"
                checked={settings.feedingReminders}
                onCheckedChange={(checked) => handleSettingChange('feedingReminders', checked)}
              />
            </div>

            {settings.feedingReminders && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="feeding-interval">{t('notifications.reminderInterval')}</Label>
                <Select
                  value={settings.feedingInterval.toString()}
                  onValueChange={(value) => handleSettingChange('feedingInterval', parseInt(value))}
                >
                  <SelectTrigger>
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
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sleep-reminders">{t('notifications.sleepReminders')}</Label>
                <p className="text-sm text-gray-600">{t('notifications.sleepRemindersDesc')}</p>
              </div>
              <Switch
                id="sleep-reminders"
                checked={settings.sleepReminders}
                onCheckedChange={(checked) => handleSettingChange('sleepReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="milestone-reminders">{t('notifications.milestoneReminders')}</Label>
                <p className="text-sm text-gray-600">{t('notifications.milestoneRemindersDesc')}</p>
              </div>
              <Switch
                id="milestone-reminders"
                checked={settings.milestoneReminders}
                onCheckedChange={(checked) => handleSettingChange('milestoneReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pattern-alerts">{t('notifications.patternAlerts')}</Label>
                <p className="text-sm text-gray-600">{t('notifications.patternAlertsDesc')}</p>
              </div>
              <Switch
                id="pattern-alerts"
                checked={settings.patternAlerts}
                onCheckedChange={(checked) => handleSettingChange('patternAlerts', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <span>{t('notifications.advancedSettings')}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? t('notifications.hide') : t('notifications.show')}
              </Button>
            </CardTitle>
          </CardHeader>
          {showAdvanced && (
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="quiet-hours">{t('notifications.quietHours')}</Label>
                    <p className="text-sm text-gray-600">{t('notifications.quietHoursDesc')}</p>
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
                      <Label htmlFor="quiet-start">{t('notifications.startTime')}</Label>
                      <Input
                        id="quiet-start"
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiet-end">{t('notifications.endTime')}</Label>
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

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>{t('notifications.howItWorks')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('notifications.feedingReminders')}</h4>
                <p>Get notified when it's time for your baby's next feeding based on your set intervals. Notifications are smart and won't spam you.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('notifications.sleepReminders')}</h4>
                <p>Receive age-appropriate sleep suggestions for naps and bedtime based on your baby's age and typical sleep patterns.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('notifications.milestoneReminders')}</h4>
                <p>Get alerts about important developmental milestones and checkup reminders based on your baby's age.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{t('notifications.patternAlerts')}</h4>
                <p>Receive notifications about unusual patterns or changes in your baby's routine that might need attention.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureGate>
  );
};
