import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { InvitationLink } from './InvitationLink';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Trash2, 
  Clock,
  Crown,
  Heart,
  Shield,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { useProfilePermissions } from '@/hooks/useProfilePermissions';

interface FamilySharingProps {
  babyId: string;
}

const ROLE_ICONS = {
  owner: Crown,
  caregiver: Heart,
  viewer: Eye
};

const ROLE_COLORS = {
  owner: 'bg-yellow-100 text-yellow-800',
  caregiver: 'bg-blue-100 text-blue-800',
  viewer: 'bg-gray-100 text-gray-800'
};

export const FamilySharing = ({ babyId }: FamilySharingProps) => {
  const { members, invitations, loading, inviteFamilyMember, removeFamilyMember, cancelInvitation } = useFamilyMembers(babyId);
  const { permissions } = useProfilePermissions(babyId);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('caregiver');
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsInviting(true);
    const success = await inviteFamilyMember(email.trim(), role);
    if (success) {
      setEmail('');
      setRole('caregiver');
    }
    setIsInviting(false);
  };

  if (loading) {
    return (
      <Card className="mx-2 sm:mx-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Family Sharing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Loading family members...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Invite New Member */}
      {permissions.canInvite && 
      <Card className="mx-2 sm:mx-0 shadow-sm">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <span>Invite Family Member</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <form onSubmit={handleInvite} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="h-11 sm:h-12 text-sm sm:text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm sm:text-base font-medium">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-11 sm:h-12 text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="caregiver" className="text-sm sm:text-base py-3">
                    Caregiver - Can track activities and view reports
                  </SelectItem>
                  <SelectItem value="viewer" className="text-sm sm:text-base py-3">
                    Viewer - Can only view activities and reports
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              disabled={!email.trim() || isInviting}
              className="w-full h-11 sm:h-12 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base font-medium touch-target"
            >
              {isInviting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </form>
        </CardContent>
      </Card>
      }
      {/* Invitation Links */}
      <div className="mx-2 sm:mx-0">
        <InvitationLink invitations={invitations} />
      </div>

      {/* Current Family Members */}
      <Card className="mx-2 sm:mx-0 shadow-sm">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <span>Family Members ({members.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-600 text-sm sm:text-base mb-1">No family members yet.</p>
              <p className="text-xs sm:text-sm text-gray-500">Invite family members to share baby tracking.</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {members.map((member) => {
                const RoleIcon = ROLE_ICONS[member.role as keyof typeof ROLE_ICONS];
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-white">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="bg-blue-100 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
                        <RoleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {member.full_name || 'Unknown User'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{member.email}</p>
                        {member.joined_at && (
                          <p className="text-xs text-gray-500 hidden sm:block">
                            Joined {format(new Date(member.joined_at), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Badge className={`text-xs ${ROLE_COLORS[member.role as keyof typeof ROLE_COLORS]} px-2 py-1`}>
                        {member.role}
                      </Badge>
                      {member.role !== 'owner' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 p-1 h-8 w-8 touch-target">
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="mx-4 max-w-sm sm:max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-base sm:text-lg">Remove Family Member</AlertDialogTitle>
                              <AlertDialogDescription className="text-sm sm:text-base">
                                Are you sure you want to remove {member.full_name || member.email} from family sharing? 
                                They will no longer be able to access baby activities.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                              <AlertDialogCancel className="touch-target">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeFamilyMember(member.id)}
                                className="bg-red-600 hover:bg-red-700 touch-target"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="mx-2 sm:mx-0 shadow-sm">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              <span>Pending Invitations ({invitations.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="bg-yellow-100 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{invitation.email}</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Expires {format(new Date(invitation.expires_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Badge className={`text-xs px-2 py-1 ${invitation.role === 'caregiver' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {invitation.role}
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 p-1 h-8 w-8 touch-target">
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-4 max-w-sm sm:max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-base sm:text-lg">Cancel Invitation</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm sm:text-base">
                            Are you sure you want to cancel the invitation to {invitation.email}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="touch-target">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => cancelInvitation(invitation.id)}
                            className="bg-red-600 hover:bg-red-700 touch-target"
                          >
                            Cancel Invitation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
