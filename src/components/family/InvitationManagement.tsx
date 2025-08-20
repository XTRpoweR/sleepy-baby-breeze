
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FamilyInvitation } from '@/types/familyMembers';
import { 
  Copy, 
  Mail, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

interface InvitationManagementProps {
  invitations: FamilyInvitation[];
  onCancelInvitation: (invitationId: string) => Promise<boolean>;
  onResendInvitation?: (invitationId: string) => Promise<boolean>;
}

export const InvitationManagement = ({ 
  invitations, 
  onCancelInvitation,
  onResendInvitation 
}: InvitationManagementProps) => {
  const { toast } = useToast();
  const [selectedInvitation, setSelectedInvitation] = useState<FamilyInvitation | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const getInvitationLink = (invitation: FamilyInvitation) => {
    return `${window.location.origin}/invitation/accept?token=${invitation.invitation_token}`;
  };

  const copyInvitationLink = async (invitation: FamilyInvitation) => {
    const link = getInvitationLink(invitation);
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link copied!",
        description: "Invitation link has been copied to clipboard. You can share it manually.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually from the dialog.",
        variant: "destructive",
      });
      setSelectedInvitation(invitation);
      setShowLinkDialog(true);
    }
  };

  const handleCancel = async (invitationId: string) => {
    const success = await onCancelInvitation(invitationId);
    if (success) {
      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled successfully.",
      });
    }
  };

  const handleResend = async (invitationId: string) => {
    if (onResendInvitation) {
      const success = await onResendInvitation(invitationId);
      if (success) {
        toast({
          title: "Invitation resent",
          description: "The invitation has been sent again.",
        });
      }
    }
  };

  const getStatusIcon = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (isExpired) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'declined':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (isExpired) return 'destructive';
    
    switch (status) {
      case 'pending':
        return 'default';
      case 'accepted':
        return 'default';
      case 'declined':
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-600 text-center">No pending invitations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invitations.map((invitation) => {
              const isExpired = new Date(invitation.expires_at) < new Date();
              const canResend = isExpired || invitation.status === 'pending';
              
              return (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(invitation.status, invitation.expires_at)}
                      <span className="font-medium">{invitation.email}</span>
                      <Badge variant={getStatusColor(invitation.status, invitation.expires_at)}>
                        {isExpired ? 'Expired' : invitation.status}
                      </Badge>
                      <Badge variant="outline">{invitation.role}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Invited: {format(new Date(invitation.created_at), 'MMM dd, yyyy')}</p>
                      <p>Expires: {format(new Date(invitation.expires_at), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInvitationLink(invitation)}
                      className="flex items-center space-x-1"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy Link</span>
                    </Button>
                    
                    {canResend && onResendInvitation && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResend(invitation.id)}
                        className="flex items-center space-x-1"
                      >
                        <Mail className="h-4 w-4" />
                        <span>Resend</span>
                      </Button>
                    )}
                    
                    {invitation.status === 'pending' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancel(invitation.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Invitation Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Copy this link and share it with the person you want to invite:
            </p>
            <div className="flex items-center space-x-2">
              <Input
                value={selectedInvitation ? getInvitationLink(selectedInvitation) : ''}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => selectedInvitation && copyInvitationLink(selectedInvitation)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ExternalLink className="h-4 w-4" />
              <span>This link can be shared via email, text, or any messaging app</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
