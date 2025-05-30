
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Moon, Sun, Clock, RotateCcw, Download, Calendar, CheckCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

interface SleepScheduleDisplayProps {
  schedule: Tables<'sleep_schedules'>;
}

export const SleepScheduleDisplay = ({ schedule }: SleepScheduleDisplayProps) => {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Parse naps from JSON
  const naps = Array.isArray(schedule.recommended_naps) ? schedule.recommended_naps : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Moon className="h-6 w-6 text-purple-600" />
              <span>Your Personalized Sleep Schedule</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700 font-medium">Saved</span>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {schedule.total_sleep_hours}h total sleep
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-2">
            Based on your child's age and current habits, here's a biologically appropriate sleep schedule 
            designed to optimize their rest and development.
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Created on {formatDate(schedule.created_at)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Sleep Times */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Moon className="h-5 w-5 text-blue-600" />
              <span>Bedtime</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatTime(schedule.recommended_bedtime)}
            </div>
            <p className="text-sm text-gray-600">
              Recommended bedtime for optimal night sleep
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sun className="h-5 w-5 text-yellow-600" />
              <span>Wake Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {formatTime(schedule.recommended_wake_time)}
            </div>
            <p className="text-sm text-gray-600">
              Consistent wake time to maintain rhythm
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Nap Schedule */}
      {naps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span>Nap Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {naps.map((nap: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <h4 className="font-medium text-green-800">{nap.name}</h4>
                    <p className="text-sm text-green-600">Duration: {formatDuration(nap.duration)}</p>
                  </div>
                  <div className="text-xl font-bold text-green-700">
                    {formatTime(nap.startTime)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Schedule Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Schedule Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
              <span className="font-medium">Wake Up</span>
              <span className="text-yellow-700 font-bold">{formatTime(schedule.recommended_wake_time)}</span>
            </div>
            
            {naps.map((nap: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="font-medium">{nap.name}</span>
                <span className="text-green-700 font-bold">
                  {formatTime(nap.startTime)} ({formatDuration(nap.duration)})
                </span>
              </div>
            ))}
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="font-medium">Bedtime</span>
              <span className="text-blue-700 font-bold">{formatTime(schedule.recommended_bedtime)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800">Implementation Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-purple-700">
            <li>• Gradually adjust current times by 15-30 minutes every few days</li>
            <li>• Keep consistent wake times even on weekends</li>
            <li>• Create a calming bedtime routine 30-60 minutes before sleep</li>
            <li>• Ensure the sleep environment is dark, quiet, and comfortable</li>
            <li>• Be patient - it may take 1-2 weeks for the new schedule to feel natural</li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex space-x-4">
        <Button onClick={() => window.location.reload()} variant="outline" className="flex items-center space-x-2">
          <RotateCcw className="h-4 w-4" />
          <span>Create New Schedule</span>
        </Button>
        <Button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700">
          <Download className="h-4 w-4" />
          <span>Export Schedule</span>
        </Button>
      </div>
    </div>
  );
};
