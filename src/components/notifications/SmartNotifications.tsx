
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, BellOff, Settings, Clock, Baby, TrendingUp, Info } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { FeatureGate } from '@/components/subscription/FeatureGate';

export const SmartNotifications = () => {
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
              <span>Smart Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!isSupported && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Your browser doesn't support notifications. Please use a modern browser for the best experience.
                  </AlertDescription>
                </Alert>
              )}

              {isSupported && permission !== 'granted' && (
                <Alert>
                  <BellOff className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Enable notifications to receive smart reminders for your baby's care</span>
                    <Button 
                      onClick={handlePermissionRequest}
                      disabled={isLoading}
                      size="sm"
                    >
                      {isLoading ? 'Requesting...' : 'Enable Notifications'}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {permission === 'granted' && (
                <Alert>
                  <Bell className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Notifications are enabled! You'll receive smart reminders based on your baby's patterns.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Baby className="h-5 w-5 text-purple-600" />
              <span>Reminder Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="feeding-reminders">Feeding Reminders</Label>
                <p className="text-sm text-gray-600">Get notified when it's time for the next feeding</p>
              </div>
              <Switch
                id="feeding-reminders"
                checked={settings.feedingReminders}
                onCheckedChange={(checked) => handleSettingChange('feedingReminders', checked)}
              />
            </div>

            {settings.feedingReminders && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="feeding-interval">Reminder Interval</Label>
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
                <Label htmlFor="sleep-reminders">Sleep Reminders</Label>
                <p className="text-sm text-gray-600">Age-appropriate nap and bedtime suggestions</p>
              </div>
              <Switch
                id="sleep-reminders"
                checked={settings.sleepReminders}
                onCheckedChange={(checked) => handleSettingChange('sleepReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="milestone-reminders">Milestone Reminders</Label>
                <p className="text-sm text-gray-600">Important developmental milestones and checkups</p>
              </div>
              <Switch
                id="milestone-reminders"
                checked={settings.milestoneReminders}
                onCheckedChange={(checked) => handleSettingChange('milestoneReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pattern-alerts">Pattern Alerts</Label>
                <p className="text-sm text-gray-600">Unusual sleep or feeding pattern notifications</p>
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
                <span>Advanced Settings</span>
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
                    <Label htmlFor="quiet-hours">Quiet Hours</Label>
                    <p className="text-sm text-gray-600">Disable notifications during these hours</p>
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
                      <Label htmlFor="quiet-start">Start Time</Label>
                      <Input
                        id="quiet-start"
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiet-end">End Time</Label>
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
              <span>How Smart Notifications Work</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Feeding Reminders</h4>
                <p>Based on your baby's last feeding time and your preferred interval</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Sleep Suggestions</h4>
                <p>Age-appropriate nap times and bedtime reminders based on developmental stages</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Milestone Alerts</h4>
                <p>Important developmental milestones and scheduled checkup reminders</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Pattern Analysis</h4>
                <p>Notifications about unusual patterns in sleep or feeding behaviors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureGate>
  );
};
