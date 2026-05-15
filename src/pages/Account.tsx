import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User,
  Crown,
  Settings,
  ArrowLeft,
  Save,
  CreditCard,
  Calendar,
  AlertTriangle,
  Check,
  Trash2,
  Shield,
  KeyRound,
  Download,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSmartBack } from '@/hooks/useSmartBack';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { generateUserDataPDF } from '@/utils/generateUserDataExport';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useProfilePermissions } from '@/hooks/useProfilePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CurrentSubscriptionCard } from '@/components/subscription/CurrentSubscriptionCard';
import { Info } from 'lucide-react';

const Account = () => {
  const { user, session, loading, signOut } = useAuth();
  const { 
    subscriptionTier, 
    isPremium, 
    status, 
    currentPeriodEnd, 
    createCheckout, 
    upgrading,
    checkSubscription,
    openCustomerPortal
  } = useSubscription();
  const navigate = useNavigate();
  const goBack = useSmartBack();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { toast } = useToast();

  const initialTab = (() => {
    const raw = searchParams.get('tab');
    return raw === 'subscription' || raw === 'security' ? raw : 'profile';
  })();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const next = new URLSearchParams(searchParams);
    if (value === 'profile') next.delete('tab');
    else next.set('tab', value);
    setSearchParams(next, { replace: true });
  };

  const [profile, setProfile] = useState({
    full_name: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Check user role and permissions
  const { activeProfile } = useBabyProfile();
  const { role, permissions, loading: permissionsLoading } = useProfilePermissions(activeProfile?.id || null);
  const [isViewerOnly, setIsViewerOnly] = useState(false);
  const [userRoleLoading, setUserRoleLoading] = useState(true);

  // Enhanced user role detection to distinguish between new users and family viewers
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setUserRoleLoading(false);
        return;
      }
      
      setUserRoleLoading(true);
      
      try {
        console.log('Checking user role for:', user.id);
        
        // Check if user owns any babies
        const { data: ownedBabies } = await supabase
          .from('baby_profiles')
          .select('id')
          .eq('user_id', user.id);
        
        console.log('Owned babies:', ownedBabies?.length || 0);
        
        // Check if user is a family member (invited by someone else)
        const { data: familyMemberships } = await supabase
          .from('family_members')
          .select('id, role')
          .eq('user_id', user.id)
          .eq('status', 'active');
        
        console.log('Family memberships:', familyMemberships?.length || 0);
        
        // Check if user has any pending invitations (they might be in the process of accepting)
        const { data: pendingInvitations } = await supabase
          .from('family_invitations')
          .select('id')
          .eq('email', user.email || '')
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString());
        
        console.log('Pending invitations:', pendingInvitations?.length || 0);
        
        const hasOwnedBabies = (ownedBabies?.length || 0) > 0;
        const hasFamilyMemberships = (familyMemberships?.length || 0) > 0;
        const hasPendingInvitations = (pendingInvitations?.length || 0) > 0;
        
        // A user is viewer-only if:
        // 1. They have NO owned babies AND
        // 2. They have active family memberships (they were invited and accepted) OR have pending invitations
        // New users (no babies, no memberships, no invitations) should NOT be viewer-only
        const isActuallyViewerOnly = !hasOwnedBabies && (hasFamilyMemberships || hasPendingInvitations);
        
        console.log('User role analysis:', {
          hasOwnedBabies,
          hasFamilyMemberships,
          hasPendingInvitations,
          isActuallyViewerOnly,
          userEmail: user.email,
          userId: user.id
        });
        
        // Default to false (full account owner permissions) for edge cases
        // This ensures new users get full access unless we're certain they're invited viewers
        setIsViewerOnly(isActuallyViewerOnly);
      } catch (error) {
        console.error('Error checking user role:', error);
        // Default to allowing full access on error (safer for new users)
        setIsViewerOnly(false);
      } finally {
        setUserRoleLoading(false);
      }
    };
    
    checkUserRole();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      setProfile({
        full_name: user.user_metadata?.full_name || '',
        email: user.email || ''
      });
    }
  }, [user, loading, navigate]);

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      
      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: profile.full_name }
      });

      if (authError) throw authError;

      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: profile.email,
          full_name: profile.full_name,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = () => {
    createCheckout();
  };

  const handleManageSubscription = () => {
    openCustomerPortal();
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Choose a password with at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please re-type the same password in both fields.",
        variant: "destructive",
      });
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    try {
      let accessToken: string | undefined = session?.access_token;
      if (!accessToken) {
        const { data } = await supabase.auth.getSession();
        accessToken = data.session?.access_token;
      }
      if (!accessToken) {
        toast({
          title: "Not Authenticated",
          description: "Could not find your session. Please login again.",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch("https://wjxxgccfazpkdfzbcgen.functions.supabase.co/export-user-data", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to export data" }));
        throw new Error(err.error || "Failed to export data");
      }

      const data = await res.json();
      generateUserDataPDF(data);

      toast({
        title: "Download started",
        description: "Your data export PDF is being downloaded.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to export your data.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Prefer session from useAuth, fallback to supabase.auth.getSession()
      let accessToken: string | undefined = session?.access_token;

      if (!accessToken) {
        // Try to get session from supabase as a fallback
        const { data } = await supabase.auth.getSession();
        accessToken = data.session?.access_token;
      }

      if (!accessToken) {
        toast({
          title: "Not Authenticated",
          description: "Could not find your session. Please login again.",
          variant: "destructive",
        });
        setDeleting(false);
        return;
      }

      const res = await fetch("https://wjxxgccfazpkdfzbcgen.functions.supabase.co/delete-account", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete account");
      }

      toast({
        title: "Account Deleted",
        description: "Your account and all data were deleted.",
      });
      setTimeout(() => {
        signOut();
        window.location.href = "/";
      }, 1500);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeleteConfirm("");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading || userRoleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Settings className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 text-sm sm:text-base">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <DesktopHeader />
      <MobileHeader />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <Button
            variant="ghost"
            onClick={goBack}
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Back</span>
          </Button>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your profile, subscription, and billing settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center space-x-2">
              <Crown className="h-4 w-4" />
              <span>Subscription</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security & Privacy</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      Email cannot be changed from here
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            {isViewerOnly && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  You are currently a viewer in a family sharing setup. Subscription management is only available to account owners.
                  Contact the baby's owner if you need changes to the subscription.
                </AlertDescription>
              </Alert>
            )}

            <CurrentSubscriptionCard />

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    Manage plans, upgrades & refunds
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Compare plans, upgrade or downgrade, and request a refund (within 14 days) on the full subscription page.
                  </p>
                </div>
                <Button onClick={() => navigate('/subscription')} className="shrink-0">
                  Open subscription page
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security & Privacy Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <KeyRound className="h-5 w-5 text-blue-600" />
                  <span>Change Password</span>
                </CardTitle>
                <CardDescription>
                  Choose a new password with at least 8 characters. You'll stay signed in on this device.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      disabled={changingPassword}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      disabled={changingPassword}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !newPassword || !confirmPassword}
                  className="flex items-center space-x-2"
                >
                  {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  <span>{changingPassword ? 'Updating...' : 'Update Password'}</span>
                </Button>
              </CardContent>
            </Card>

            {/* Download My Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5 text-emerald-600" />
                  <span>Download My Data</span>
                </CardTitle>
                <CardDescription>
                  Get a friendly PDF summary of everything we store about you — baby profiles, activities, memories, subscriptions, and account history.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleExportData}
                  disabled={exporting}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  <span>{exporting ? 'Preparing download...' : 'Download my data (PDF)'}</span>
                </Button>
              </CardContent>
            </Card>

            {isViewerOnly && (
              <Alert className="border-amber-200 bg-amber-50">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  You are currently a viewer in a family sharing setup. Account deletion is not available to viewers.
                  If you want to leave the family, contact the baby's owner to remove you from family sharing.
                </AlertDescription>
              </Alert>
            )}

            {!isViewerOnly && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-700">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <span>Delete Account</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-md px-4 py-3">
                      <b>Warning:</b> Deleting your account is <b>irreversible</b>.<br />
                      This will permanently erase your profile, baby profiles, activity logs, memories, invitations, and all associated data. You will lose access to any premium features purchased. <br />
                      <span className="text-sm">If you have an active subscription, it will be cancelled automatically before account deletion.</span>
                    </div>
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="flex items-center space-x-2"
                          disabled={deleting}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{deleting ? "Deleting..." : "Delete My Account"}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Permanently Delete Account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. All your data will be erased. <br />
                            To continue, type <b>DELETE</b> below and confirm.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Input
                          autoFocus
                          disabled={deleting}
                          placeholder="Type DELETE to confirm"
                          value={deleteConfirm}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                          className="mb-2"
                        />
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={deleteConfirm !== "DELETE" || deleting}
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleDeleteAccount}
                          >
                            {deleting ? "Deleting..." : "Delete Account"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Account;
