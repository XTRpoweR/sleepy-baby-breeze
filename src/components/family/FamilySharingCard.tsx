
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Wifi } from 'lucide-react';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useAuth } from '@/hooks/useAuth';
import { InviteFamilyDialog } from './InviteFamilyDialog';
import { FamilyMembersList } from './FamilyMembersList';

interface FamilySharingCardProps {
  babyId: string;
}

export const FamilySharingCard = ({ babyId }: FamilySharingCardProps) => {
  const { user } = useAuth();
  const {
    members,
    invitations,
    loading,
    inviteMember,
    removeMember,
    cancelInvitation,
    updateMemberRole
  } = useFamilyMembers(babyId);

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
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isOwner = members.find(m => m.user_id === user?.id)?.role === 'owner';
  const activeMembersCount = members.filter(m => m.status === 'accepted').length;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Family Sharing</span>
            </CardTitle>
            {isOwner && <InviteFamilyDialog onInvite={inviteMember} />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Wifi className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-blue-900">Real-time Sync Enabled</div>
                <div className="text-sm text-blue-700">
                  All family members see updates instantly across their devices
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">{activeMembersCount}</div>
              <div className="text-sm text-blue-700">Active Members</div>
            </div>
          </div>

          {!isOwner && activeMembersCount === 1 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
              <UserPlus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                You're the only family member. Ask the baby's owner to invite others to start sharing!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Members List */}
      <FamilyMembersList
        members={members}
        invitations={invitations}
        currentUserId={user?.id || ''}
        onRemoveMember={removeMember}
        onCancelInvitation={cancelInvitation}
        onUpdateRole={updateMemberRole}
      />
    </div>
  );
};
