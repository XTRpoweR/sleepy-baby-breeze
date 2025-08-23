import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useToast } from '@/hooks/use-toast';
import { normalizeEmail } from '@/utils/familyUtils';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Heart,
  Shield,
  Eye,
  LogIn,
  Mail,
  AlertTriangle
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
  created_at: string;
  permissions: any;
  invitation_token: string;
  baby_name?: string;
  inviter_name?: string;
}

const ROLE_ICONS = {
  owner: Shield,
  caregiver: Heart,
  viewer: Eye
};

const ROLE_PERMISSIONS = {
  caregiver: [
    'Track baby activities and add new entries',
    'View reports and analytics',
    'Edit existing activity logs'
  ],
  viewer: [
    'View baby activities and reports',
    'See analytics and insights',
    'Access read-only dashboard'
  ]
};

export const DirectInvitationAccept = () => {
  const { user, loading: authLoading } = useAuth();
  const { setSharedBabyAsActive, refetch: refetchProfiles } = useBabyProfile();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [alreadyAccepted, setAlreadyAccepted] = useState(false);

  const token = searchParams.get('token');
  const success = searchParams.get('success');

  useEffect(() => {
    if (success === 'true') {
      toast({
        title: "Welcome to the family!",
        description: "You've successfully joined the family sharing.",
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      return;
    }

    if (token) {
      fetchInvitation();
    } else {
      setLoading(false);
    }
  }, [token, success, navigate, toast]);

  const fetchInvitation = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    console.log('Fetching invitation with token:', token);

    try {
      // First try to get pending invitation
      let { data: invitationData, error: invitationError } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      // If no pending invitation, check for accepted one
      if (!invitationData && !invitationError) {
        const { data: acceptedInvitation, error: acceptedError } = await supabase
          .from('family_invitations')
          .select('*')
          .eq('invitation_token', token)
          .eq('status', 'accepted')
          .maybeSingle();

        if (acceptedInvitation && !acceptedError) {
          setAlreadyAccepted(true);
          invitationData = acceptedInvitation;
        }
      }

      if (invitationError) {
        console.error('Error fetching invitation:', invitationError);
        toast({
          title: "Error",
          description: "Failed to load invitation details.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!invitationData) {
        console.log('No valid invitation found for token');
        setLoading(false);
        return;
      }

      // Get baby and inviter names with separate queries
      const [babyResult, inviterResult] = await Promise.all([
        supabase
          .from('baby_profiles')
          .select('name')
          .eq('id', invitationData.baby_id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', invitationData.invited_by)
          .maybeSingle()
      ]);

      setInvitation({
        ...invitationData,
        baby_name: babyResult.data?.name || 'Baby',
        inviter_name: inviterResult.data?.full_name || 'Someone'
      });
    } catch (error) {
      console.error('Unexpected error fetching invitation:', error);
      toast({
        title: "Error",
        description: "Failed to load invitation details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectAccept = async () => {
    if (!invitation || !user) return;

    if (alreadyAccepted) {
      navigate('/dashboard');
      return;
    }

    const invitedEmail = normalizeEmail(invitation.email);
    const userEmail = normalizeEmail(user.email || '');

    // Check if emails match for direct acceptance
    if (invitedEmail !== userEmail) {
      toast({
        title: "Email mismatch",
        description: `This invitation was sent to ${invitation.email} but you're signed in as ${user.email}. Please sign in with the correct email or contact the sender.`,
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    console.log('Direct acceptance for matching email:', user.email);

    try {
      // Create family member record first
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

      console.log('Successfully created family member');

      // Update invitation status with improved error handling
      const { error: updateError } = await supabase
        .from('family_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Error updating invitation status:', updateError);
        // Don't fail the whole process, just log the issue
        toast({
          title: "Warning",
          description: "You've joined the family successfully, but there may be a display issue with the invitation status.",
          variant: "default",
        });
      } else {
        console.log('Successfully updated invitation status to accepted');
      }

      // Refresh profiles and set as active
      await refetchProfiles();
      setSharedBabyAsActive(invitation.baby_id);

      toast({
        title: "Welcome to the family!",
        description: `You've successfully joined ${invitation.baby_name}'s family sharing as a ${invitation.role}.`,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
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

  const handleSignInAndAccept = () => {
    navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
  };

  const declineInvitation = async () => {
    if (!invitation || alreadyAccepted) return;

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
        return;
      }

      toast({
        title: "Invitation declined",
        description: "You have declined the family sharing invitation.",
      });

      navigate('/');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (success === 'true') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>Welcome to the Family!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You've successfully joined the family sharing. Redirecting to your dashboard...
            </p>
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
            <Button onClick={() => navigate('/')} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const RoleIcon = ROLE_ICONS[invitation.role as keyof typeof ROLE_ICONS] || Shield;
  const permissions = ROLE_PERMISSIONS[invitation.role as keyof typeof ROLE_PERMISSIONS] || [];

  const invitedEmail = normalizeEmail(invitation.email);
  const userEmail = normalizeEmail(user?.email || '');
  const emailsMatch = user && invitedEmail === userEmail;

  if (alreadyAccepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>Invitation Already Accepted</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              This invitation has already been accepted. 
              {user ? " You can access the family dashboard now." : " Please sign in to access the family dashboard."}
            </p>
            <Button 
              onClick={user ? handleDirectAccept : handleSignInAndAccept}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {user ? 'Go to Dashboard' : 'Sign In'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

          {!user && (
            <Alert>
              <LogIn className="h-4 w-4" />
              <AlertDescription>
                You need to sign in or create an account to accept this invitation.
              </AlertDescription>
            </Alert>
          )}

          {user && !emailsMatch && (
            <Alert variant="destructive">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                This invitation was sent to <strong>{invitation.email}</strong> but you're signed in as <strong>{user.email}</strong>. 
                Please sign in with the correct email address to accept this invitation.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Invited to:</span>
              <span className="font-medium">{invitation.email}</span>
            </div>
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

          {permissions.length > 0 && (
            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">As a {invitation.role}, you'll be able to:</h4>
              <ul className="space-y-1">
                {permissions.map((permission, index) => (
                  <li key={index}>• {permission}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={user && emailsMatch ? handleDirectAccept : handleSignInAndAccept}
              disabled={processing}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {processing ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : user && emailsMatch ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <LogIn className="h-4 w-4 mr-2" />
              )}
              {user && emailsMatch ? 'Accept Invitation' : 'Sign In & Accept'}
            </Button>
            <Button
              onClick={declineInvitation}
              disabled={processing || alreadyAccepted}
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
