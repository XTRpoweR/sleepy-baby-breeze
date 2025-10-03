
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EditActivityDialog } from './EditActivityDialog';
import { PermissionAwareActions } from './PermissionAwareActions';
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

interface ActivityLog {
  id: string;
  activity_type: 'sleep' | 'feeding' | 'diaper' | 'custom';
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
  metadata: any;
  created_at: string;
}

interface ActivityLogsListProps {
  babyId: string;
  logs: ActivityLog[];
  loading: boolean;
  deleteLog: (logId: string) => Promise<boolean>;
  updateLog: (logId: string, updates: Partial<ActivityLog>) => Promise<boolean>;
  onActivityUpdated?: () => void;
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

export const ActivityLogsList = ({ 
  babyId, 
  logs, 
  loading, 
  deleteLog, 
  updateLog, 
  onActivityUpdated 
}: ActivityLogsListProps) => {
  const { t } = useTranslation();
  const [editingLog, setEditingLog] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const confirmDialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!confirmOpen) return;

    const recenter = () => {
      confirmDialogRef.current?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' });
    };

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recenter);
    };
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recenter);
    };
    const onTouchMove = (e: TouchEvent) => {
      // Prevent page scroll under the dialog on iOS and keep it centered
      e.preventDefault();
      onScroll();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    // Initial center
    recenter();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('touchmove', onTouchMove);
      cancelAnimationFrame(raf);
    };
  }, [confirmOpen]);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getActivityLabel = (log: any) => {
    if (log.activity_type === 'custom') {
      return log.metadata?.activity_name || t('activities.custom');
    }
    return t(`activities.${log.activity_type}`);
  };

  const getActivityDetails = (log: any) => {
    switch (log.activity_type) {
      case 'sleep':
        return log.metadata?.sleep_type || t('activities.sleep');
      case 'feeding':
        const type = log.metadata?.feeding_type || t('activities.feeding');
        const side = log.metadata?.side ? ` (${log.metadata.side})` : '';
        const quantity = log.metadata?.quantity ? ` - ${log.metadata.quantity}ml` : '';
        return `${type}${side}${quantity}`;
      case 'diaper':
        return log.metadata?.type || t('activities.diaper');
      default:
        return '';
    }
  };

  const handleDeleteLog = async (logId: string) => {
    const success = await deleteLog(logId);
    if (success && onActivityUpdated) {
      onActivityUpdated();
    }
  };

  const handleUpdateLog = async (logId: string, updates: Partial<ActivityLog>) => {
    const success = await updateLog(logId, updates);
    if (success && onActivityUpdated) {
      onActivityUpdated();
    }
    return success;
  };

  if (loading) {
    return (
      <Card className="rounded-3xl shadow-xl bg-gradient-to-br from-secondary/5 via-card to-accent/10">
        <CardHeader>
          <CardTitle className="text-gradient">{t('common.loading')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">{t('common.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="rounded-3xl shadow-xl bg-gradient-to-br from-secondary/5 via-card to-accent/10">
        <CardHeader>
          <CardTitle className="text-gradient">{t('dashboard.todaysActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('dashboard.noDataMessage', { name: '' })}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl shadow-xl bg-gradient-to-br from-secondary/5 via-card to-accent/10 border-2 hover:shadow-2xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-gradient">{t('dashboard.todaysActivity')} ({logs.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] md:max-h-[600px] lg:max-h-[700px] overflow-y-auto overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('activities.sleep')}</TableHead>
                <TableHead>{t('tracking.common.startTime')}</TableHead>
                <TableHead>{t('common.duration')}</TableHead>
                <TableHead>{t('tracking.common.notes')}</TableHead>
                <TableHead>{t('common.edit')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const Icon = ACTIVITY_ICONS[log.activity_type];
                return (
                  <TableRow key={log.id} className="hover:bg-accent/50 transition-all duration-200 hover:scale-[1.01]">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 animate-fade-in" />
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
                        <PermissionAwareActions 
                          requiredPermission="canEdit" 
                          fallback={null}
                          showMessage={false}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingLog(log)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionAwareActions>
                        
                        <PermissionAwareActions 
                          requiredPermission="canDelete" 
                          fallback={null}
                          showMessage={false}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => { setPendingDeleteId(log.id); setConfirmOpen(true); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionAwareActions>
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
          updateLog={handleUpdateLog}
        />
      )}

      <Dialog open={confirmOpen} onOpenChange={(open) => { if (!open) { setConfirmOpen(false); setPendingDeleteId(null); } }}>
        <DialogContent
          ref={confirmDialogRef}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-[92vw] max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>{t('common.delete')}</DialogTitle>
            <DialogDescription>{t('common.confirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (pendingDeleteId) {
                  await handleDeleteLog(pendingDeleteId);
                }
                setConfirmOpen(false);
                setPendingDeleteId(null);
              }}
            >
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
