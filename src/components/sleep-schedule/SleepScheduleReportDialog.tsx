
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Moon, Sun, Clock, X } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { ScheduleRecommendation, Nap } from '@/types/sleepSchedule';
import { exportSleepScheduleAsPDF } from '@/utils/exportSleepSchedule';
import { useToast } from '@/hooks/use-toast';

interface SleepScheduleReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Tables<'sleep_schedules'> | null;
}

export const SleepScheduleReportDialog = ({ isOpen, onClose, schedule }: SleepScheduleReportDialogProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  if (!schedule) return null;

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
      day: 'numeric'
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const naps = Array.isArray(schedule.recommended_naps) ? (schedule.recommended_naps as Nap[]) : [];
      const recommendation: ScheduleRecommendation = {
        bedtime: schedule.recommended_bedtime,
        wakeTime: schedule.recommended_wake_time,
        naps: naps,
        totalSleepHours: schedule.total_sleep_hours
      };

      const filename = `sleep-schedule-${schedule.child_age}months-${formatDate(schedule.created_at).replace(/\s+/g, '-').toLowerCase()}.pdf`;
      await exportSleepScheduleAsPDF(recommendation, schedule.child_age, filename);
      
      toast({
        title: "Export Successful!",
        description: "Sleep schedule has been downloaded as PDF",
      });
    } catch (error) {
      console.error('Error exporting schedule:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export sleep schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Cast the Json type to Nap array with proper type checking
  const naps = Array.isArray(schedule.recommended_naps) ? (schedule.recommended_naps as Nap[]) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="inset-0 left-0 top-0 translate-x-0 translate-y-0 w-screen h-[100dvh] rounded-none bg-background p-0 overflow-y-auto sm:left-1/2 sm:top-1/2 sm:translate-x-[-50%] sm:translate-y-[-50%] sm:w-full sm:max-w-4xl sm:h-auto sm:max-h-[90vh] sm:rounded-lg sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Moon className="h-5 w-5 text-purple-600" />
              <span className="text-lg sm:text-xl">Sleep Schedule Report</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                {schedule.child_age} months old
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Schedule Info */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                {schedule.total_sleep_hours}h total sleep
              </Badge>
              <span className="text-sm text-gray-600">
                Created on {formatDate(schedule.created_at)}
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              Biologically appropriate sleep schedule designed to optimize rest and development.
            </p>
          </div>

          {/* Main Sleep Times */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Moon className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Bedtime</span>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatTime(schedule.recommended_bedtime)}
              </div>
              <p className="text-sm text-gray-600">
                Recommended bedtime for optimal night sleep
              </p>
            </div>

            <div className="border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Wake Time</span>
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {formatTime(schedule.recommended_wake_time)}
              </div>
              <p className="text-sm text-gray-600">
                Consistent wake time to maintain rhythm
              </p>
            </div>
          </div>

          {/* Nap Schedule */}
          {naps.length > 0 && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="h-5 w-5 text-green-600" />
                <span className="font-medium">Nap Schedule</span>
              </div>
              <div className="space-y-3">
                {naps.map((nap, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
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
            </div>
          )}

          {/* Daily Schedule Overview */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Daily Schedule Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                <span className="font-medium">Wake Up</span>
                <span className="text-yellow-700 font-bold">{formatTime(schedule.recommended_wake_time)}</span>
              </div>
              
              {naps.map((nap, index) => (
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
          </div>

          {/* Implementation Tips */}
          <div className="bg-purple-50 border-purple-200 border rounded-lg p-4">
            <h3 className="font-medium text-purple-800 mb-3">Implementation Tips</h3>
            <ul className="space-y-1 text-sm text-purple-700">
              <li>• Gradually adjust current times by 15-30 minutes every few days</li>
              <li>• Keep consistent wake times even on weekends</li>
              <li>• Create a calming bedtime routine 30-60 minutes before sleep</li>
              <li>• Ensure the sleep environment is dark, quiet, and comfortable</li>
              <li>• Be patient - it may take 1-2 weeks for the new schedule to feel natural</li>
            </ul>
          </div>

          {/* Sleep Challenges */}
          {schedule.sleep_challenges && schedule.sleep_challenges.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Noted Sleep Challenges</h3>
              <div className="flex flex-wrap gap-2">
                {schedule.sleep_challenges.map((challenge, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-50">
                    {challenge}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
