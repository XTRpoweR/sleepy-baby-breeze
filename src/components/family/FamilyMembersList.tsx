
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Users, Crown, Edit3, Trash2, Clock, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface FamilyMember {
  id: string;
  user_id: string;
  role: 'owner' | 'caregiver' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  invited_at: string;
  joined_at: string | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

interface FamilyInvitation {
  id: string;
  email: string;
  role: 'caregiver' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
}

interface FamilyMembersListProps {
  members: FamilyMember[];
  invitations: FamilyInvitation[];
  currentUserId: string;
  onRemoveMember: (memberId: string) => Promise<boolean>;
  onCancelInvitation: (invitationId: string) => Promise<boolean>;
  onUpdateRole: (memberId: string, role: 'caregiver' | 'viewer') => Promise<boolean>;
}

export const FamilyMembersList = ({ 
  members, 
  invitations, 
  currentUserId, 
  onRemoveMember, 
  onCancelInvitation,
  onUpdateRole 
}: FamilyMembersListProps) => {
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const handleRoleUpdate = async (memberId: string, newRole: 'caregiver' | 'viewer') => {
    setUpdatingRole(memberId);
    await onUpdateRole(memberId, newRole);
    setUpdatingRole(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'caregiver': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isOwner = members.find(m => m.user_id === currentUserId)?.role === 'owner';

  return (
    <div className="space-y-6">
      {/* Active Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Family Members ({members.filter(m => m.status === 'accepted').length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.filter(m => m.status === 'accepted').map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {getInitials(member.profiles?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {member.profiles?.full_name || member.profiles?.email || 'Unknown User'}
                    </span>
                    {member.role === 'owner' && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {member.profiles?.email}
                  </div>
                  <div className="text-xs text-gray-400">
                    Joined {format(new Date(member.joined_at || member.invited_at), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className={getRoleBadgeColor(member.role)}>
                  {member.role}
                </Badge>
                
                {isOwner && member.role !== 'owner' && member.user_id !== currentUserId && (
                  <div className="flex items-center space-x-2">
                    <Select
                      value={member.role}
                      onValueChange={(value: 'caregiver' | 'viewer') => handleRoleUpdate(member.id, value)}
                      disabled={updatingRole === member.id}
                    >
                      <SelectTrigger className="w-auto">
                        <Edit3 className="h-3 w-3" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="caregiver">Caregiver</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>

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
                            Are you sure you want to remove {member.profiles?.full_name || member.profiles?.email} from your baby's family? They will lose access to all baby data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onRemoveMember(member.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {members.filter(m => m.status === 'accepted').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No family members yet. Invite someone to start sharing!
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
          <CardContent className="space-y-4">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 rounded-full p-2">
                    <Mail className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium">{invitation.email}</div>
                    <div className="text-sm text-gray-500">
                      Invited as {invitation.role} • {format(new Date(invitation.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  {isOwner && (
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
                          <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onCancelInvitation(invitation.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Cancel Invitation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
