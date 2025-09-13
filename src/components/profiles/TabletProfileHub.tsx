import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { User, Plus, Settings, Baby, Clock, Activity, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TabletProfileHubProps {
  onManageProfiles?: () => void;
}

export const TabletProfileHub = ({ onManageProfiles }: TabletProfileHubProps) => {
  const { t } = useTranslation();
  const { profiles, activeProfile, switchProfile } = useBabyProfile();
  const { stats, loading } = useDashboardStats();
  
  const handleManageProfiles = () => {
    try {
      if (onManageProfiles) {
        onManageProfiles();
      }
    } catch (error) {
      console.error('Error calling onManageProfiles:', error);
    }
  };

  const safeStats = (stats || {}) as any;

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-background/95 to-muted/30 rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">Active Profile</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManageProfiles}
            className="text-xs px-2 py-1 h-auto"
          >
            <Settings className="h-3 w-3 mr-1" />
            Manage
          </Button>
        </div>

        {/* Profile Selector */}
        <div className="space-y-2 mb-4">
          {profiles?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profiles.map((profile: any) => (
                <Button
                  key={profile.id}
                  variant={activeProfile?.id === profile.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchProfile(profile.id)}
                  className="text-xs px-3 py-1.5 h-auto rounded-full"
                >
                  <Baby className="h-3 w-3 mr-1" />
                  {profile.name}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManageProfiles}
                className="text-xs px-3 py-1.5 h-auto rounded-full border border-dashed"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleManageProfiles}
              variant="outline"
              size="sm"
              className="w-full text-xs py-2 rounded-full border-dashed"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Baby Profile
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        {activeProfile && (
          <div className="grid grid-cols-3 gap-2">
            {loading ? (
              <>
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
              </>
            ) : (
              <>
                <div className="bg-muted/50 rounded-xl p-2 text-center">
                  <Clock className="h-3 w-3 mx-auto mb-1 text-primary" />
                  <div className="text-xs font-medium text-foreground">
                    {safeStats?.lastSleep || '0h'}
                  </div>
                  <div className="text-2xs text-muted-foreground">Sleep</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-2 text-center">
                  <Activity className="h-3 w-3 mx-auto mb-1 text-secondary" />
                  <div className="text-xs font-medium text-foreground">
                    {safeStats?.todayActivities || '0'}
                  </div>
                  <div className="text-2xs text-muted-foreground">Today</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-2 text-center">
                  <Heart className="h-3 w-3 mx-auto mb-1 text-accent" />
                  <div className="text-xs font-medium text-foreground">
                    {safeStats?.weekStreak || '0'}
                  </div>
                  <div className="text-2xs text-muted-foreground">Streak</div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};