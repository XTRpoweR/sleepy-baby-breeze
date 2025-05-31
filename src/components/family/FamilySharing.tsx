
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
import { 
  Users, 
  UserPlus, 
  Mail, 
  Trash2, 
  Clock,
  Crown,
  Heart,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

interface FamilySharingProps {
  babyId: string;
}

const ROLE_ICONS = {
  owner: Crown,
  caregiver: Heart,
  viewer: Shield
};

const ROLE_COLORS = {
  owner: 'bg-yellow-100 text-yellow-800',
  caregiver: 'bg-blue-100 text-blue-800',
  viewer: 'bg-gray-100 text-gray-800'
};

export const FamilySharing = ({ babyId }: FamilySharingProps) => {
  const { members, invitations, loading, inviteFamilyMember, removeFamilyMember, cancelInvitation } = useFamilyMembers(babyId);
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Family Sharing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading family members...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invite New Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Invite Family Member</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caregiver">Caregiver - Can track activities and view reports</SelectItem>
                  <SelectItem value="viewer">Viewer - Can only view activities and reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              disabled={!email.trim() || isInviting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isInviting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Current Family Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Family Members ({members.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No family members yet.</p>
              <p className="text-sm text-gray-500">Invite family members to share baby tracking.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => {
                const RoleIcon = ROLE_ICONS[member.role as keyof typeof ROLE_ICONS];
                return (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center">
                        <RoleIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{member.full_name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        {member.joined_at && (
                          <p className="text-xs text-gray-500">
                            Joined {format(new Date(member.joined_at), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={ROLE_COLORS[member.role as keyof typeof ROLE_COLORS]}>
                        {member.role}
                      </Badge>
                      {member.role !== 'owner' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Family Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.full_name || member.email} from family sharing? 
                                They will no longer be able to access baby activities.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeFamilyMember(member.id)}
                                className="bg-red-600 hover:bg-red-700"
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Invitations ({invitations.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-100 rounded-full w-10 h-10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-gray-600">
                        Expires {format(new Date(invitation.expires_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {invitation.role}
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel the invitation to {invitation.email}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => cancelInvitation(invitation.id)}
                            className="bg-red-600 hover:bg-red-700"
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
