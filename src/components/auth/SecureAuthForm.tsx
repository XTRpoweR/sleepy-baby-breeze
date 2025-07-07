
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SecureInput } from '@/components/ui/secure-input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { validateInput } from '@/utils/validation';
import { Mail, Lock, User, Shield, AlertTriangle, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface SecureAuthFormProps {
  isLogin: boolean;
  onToggleMode: () => void;
}

export const SecureAuthForm = ({ isLogin, onToggleMode }: SecureAuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [passwordStrength, setPasswordStrength] = useState<{ isValid: boolean; errors: string[] }>({ isValid: false, errors: [] });
  
  const { secureSignIn, secureSignUp, isLocked, lockoutTimeRemaining } = useSecureAuth();
  const { toast } = useToast();

  const clearErrors = () => {
    setFormErrors({});
  };

  const getErrorMessage = (error: string): { email?: string; password?: string; general?: string } => {
    const lowerError = error.toLowerCase();
    
    if (lowerError.includes('invalid login credentials') || lowerError.includes('invalid email or password')) {
      return {
        password: 'The password you entered is incorrect. Please try again.',
        email: undefined,
        general: undefined
      };
    }
    
    if (lowerError.includes('email not confirmed')) {
      return {
        email: 'Please check your email and click the confirmation link.',
        general: undefined
      };
    }
    
    if (lowerError.includes('user not found') || lowerError.includes('invalid email')) {
      return {
        email: "We don't recognize this email address. Please check or sign up.",
        general: undefined
      };
    }
    
    if (lowerError.includes('locked') || lowerError.includes('too many attempts')) {
      return {
        general: error
      };
    }
    
    return {
      general: error
    };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    // Clear password error when user starts typing
    if (formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: undefined }));
    }
    
    if (!isLogin) {
      const strength = validateInput.isStrongPassword(newPassword);
      setPasswordStrength(strength);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    
    // Clear email error when user starts typing
    if (formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    if (isLocked) {
      const minutes = Math.ceil(lockoutTimeRemaining / 60000);
      setFormErrors({
        general: `Account temporarily locked. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`
      });
      return;
    }

    // Validate email
    if (!validateInput.isValidEmail(email)) {
      setFormErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    // Validate password strength for signup
    if (!isLogin && !passwordStrength.isValid) {
      setFormErrors({ password: 'Please choose a stronger password.' });
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await secureSignIn(email, password);
      } else {
        if (!fullName.trim()) {
          setFormErrors({ general: 'Please enter your full name.' });
          setLoading(false);
          return;
        }
        result = await secureSignUp(email, password, fullName);
      }

      if (result.success) {
        if (!isLogin) {
          toast({
            title: "Account Created Successfully",
            description: "Please check your email to verify your account.",
          });
        } else {
          toast({
            title: "Welcome Back!",
            description: "You've been successfully signed in.",
          });
        }
      } else if (result.error) {
        const errorMessages = getErrorMessage(result.error);
        setFormErrors(errorMessages);
      }
    } catch (error) {
      setFormErrors({
        general: "Something went wrong. Please try again."
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
          {isLogin ? 'Welcome Back' : 'Create Your Account'}
        </CardTitle>
        {isLocked && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600">
              Account locked. Try again in {formatLockoutTime()}
            </span>
          </div>
        )}
        {formErrors.general && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600">{formErrors.general}</span>
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
                onChange={handleEmailChange}
                className={`pl-10 ${formErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                maxLength={254}
                required
                validationRules={[
                  (value) => validateInput.isValidEmail(value) ? null : "Please enter a valid email address"
                ]}
              />
              {email && validateInput.isValidEmail(email) && !formErrors.email && (
                <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
              )}
            </div>
            {formErrors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {formErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <SecureInput
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                className={`pl-10 pr-10 ${formErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                required
                minLength={isLogin ? 6 : 8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {formErrors.password}
              </p>
            )}
            {!isLogin && password && (
              <div className="text-sm space-y-1">
                <div className={`text-xs flex items-center gap-1 ${passwordStrength.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordStrength.isValid ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  Password Strength: {passwordStrength.isValid ? 'Strong' : 'Weak'}
                </div>
                {passwordStrength.errors.length > 0 && (
                  <ul className="text-xs text-red-600 space-y-1 ml-4">
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
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
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
