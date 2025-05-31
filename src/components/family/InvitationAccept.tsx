
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Heart,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

interface InvitationData {
  id: string;
  baby_id: string;
  email: string;
  role: string;
  status: string;
  invited_by: string;
  expires_at: string;
  baby_name?: string;
  inviter_name?: string;
}

export const InvitationAccept = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!authLoading && token) {
      fetchInvitation();
    }
  }, [token, authLoading]);

  const fetchInvitation = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data: invitationData, error } = await supabase
        .from('family_invitations')
        .select(`
          *,
          baby_profiles!inner(name),
          profiles!family_invitations_invited_by_fkey(full_name)
        `)
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        console.error('Error fetching invitation:', error);
        toast({
          title: "Invalid Invitation",
          description: "This invitation link is invalid or has expired.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setInvitation({
        ...invitationData,
        baby_name: invitationData.baby_profiles.name,
        inviter_name: invitationData.profiles.full_name
      });
    } catch (error) {
      console.error('Error fetching invitation:', error);
      toast({
        title: "Error",
        description: "Failed to load invitation details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!user || !invitation) return;

    setProcessing(true);

    try {
      // Check if user's email matches the invitation
      if (user.email !== invitation.email) {
        toast({
          title: "Email Mismatch",
          description: "This invitation was sent to a different email address. Please sign in with the correct account.",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      // Create family member record
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          baby_id: invitation.baby_id,
          user_id: user.id,
          role: invitation.role,
          status: 'active',
          invited_by: invitation.invited_by,
          invited_at: invitation.created_at,
          joined_at: new Date().toISOString(),
          permissions: invitation.permissions || (invitation.role === 'caregiver' 
            ? { can_edit: true, can_delete: false, can_invite: false }
            : { can_edit: false, can_delete: false, can_invite: false })
        });

      if (memberError) {
        console.error('Error creating family member:', memberError);
        toast({
          title: "Error",
          description: `Failed to accept invitation: ${memberError.message}`,
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('family_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
      }

      toast({
        title: "Welcome to the family!",
        description: `You've successfully joined ${invitation.baby_name}'s family sharing.`,
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "Unexpected error accepting invitation.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const declineInvitation = async () => {
    if (!invitation) return;

    setProcessing(true);

    try {
      const { error } = await supabase
        .from('family_invitations')
        .update({ status: 'declined' })
        .eq('id', invitation.id);

      if (error) {
        console.error('Error declining invitation:', error);
        toast({
          title: "Error",
          description: `Failed to decline invitation: ${error.message}`,
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      toast({
        title: "Invitation declined",
        description: "You have declined the family sharing invitation.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast({
        title: "Error",
        description: "Unexpected error declining invitation.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please sign in to accept this family sharing invitation.
            </p>
            <Button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center space-x-2">
              <XCircle className="h-6 w-6 text-red-600" />
              <span>Invalid Invitation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              This invitation link is invalid, expired, or has already been used.
            </p>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const RoleIcon = invitation.role === 'caregiver' ? Heart : Shield;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span>Family Sharing Invitation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <RoleIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Join {invitation.baby_name}'s Family
            </h2>
            <p className="text-gray-600">
              {invitation.inviter_name} has invited you to join the family sharing for {invitation.baby_name}.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <Badge className={invitation.role === 'caregiver' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                {invitation.role}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Invited by:</span>
              <span className="font-medium">{invitation.inviter_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expires:</span>
              <span className="font-medium">{format(new Date(invitation.expires_at), 'MMM dd, yyyy')}</span>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <h4 className="font-medium mb-2">As a {invitation.role}, you'll be able to:</h4>
            <ul className="space-y-1">
              {invitation.role === 'caregiver' ? (
                <>
                  <li>• Track baby activities and add new entries</li>
                  <li>• View reports and analytics</li>
                  <li>• Edit existing activity logs</li>
                </>
              ) : (
                <>
                  <li>• View baby activities and reports</li>
                  <li>• See analytics and insights</li>
                </>
              )}
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={acceptInvitation}
              disabled={processing}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {processing ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Accept
            </Button>
            <Button
              onClick={declineInvitation}
              disabled={processing}
              variant="outline"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
