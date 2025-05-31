
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Moon, 
  ArrowLeft,
  Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { FamilySharing as FamilySharingComponent } from '@/components/family/FamilySharing';
import { BabyProfileSetup } from '@/components/tracking/BabyProfileSetup';

const FamilySharing = () => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, createProfile } = useBabyProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Moon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Family Sharing</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!profile ? (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Set Up Baby Profile First</h1>
            <p className="text-gray-600 mb-8">
              You need to create a baby profile before you can share access with family members.
            </p>
            <BabyProfileSetup onProfileCreated={createProfile} />
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Family Sharing for {profile.name}
              </h1>
              <p className="text-gray-600">
                Invite family members and caregivers to help track {profile.name}'s activities and view reports.
              </p>
            </div>

            <FamilySharingComponent babyId={profile.id} />
          </div>
        )}
      </main>
    </div>
  );
};

export default FamilySharing;
