
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvitationLinkProps {
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    invitation_token: string;
    expires_at: string;
  }>;
}

export const InvitationLink = ({ invitations }: InvitationLinkProps) => {
  const { toast } = useToast();
  const [showLinks, setShowLinks] = useState(false);

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/invitation?token=${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Invitation link has been copied to clipboard.",
    });
  };

  const openInvitationLink = (token: string) => {
    const link = `${window.location.origin}/invitation?token=${token}`;
    window.open(link, '_blank');
  };

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Invitation Links</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLinks(!showLinks)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showLinks ? 'Hide' : 'Show'} Links
          </Button>
        </CardTitle>
      </CardHeader>
      {showLinks && (
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Copy these links to send to invited family members. Each link is unique and expires in 7 days.
            </p>
            {invitations.map((invitation) => (
              <div key={invitation.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <Badge className="bg-blue-100 text-blue-800">
                      {invitation.role}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`link-${invitation.id}`}>Invitation Link:</Label>
                  <div className="flex space-x-2">
                    <Input
                      id={`link-${invitation.id}`}
                      value={`${window.location.origin}/invitation?token=${invitation.invitation_token}`}
                      readOnly
                      className="bg-gray-50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInvitationLink(invitation.invitation_token)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInvitationLink(invitation.invitation_token)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
