
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, CheckCircle, X, Clock, ArrowRight } from 'lucide-react';
import { useScheduleAdjustments } from '@/hooks/useScheduleAdjustments';
import { Tables } from '@/integrations/supabase/types';

interface ScheduleAdjustmentNotificationsProps {
  babyId: string;
  currentSchedule: Tables<'sleep_schedules'> | null;
}

export const ScheduleAdjustmentNotifications = ({ 
  babyId, 
  currentSchedule 
}: ScheduleAdjustmentNotificationsProps) => {
  const { pendingAdjustments, approveAdjustment, dismissAdjustment } = useScheduleAdjustments(babyId, currentSchedule);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (pendingAdjustments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {pendingAdjustments.map((adjustment) => (
        <Alert key={adjustment.id} className="border-blue-200 bg-blue-50">
          <Bell className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Age Update: {adjustment.currentAge} → {adjustment.newAge} months
                  </Badge>
                </div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Sleep Schedule Adjustment Recommended
                </p>
                <p className="text-sm text-blue-700">
                  {adjustment.reason}
                </p>
              </div>

              {/* Current vs Suggested Schedule Comparison */}
              <div className="grid md:grid-cols-2 gap-4 p-3 bg-white rounded-lg border">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Current Schedule
                  </h4>
                  {currentSchedule && (
                    <div className="space-y-1 text-sm">
                      <div>Bedtime: {formatTime(currentSchedule.recommended_bedtime)}</div>
                      <div>Wake: {formatTime(currentSchedule.recommended_wake_time)}</div>
                      <div>
                        Naps: {Array.isArray(currentSchedule.recommended_naps) 
                          ? currentSchedule.recommended_naps.length 
                          : 0} per day
                      </div>
                      <div>Total Sleep: {currentSchedule.total_sleep_hours}h</div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <ArrowRight className="h-4 w-4 mr-1 text-green-600" />
                    Suggested Schedule
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div>Bedtime: {formatTime(adjustment.suggestedSchedule.bedtime)}</div>
                    <div>Wake: {formatTime(adjustment.suggestedSchedule.wakeTime)}</div>
                    <div>Naps: {adjustment.suggestedSchedule.naps.length} per day</div>
                    <div>Total Sleep: {adjustment.suggestedSchedule.totalSleepHours}h</div>
                  </div>
                </div>
              </div>

              {/* Nap Schedule Details */}
              {adjustment.suggestedSchedule.naps.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-2">Suggested Nap Schedule:</h5>
                  <div className="grid gap-2">
                    {adjustment.suggestedSchedule.naps.map((nap, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-green-800">{nap.name}</span>
                        <span className="text-green-700">
                          {formatTime(nap.startTime)} ({Math.floor(nap.duration / 60)}h {nap.duration % 60}m)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => approveAdjustment(adjustment.id)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Apply New Schedule</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => dismissAdjustment(adjustment.id)}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Not Now</span>
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
