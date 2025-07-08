
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SecureInput } from '@/components/ui/secure-input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { validateInput } from '@/utils/validation';
import { Mail, Lock, User, Shield, AlertTriangle } from 'lucide-react';

interface SecureAuthFormProps {
  isLogin: boolean;
  onToggleMode: () => void;
}

export const SecureAuthForm = ({ isLogin, onToggleMode }: SecureAuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ isValid: boolean; errors: string[] }>({ isValid: false, errors: [] });
  
  const { secureSignIn, secureSignUp, isLocked, lockoutTimeRemaining } = useSecureAuth();
  const { toast } = useToast();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    if (!isLogin) {
      const strength = validateInput.isStrongPassword(newPassword);
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      const minutes = Math.ceil(lockoutTimeRemaining / 60000);
      toast({
        title: "Account Locked",
        description: `Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`,
        variant: "destructive",
      });
      return;
    }

    // Validate email
    if (!validateInput.isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength for signup
    if (!isLogin && !passwordStrength.isValid) {
      toast({
        title: "Weak Password",
        description: "Please choose a stronger password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await secureSignIn(email, password);
      } else {
        if (!fullName.trim()) {
          toast({
            title: "Missing Information",
            description: "Please enter your full name.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        result = await secureSignUp(email, password, fullName);
      }

      if (result.success) {
        if (!isLogin) {
          toast({
            title: "Account Created",
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatLockoutTime = () => {
    const minutes = Math.floor(lockoutTimeRemaining / 60000);
    const seconds = Math.floor((lockoutTimeRemaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          {isLogin ? 'Secure Sign In' : 'Create Account'}
        </CardTitle>
        {isLocked && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600">
              Account locked. Try again in {formatLockoutTime()}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <SecureInput
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  maxLength={100}
                  sanitize={true}
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <SecureInput
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                maxLength={254}
                required
                validationRules={[
                  (value) => validateInput.isValidEmail(value) ? null : "Please enter a valid email address"
                ]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <SecureInput
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                className="pl-10"
                required
                minLength={isLogin ? 6 : 8}
              />
            </div>
            {!isLogin && password && (
              <div className="text-sm space-y-1">
                <div className={`text-xs ${passwordStrength.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  Password Strength: {passwordStrength.isValid ? 'Strong' : 'Weak'}
                </div>
                {passwordStrength.errors.length > 0 && (
                  <ul className="text-xs text-red-600 space-y-1">
                    {passwordStrength.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            disabled={loading || isLocked || (!isLogin && !passwordStrength.isValid)}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In Securely' : 'Create Account')}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-sm text-blue-600 hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
