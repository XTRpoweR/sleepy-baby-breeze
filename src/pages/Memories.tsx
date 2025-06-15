
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useBabyMemories } from '@/hooks/useBabyMemories';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Camera, Video, Plus, Crown } from 'lucide-react';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { UploadMemoryDialog } from '@/components/memories/UploadMemoryDialog';
import { MemoryGrid } from '@/components/memories/MemoryGrid';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';

const Memories = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { activeProfile } = useBabyProfile();
  const { isPremium } = useSubscription();
  const { memories, loading, uploading, uploadMemory, deleteMemory, updateMemory } = useBabyMemories(activeProfile?.id);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Camera className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading memories...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleUploadClick = () => {
    if (!isPremium) {
      setShowUpgradePrompt(true);
      return;
    }
    setShowUploadDialog(true);
  };

  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <DesktopHeader />
        <MobileHeader />
        
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Baby Profile Selected</h3>
              <p className="text-gray-600 mb-6">
                Please select or create a baby profile to start capturing memories.
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <DesktopHeader />
      <MobileHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Photo & Video Memories
              </h1>
              <p className="text-gray-600">
                Capture and preserve precious moments with {activeProfile.name}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {!isPremium && (
                <div className="flex items-center text-orange-600 text-sm mr-2">
                  <Crown className="h-4 w-4 mr-1" />
                  Premium Feature
                </div>
              )}
              <Button 
                onClick={handleUploadClick}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={uploading}
              >
                <Plus className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Add Memory'}
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Banner for Basic Users */}
        {!isPremium && (
          <Card className="mb-6 border-2 border-dashed border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 rounded-full p-3">
                    <Crown className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Unlock Photo & Video Memories
                    </h3>
                    <p className="text-gray-600">
                      Capture unlimited photos and videos of your baby's precious moments with Premium
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/subscription')}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Upgrade to Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {memories.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mb-6">
                <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <Video className="h-12 w-12 text-gray-300 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Memories Yet</h3>
              <p className="text-gray-600 mb-6">
                Start capturing precious moments with {activeProfile.name}. Upload photos and videos to create a beautiful timeline of memories.
              </p>
              <Button 
                onClick={handleUploadClick}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Memory
              </Button>
            </CardContent>
          </Card>
        ) : (
          <MemoryGrid 
            memories={memories}
            onDelete={deleteMemory}
            onUpdate={updateMemory}
            canEdit={isPremium}
          />
        )}
      </main>

      {/* Upload Dialog */}
      <UploadMemoryDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUpload={uploadMemory}
        babyName={activeProfile.name}
      />

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="memories"
      />
    </div>
  );
};

export default Memories;
