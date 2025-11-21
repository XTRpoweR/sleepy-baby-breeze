
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useToast } from '@/hooks/use-toast';
import { EmailVerificationDialog } from './EmailVerificationDialog';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Heart,
  Shield,
  Eye,
  AlertTriangle,
  LogIn,
  Mail
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
  email_verified?: boolean;
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

export const InvitationAccept = () => {
  const { user, loading: authLoading } = useAuth();
  const { setSharedBabyAsActive, refetch: refetchProfiles } = useBabyProfile();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [alreadyAccepted, setAlreadyAccepted] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

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

  const normalizeEmail = (email: string) => {
    return email.trim().toLowerCase();
  };

  const fetchInvitation = async () => {
    if (!token) {
      console.log('No token provided');
      setLoading(false);
      return;
    }

    console.log('Fetching invitation with token:', token);
    console.log('Current user:', user ? `${user.email} (authenticated)` : 'Anonymous');

    try {
      // First try to get pending invitation
      let { data: invitationData, error: invitationError } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      console.log('Pending invitation query result:', { invitationData, invitationError });

      // If no pending invitation found, check for accepted one
      if (!invitationData && !invitationError) {
        console.log('No pending invitation, checking for accepted invitation...');
        const { data: acceptedInvitation, error: acceptedError } = await supabase
          .from('family_invitations')
          .select('*')
          .eq('invitation_token', token)
          .eq('status', 'accepted')
          .maybeSingle();

        console.log('Accepted invitation query result:', { acceptedInvitation, acceptedError });

        if (acceptedInvitation && !acceptedError) {
          setAlreadyAccepted(true);
          invitationData = acceptedInvitation;
        }
      }

      // If we have an error, it might be RLS related
      if (invitationError) {
        console.error('Error fetching invitation:', invitationError);
        
        // If user is authenticated but getting permission denied, this might be an RLS issue
        if (user && invitationError.code === 'PGRST116') {
          console.log('RLS policy might be blocking access. User is authenticated but not a baby owner.');
          toast({
            title: "Permission Error",
            description: "There was an issue accessing the invitation. This might be a temporary issue - please try refreshing the page.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to load invitation details.",
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }

      if (!invitationData) {
        console.log('No valid invitation found for token');
        setLoading(false);
        return;
      }

      console.log('Found invitation:', invitationData);

      // Fetch baby and inviter details
      const { data: babyData, error: babyError } = await supabase
        .from('baby_profiles')
        .select('name')
        .eq('id', invitationData.baby_id)
        .maybeSingle();

      const { data: inviterData, error: inviterError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', invitationData.invited_by)
        .maybeSingle();

      if (babyError) {
        console.error('Error fetching baby profile:', babyError);
      }

      if (inviterError) {
        console.error('Error fetching inviter profile:', inviterError);
      }

      setInvitation({
        ...invitationData,
        baby_name: babyData?.name || 'Baby',
        inviter_name: inviterData?.full_name || 'Someone'
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

  const handleAcceptInvitation = async () => {
    if (!invitation) return;

    if (alreadyAccepted) {
      if (!user) {
        navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search + '&success=true')}`);
        return;
      } else {
        navigate('/dashboard');
        return;
      }
    }

    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    const invitedEmail = normalizeEmail(invitation.email);
    const userEmail = normalizeEmail(user.email || '');
    
    if (invitedEmail !== userEmail && !invitation.email_verified) {
      setShowVerificationDialog(true);
      return;
    }

    await proceedWithAcceptance();
  };

  const proceedWithAcceptance = async () => {
    if (!invitation || !user) return;

    setProcessing(true);
    console.log('Proceeding with invitation acceptance for user:', user.email);

    try {
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

      console.log('Family member created successfully');

      // Update invitation status
      const { error: updateError } = await supabase
        .from('family_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Error updating invitation status:', updateError);
        // Don't fail the whole process if this update fails
      }

      // Send notification email to the inviter
      try {
        console.log('Sending acceptance notification email');
        
        // Fetch user profile to get full name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        const { error: emailError } = await supabase.functions.invoke('send-invitation-status-email', {
          body: {
            invitationId: invitation.id,
            status: 'accepted',
            acceptedByEmail: user.email,
            acceptedByName: profile?.full_name || user.email
          }
        });

        if (emailError) {
          console.error('Error sending notification email:', emailError);
          // Don't fail the process if email fails
        } else {
          console.log('Notification email sent successfully');
        }
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Continue anyway - email is not critical
      }

      // Refresh profiles and set as active
      await refetchProfiles();
      setSharedBabyAsActive(invitation.baby_id);

      // Clear any cached family data to ensure fresh data is loaded
      // This helps with the name display issue
      localStorage.removeItem(`family_members_${invitation.baby_id}`);
      
      toast({
        title: "Welcome to the family!",
        description: `You've successfully joined ${invitation.baby_name}'s family sharing as a ${invitation.role}.`,
      });

      // Add a small delay to ensure data is properly refreshed
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

  const handleEmailVerified = async () => {
    setShowVerificationDialog(false);
    await fetchInvitation();
    await proceedWithAcceptance();
  };

  const declineInvitation = async () => {
    if (!invitation || alreadyAccepted) return;

    setProcessing(true);
    console.log('Declining invitation:', invitation.id);

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

      // Send notification email to the inviter
      try {
        console.log('Sending decline notification email');
        
        // Fetch user profile if user exists
        let acceptedByEmail = invitation.email;
        let acceptedByName = invitation.email;
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            acceptedByEmail = profile.email || user.email || invitation.email;
            acceptedByName = profile.full_name || profile.email || user.email || invitation.email;
          }
        }

        const { error: emailError } = await supabase.functions.invoke('send-invitation-status-email', {
          body: {
            invitationId: invitation.id,
            status: 'declined',
            acceptedByEmail,
            acceptedByName
          }
        });

        if (emailError) {
          console.error('Error sending notification email:', emailError);
        } else {
          console.log('Notification email sent successfully');
        }
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
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
  const showEmailMismatch = user && invitedEmail !== userEmail && !invitation.email_verified;

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
              onClick={handleAcceptInvitation}
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

          {showEmailMismatch && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Mail className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Different Email Address</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    This invitation was sent to <strong>{invitation.email}</strong> but you're signed in as <strong>{user?.email}</strong>.
                  </p>
                  <p className="text-sm text-amber-700 mt-2">
                    You can still accept this invitation by verifying access to the invited email address.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Invited to:</span>
              <span className="font-medium">{invitation.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <Badge className={invitation.role === 'caregiver' ? 'bg-blue-100 text-blue-800' : invitation.role === 'viewer' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}>
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

          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <LogIn className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Sign In Required</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    To accept this invitation, you'll need to sign in or create an account.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={handleAcceptInvitation}
              disabled={processing}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {processing ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : user ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <LogIn className="h-4 w-4 mr-2" />
              )}
              {user ? (showEmailMismatch ? 'Verify & Accept' : 'Accept') : 'Sign In & Accept'}
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

      <EmailVerificationDialog
        isOpen={showVerificationDialog}
        onClose={() => setShowVerificationDialog(false)}
        onVerified={handleEmailVerified}
        invitedEmail={invitation.email}
        invitationToken={token || ''}
      />
    </div>
  );
};
