import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, Baby, Clock, Milk, Moon, Plus, Settings } from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { MobileProfileModal } from './MobileProfileModal';

interface TabletProfileHubProps {
  onAddProfile?: () => void;
  onManageProfiles?: () => void;
  className?: string;
}

export const TabletProfileHub = ({ 
  onAddProfile, 
  onManageProfiles,
  className = "" 
}: TabletProfileHubProps) => {
  const { profiles, activeProfile, switching } = useBabyProfile();
  const { stats, loading: statsLoading } = useDashboardStats();
  const [showModal, setShowModal] = useState(false);

  if (!activeProfile) {
    return (
      <Card className={`bg-white/90 backdrop-blur-sm border border-primary/20 shadow-xl ${className}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Baby className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-foreground mb-2">Create Your First Profile</h3>
            <p className="text-muted-foreground text-sm mb-4">Start tracking your baby's activities</p>
            {onAddProfile && (
              <Button 
                onClick={onAddProfile}
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`bg-white/90 backdrop-blur-sm border border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
        <CardContent className="p-6">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              className="flex items-center space-x-3 p-3 h-auto hover:bg-primary/5 rounded-2xl transition-all duration-300 flex-1 mr-4"
              disabled={switching}
              onClick={() => setShowModal(true)}
            >
              <Avatar className="h-16 w-16 border-4 border-primary/20 shadow-lg">
                <AvatarImage src={activeProfile.photo_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary">
                  <Baby className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-bold text-xl text-foreground truncate">{activeProfile.name}</div>
                <div className="text-sm text-muted-foreground">
                  {profiles.length} profile{profiles.length !== 1 ? 's' : ''} • Active
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            {onManageProfiles && (
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full border-primary/20 hover:bg-primary/5"
                onClick={() => {
                  try {
                    onManageProfiles();
                  } catch (error) {
                    console.error('Error calling onManageProfiles:', error);
                  }
                }}
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl">
              <div className="bg-gradient-to-br from-indigo-200 to-indigo-300 rounded-xl w-10 h-10 flex items-center justify-center mx-auto mb-2">
                <Moon className="h-5 w-5 text-indigo-600" />
              </div>
              {statsLoading ? (
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
              ) : (
                <div className="font-bold text-indigo-600 text-sm">{stats?.weeklyAverageSleep || 'N/A'}</div>
              )}
              <div className="text-xs text-muted-foreground">Sleep</div>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl">
              <div className="bg-gradient-to-br from-green-200 to-green-300 rounded-xl w-10 h-10 flex items-center justify-center mx-auto mb-2">
                <Milk className="h-5 w-5 text-green-600" />
              </div>
              {statsLoading ? (
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
              ) : (
                <div className="font-bold text-green-600 text-sm">{stats?.weeklyFeedings || 'N/A'}</div>
              )}
              <div className="text-xs text-muted-foreground">Feeds</div>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl">
              <div className="bg-gradient-to-br from-amber-200 to-amber-300 rounded-xl w-10 h-10 flex items-center justify-center mx-auto mb-2">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              {statsLoading ? (
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
              ) : (
                <div className="font-bold text-amber-600 text-sm">{stats?.weeklyDiaperChanges || 'N/A'}</div>
              )}
              <div className="text-xs text-muted-foreground">Changes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <MobileProfileModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};