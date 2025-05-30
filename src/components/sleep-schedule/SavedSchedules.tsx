
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Trash2, Eye, Calendar } from 'lucide-react';
import { useSleepSchedule } from '@/hooks/useSleepSchedule';
import { Tables } from '@/integrations/supabase/types';

interface SavedSchedulesProps {
  babyId: string;
  onViewSchedule: (schedule: Tables<'sleep_schedules'>) => void;
}

export const SavedSchedules = ({ babyId, onViewSchedule }: SavedSchedulesProps) => {
  const { schedules, loading, deleteSleepSchedule } = useSleepSchedule(babyId);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading saved schedules...</div>
        </CardContent>
      </Card>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5 text-purple-600" />
            <span>Saved Sleep Schedules</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No saved sleep schedules yet.</p>
            <p className="text-sm">Create your first personalized schedule above!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5 text-purple-600" />
          <span>Saved Sleep Schedules</span>
          <Badge variant="secondary">{schedules.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="font-medium text-gray-900">
                      Age: {schedule.child_age} months
                    </div>
                    <div className="text-sm text-gray-600">
                      Created on {formatDate(schedule.created_at)}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800">
                    {schedule.total_sleep_hours}h total
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewSchedule(schedule)}
                    className="flex items-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSleepSchedule(schedule.id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700">Bedtime</div>
                  <div className="text-blue-600">{formatTime(schedule.recommended_bedtime)}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Wake Time</div>
                  <div className="text-yellow-600">{formatTime(schedule.recommended_wake_time)}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Naps</div>
                  <div className="text-green-600">
                    {Array.isArray(schedule.recommended_naps) ? schedule.recommended_naps.length : 0} naps
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Challenges</div>
                  <div className="text-gray-600">{schedule.sleep_challenges?.length || 0} noted</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
