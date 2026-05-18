import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Crown, Gem, Briefcase, Edit3, Eye, Check, X, Clock, AlertCircle, Mail, Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SUPABASE_URL = 'https://wjxxgccfazpkdfzbcgen.supabase.co';

interface InviteInfo {
  email: string;
  role: 'ceo' | 'executive' | 'manager' | 'editor' | 'member';
  title: string | null;
  message: string | null;
  expires_at: string;
  inviter_name: string | null;
}

const ROLE_META = {
  ceo:       { label: 'CEO',       icon: Crown,     color: 'from-amber-500 via-yellow-500 to-amber-600' },
  executive: { label: 'Executive', icon: Gem,       color: 'from-purple-500 to-pink-500' },
  manager:   { label: 'Manager',   icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
  editor:    { label: 'Editor',    icon: Edit3,     color: 'from-emerald-500 to-teal-500' },
  member:    { label: 'Member',    icon: Eye,       color: 'from-slate-500 to-slate-600' },
};

const InviteAccept = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [autoAccepted, setAutoAccepted] = useState(false);

  // Fetch invitation info on mount
  useEffect(() => {
    if (!token) {
      setError('Missing invitation token');
      setLoading(false);
      return;
    }
    (async () => {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/accept-team-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await resp.json();
      if (!resp.ok || data.error) {
        setError(data.error || 'Invalid invitation');
      } else {
        setInfo(data as InviteInfo);
      }
      setLoading(false);
    })();
  }, [token]);

  const accept = async () => {
    if (!user || !token) return;
    setAccepting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const authToken = sessionData.session?.access_token;
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/accept-team-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
        body: JSON.stringify({ token, accept: true }),
      });
      const data = await resp.json();
      if (!resp.ok || data.error) {
        toast.error(data.error || 'Failed to accept');
        setAccepting(false);
        return;
      }
      toast.success(data.already_member ? "You're already on the team — redirecting…" : 'Welcome to the team!');
      navigate('/admin/messages');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to accept');
      setAccepting(false);
    }
  };

  // Auto-accept the moment the user lands here already signed-in with the
  // invited email — so the flow "click email -> sign in -> admin" feels seamless,
  // with no extra confirm-click in the middle.
  useEffect(() => {
    if (autoAccepted) return;
    if (loading || authLoading) return;
    if (!info || !user || !token) return;
    if ((user.email || '').toLowerCase() !== info.email.toLowerCase()) return;
    setAutoAccepted(true);
    accept();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info, user, token, loading, authLoading, autoAccepted]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50/60 to-indigo-50">
        <div className="h-10 w-10 rounded-full border-2 border-purple-200 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50/60 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
            <X className="w-7 h-7 text-rose-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Invitation issue</h1>
          <p className="text-sm text-slate-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/')}>Back to home</Button>
        </div>
      </div>
    );
  }

  if (!info) return null;

  const meta = ROLE_META[info.role];
  const Icon = meta.icon;
  const expiresIn = formatDistanceToNow(new Date(info.expires_at), { addSuffix: true });
  const isEmailMatch = user && user.email && user.email.toLowerCase() === info.email.toLowerCase();
  const isWrongEmail = user && !isEmailMatch;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50/60 to-indigo-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        <div className={`bg-gradient-to-br ${meta.color} p-8 text-center text-white`}>
          <div className="text-5xl mb-2">🎉</div>
          <h1 className="text-2xl font-bold mb-1">You&apos;re invited!</h1>
          <p className="text-white/90 text-sm">to join SleepyBabyy admin team</p>
        </div>

        <div className="p-6 space-y-4">
          {info.inviter_name && (
            <p className="text-center text-sm text-slate-600">
              <strong className="text-slate-900">{info.inviter_name}</strong> has invited you to be a
            </p>
          )}

          <div className="flex items-center justify-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${meta.color} text-white font-semibold shadow-md`}>
              <Icon className="w-4 h-4" />
              {meta.label}
              {info.title && <span className="text-xs font-normal opacity-90">· {info.title}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 justify-center text-xs text-slate-500">
            <Mail className="w-3.5 h-3.5" />
            {info.email}
          </div>

          {info.message && (
            <div className="bg-purple-50/60 border-l-4 border-purple-400 rounded-lg p-3 text-sm text-slate-700 italic">
              &ldquo;{info.message}&rdquo;
            </div>
          )}

          <div className="flex items-center gap-2 justify-center text-xs text-amber-700">
            <Clock className="w-3 h-3" />
            Expires {expiresIn}
          </div>

          <div className="pt-2">
            {!user ? (
              <>
                <div className="text-xs text-slate-500 mb-2 text-center bg-slate-50 rounded-lg p-3">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500 inline mr-1" />
                  Sign in with <strong>{info.email}</strong> to accept this invitation.
                </div>
                <Button
                  onClick={() => navigate(`/auth?redirect=${encodeURIComponent(`/invite/${token}`)}`)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
                >
                  Sign in to accept
                </Button>
              </>
            ) : isWrongEmail ? (
              <div className="space-y-2">
                <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    You&apos;re signed in as <strong>{user.email}</strong>. This invitation is for <strong>{info.email}</strong>.
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate(`/auth?redirect=${encodeURIComponent(`/invite/${token}`)}`);
                  }}
                  className="w-full"
                >
                  Sign out & switch account
                </Button>
              </div>
            ) : (
              <Button
                onClick={accept}
                disabled={accepting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                {accepting ? 'Joining…' : 'Accept & join team'}
              </Button>
            )}
          </div>

          <p className="text-[10px] text-center text-slate-400 pt-2">
            By accepting, you agree to abide by SleepyBabyy admin guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteAccept;
