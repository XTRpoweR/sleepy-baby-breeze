
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Baby, Calendar, Edit, Plus, Trash2 } from 'lucide-react';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { PhotoUpload } from '@/components/ui/photo-upload';

interface BabyProfile {
  id: string;
  name: string;
  birth_date: string | null;
  photo_url: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

interface ProfileManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileManagementDialog = ({ isOpen, onClose }: ProfileManagementDialogProps) => {
  const { profiles, createProfile, updateProfile, deleteProfile } = useBabyProfile();
  const [activeTab, setActiveTab] = useState('profiles');
  const [editingProfile, setEditingProfile] = useState<BabyProfile | null>(null);
  const [deleteConfirmProfile, setDeleteConfirmProfile] = useState<BabyProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    photo_url: null as string | null
  });

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return 'Age not set';
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                       (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} months old`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years} years ${months} months old` : `${years} years old`;
    }
  };

  const handleAddProfile = () => {
    setEditingProfile(null);
    setFormData({ name: '', birth_date: '', photo_url: null });
    setActiveTab('add');
  };

  const handleEditProfile = (profile: BabyProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      birth_date: profile.birth_date || '',
      photo_url: profile.photo_url
    });
    setActiveTab('add');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    let success = false;
    if (editingProfile) {
      success = await updateProfile(editingProfile.id, {
        name: formData.name.trim(),
        birth_date: formData.birth_date || null,
        photo_url: formData.photo_url
      });
    } else {
      success = await createProfile({
        name: formData.name.trim(),
        birth_date: formData.birth_date || undefined,
        photo_url: formData.photo_url || undefined
      });
    }

    if (success) {
      setFormData({ name: '', birth_date: '', photo_url: null });
      setEditingProfile(null);
      setActiveTab('profiles');
    }
  };

  const handleDeleteProfile = async () => {
    if (!deleteConfirmProfile) return;
    
    const success = await deleteProfile(deleteConfirmProfile.id);
    if (success) {
      setDeleteConfirmProfile(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Baby className="h-5 w-5" />
              <span>Manage Child Profiles</span>
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profiles">All Profiles</TabsTrigger>
              <TabsTrigger value="add">
                {editingProfile ? 'Edit Profile' : 'Add Profile'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profiles" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Child Profiles ({profiles.length})</h3>
                <Button onClick={handleAddProfile} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>

              {profiles.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-8 text-center">
                    <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No Profiles Yet</h3>
                    <p className="text-gray-600 mb-4">Create your first child profile to get started</p>
                    <Button onClick={handleAddProfile}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Profile
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {profiles.map((profile) => (
                    <Card key={profile.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={profile.photo_url || undefined} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                              {profile.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-lg">{profile.name}</h4>
                              {profile.is_active && (
                                <Badge variant="secondary">Active</Badge>
                              )}
                            </div>
                            <p className="text-gray-600">{calculateAge(profile.birth_date)}</p>
                            <p className="text-sm text-gray-500">
                              Created {new Date(profile.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProfile(profile)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {profiles.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteConfirmProfile(profile)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="add">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Baby className="h-5 w-5" />
                    <span>{editingProfile ? 'Edit Profile' : 'Add New Profile'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Child's Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter child's name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="birthDate" className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Birth Date (Optional)</span>
                      </Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">Photo (Optional)</Label>
                      <PhotoUpload
                        value={formData.photo_url || undefined}
                        onChange={(url) => setFormData(prev => ({ ...prev, photo_url: url }))}
                        fallbackText={formData.name.charAt(0).toUpperCase() || 'B'}
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingProfile ? 'Update Profile' : 'Create Profile'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setActiveTab('profiles');
                          setEditingProfile(null);
                          setFormData({ name: '', birth_date: '', photo_url: null });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmProfile} onOpenChange={() => setDeleteConfirmProfile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteConfirmProfile?.name}'s profile? 
              This will permanently delete all associated sleep and feeding records. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProfile}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </Dialog>
    </>
  );
};
