
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useProfilePermissions } from '@/hooks/useProfilePermissions';
import { InvitationManagement } from './InvitationManagement';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Trash2, 
  Shield, 
  Heart, 
  Eye,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface FamilySharingEnhancedProps {
  babyId: string;
}

const ROLE_ICONS = {
  owner: Shield,
  caregiver: Heart,
  viewer: Eye
};

export const FamilySharingEnhanced = ({ babyId }: FamilySharingEnhancedProps) => {
  const { toast } = useToast();
  const { role, permissions } = useProfilePermissions(babyId);
  const {
    members,
    invitations,
    loading,
    inviteFamilyMember,
    removeFamilyMember,
    cancelInvitation,
    refetch
  } = useFamilyMembers(babyId);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('caregiver');
  const [isInviting, setIsInviting] = useState(false);
  const [showManualShare, setShowManualShare] = useState(false);
  const [lastInvitationToken, setLastInvitationToken] = useState<string | null>(null);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address to send the invitation.",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    
    try {
      const success = await inviteFamilyMember(inviteEmail.trim(), inviteRole);
      
      if (success) {
        setInviteEmail('');
        setInviteRole('caregiver');
        toast({
          title: "Invitation sent!",
          description: `Family invitation sent to ${inviteEmail}. If email delivery fails, you can share the invitation link manually.`,
        });
        // Refresh to get the new invitation
        await refetch();
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      setShowManualShare(true);
      toast({
        title: "Email delivery failed",
        description: "The invitation was created but email couldn't be sent. You can share the invitation link manually below.",
        variant: "default",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail?: string) => {
    const success = await removeFamilyMember(memberId);
    if (success) {
      toast({
        title: "Member removed",
        description: `${memberEmail || 'Family member'} has been removed from the family sharing.`,
      });
    }
  };

  const handleResendInvitation = async (invitationId: string): Promise<boolean> => {
    try {
      // Find the invitation to resend
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) return false;

      const success = await inviteFamilyMember(invitation.email, invitation.role);
      return success;
    } catch (error) {
      console.error('Error resending invitation:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading family members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Family Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Family Members</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No family members yet. Invite someone to get started!</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const RoleIcon = ROLE_ICONS[member.role as keyof typeof ROLE_ICONS] || Eye;
                const isCurrentUser = member.user_id === member.user_id; // This would need actual auth context
                
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <RoleIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">
                          {member.full_name || member.email || 'Unknown User'}
                          {isCurrentUser && <span className="text-sm text-gray-500 ml-2">(You)</span>}
                        </p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      {permissions.canDelete && member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id, member.email)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite New Member */}
      {permissions.canInvite && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Invite Family Member</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={isInviting}
                  />
                </div>
                <Select value={inviteRole} onValueChange={setInviteRole} disabled={isInviting}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caregiver">Caregiver</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Caregiver:</strong> Can track activities, view reports, and edit logs</p>
                <p><strong>Viewer:</strong> Can view activities and reports (read-only access)</p>
              </div>
              
              <Button 
                onClick={handleInvite} 
                disabled={isInviting || !inviteEmail.trim()}
                className="w-full md:w-auto"
              >
                {isInviting ? (
                  <>
                    <Mail className="h-4 w-4 mr-2 animate-spin" />
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations Management */}
      {permissions.canInvite && invitations.length > 0 && (
        <InvitationManagement
          invitations={invitations}
          onCancelInvitation={cancelInvitation}
          onResendInvitation={handleResendInvitation}
        />
      )}

      {/* Role-based Access Notice */}
      {role === 'viewer' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Viewer Access</h4>
                <p className="text-sm text-blue-700 mt-1">
                  You have view-only access to this family's information. You can see who has access but cannot invite new members or manage family settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
