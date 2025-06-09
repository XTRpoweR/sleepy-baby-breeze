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
import { InvitationLink } from './InvitationLink';
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
import { createClient } from '@supabase/supabase-js'; // <-- تم الإضافة

// --- إضافة إعدادات الاتصال بـ Supabase ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// ------------------------------------


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
  const [message, setMessage] = useState(''); // <-- تم الإضافة

  // --- تم استبدال هذه الدالة بالكامل ---
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsInviting(true);
    setMessage('');

    try {
      // أولاً: التحقق إذا كان المستخدم موجوداً
      const { data: checkData, error: checkError } = await supabase.functions.invoke('check-invitation', {
        body: { email: email.trim() },
      });

      if (checkError) {
        throw new Error(`Verification failed: ${checkError.message}`);
      }
      
      // إذا كان المستخدم موجوداً، أظهر رسالة خطأ وتوقف
      if (checkData.exists) {
        setMessage('This user is already a member or has a pending invitation.');
        setIsInviting(false);
        return; 
      }
      
      // ثانياً: إذا لم يكن موجوداً، قم بدعوة المستخدم
      const success = await inviteFamilyMember(email.trim(), role);
      
      if (success) {
        setMessage('Invitation sent successfully!');
        setEmail('');
        setRole('caregiver');
      } else {
        throw new Error('Failed to send the invitation. Please try again.');
      }

    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsInviting(false);
    }
  };
  // -----------------------------------------------------------

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
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address" required />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="caregiver">Caregiver - Can track activities and view reports</SelectItem>
                  <SelectItem value="viewer">Viewer - Can only view activities and reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={!email.trim() || isInviting} className="bg-blue-600 hover:bg-blue-700">
              {isInviting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </form>
          {/* --- إضافة مكان لعرض الرسالة --- */}
          {message && <p className={`text-sm mt-4 ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
          {/* ------------------------------- */}
        </CardContent>
      </Card>

      {/* باقي الملف يبقى كما هو */}
      <InvitationLink invitations={invitations} />
      {/* ... */}
    </div>
  );
};