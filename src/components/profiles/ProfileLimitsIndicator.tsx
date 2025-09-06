
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown } from 'lucide-react';

export const ProfileLimitsIndicator = () => {
  const { profiles } = useBabyProfile();
  const { isPremium, loading } = useSubscription();

  const ownedProfiles = profiles.filter(p => !p.is_shared);
  const profileCount = ownedProfiles.length;
  const maxProfiles = isPremium ? '∞' : '1';

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <span>{profileCount}/{maxProfiles} profiles used</span>
      {isPremium && (
        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
          <Crown className="h-3 w-3 mr-1" />
          Premium
        </Badge>
      )}
    </div>
  );
};
