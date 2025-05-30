
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { EditActivityDialog } from './EditActivityDialog';
import { 
  Moon, 
  Milk, 
  Heart, 
  Plus, 
  Edit, 
  Trash2,
  Clock,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLogsListProps {
  babyId: string;
}

const ACTIVITY_ICONS = {
  sleep: Moon,
  feeding: Milk,
  diaper: Heart,
  custom: Plus
};

const ACTIVITY_COLORS = {
  sleep: 'bg-purple-100 text-purple-800',
  feeding: 'bg-green-100 text-green-800',
  diaper: 'bg-pink-100 text-pink-800',
  custom: 'bg-orange-100 text-orange-800'
};

export const ActivityLogsList = ({ babyId }: ActivityLogsListProps) => {
  const { logs, loading, deleteLog } = useActivityLogs(babyId);
  const [editingLog, setEditingLog] = useState<any>(null);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getActivityLabel = (log: any) => {
    if (log.activity_type === 'custom') {
      return log.metadata?.activity_name || 'Custom Activity';
    }
    return log.activity_type.charAt(0).toUpperCase() + log.activity_type.slice(1);
  };

  const getActivityDetails = (log: any) => {
    switch (log.activity_type) {
      case 'sleep':
        return log.metadata?.sleep_type || 'Sleep';
      case 'feeding':
        const type = log.metadata?.feeding_type || 'Feeding';
        const side = log.metadata?.side ? ` (${log.metadata.side})` : '';
        const quantity = log.metadata?.quantity ? ` - ${log.metadata.quantity}ml` : '';
        return `${type}${side}${quantity}`;
      case 'diaper':
        return log.metadata?.type || 'Diaper change';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading activity logs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No activities logged yet.</p>
            <p className="text-sm text-gray-500">Start tracking activities to see them here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Activity Logs ({logs.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const Icon = ACTIVITY_ICONS[log.activity_type];
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <Badge className={ACTIVITY_COLORS[log.activity_type]}>
                            {getActivityLabel(log)}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(log.start_time), 'MMM dd, yyyy')}</div>
                        <div className="text-gray-500">
                          {format(new Date(log.start_time), 'h:mm a')}
                          {log.end_time && ` - ${format(new Date(log.end_time), 'h:mm a')}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDuration(log.duration_minutes)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{getActivityDetails(log)}</div>
                        {log.notes && (
                          <div className="text-gray-500 text-xs mt-1 max-w-xs truncate">
                            {log.notes}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingLog(log)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Activity Log</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this activity log? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteLog(log.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {editingLog && (
        <EditActivityDialog
          log={editingLog}
          open={!!editingLog}
          onClose={() => setEditingLog(null)}
          babyId={babyId}
        />
      )}
    </Card>
  );
};
