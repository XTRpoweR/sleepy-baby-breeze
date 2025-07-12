
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useBabyMemories } from '@/hooks/useBabyMemories';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Camera, Plus, Crown, Sparkles } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Camera className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground animate-fade-in">Loading photos...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <DesktopHeader />
        <MobileHeader />
        
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mb-4 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <Card className="text-center py-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent>
              <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-fade-in" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Baby Profile Selected</h3>
              <p className="text-muted-foreground mb-6">
                Please select or create a baby profile to start capturing photo memories.
              </p>
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="gradient"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <DesktopHeader />
      <MobileHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gradient mb-2">
                Photo Memories
              </h1>
              <p className="text-muted-foreground">
                Capture and preserve precious moments with {activeProfile.name}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {!isPremium && (
                <div className="flex items-center text-amber-600 text-sm mr-2">
                  <Crown className="h-4 w-4 mr-1" />
                  Premium Feature
                </div>
              )}
              <Button 
                onClick={handleUploadClick}
                variant="gradient"
                disabled={uploading}
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <Plus className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Add Photo'}
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Banner for Basic Users */}
        {!isPremium && (
          <Card className="mb-6 border-2 border-dashed border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/50 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-amber-100 rounded-full p-3">
                    <Crown className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center">
                      Unlock Photo Memories
                      <Sparkles className="h-4 w-4 ml-2 text-amber-500" />
                    </h3>
                    <p className="text-muted-foreground">
                      Capture unlimited photos of your baby's precious moments with Premium
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/subscription')}
                  className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Upgrade to Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {memories.length === 0 ? (
          <Card className="text-center py-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent>
              <div className="mb-6 space-y-4">
                <div className="flex justify-center">
                  <Camera className="h-16 w-16 text-muted-foreground animate-fade-in" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Photos Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start capturing precious moments with {activeProfile.name}. Upload photos to create a beautiful timeline of memories.
              </p>
              <Button 
                onClick={handleUploadClick}
                variant="gradient"
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Photo
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
