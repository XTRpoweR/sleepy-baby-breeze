
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SecureAuthForm } from '@/components/auth/SecureAuthForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const redirectTo = searchParams.get('redirect');

  useEffect(() => {
    if (user) {
      // If user is already authenticated and there's a redirect, go there
      if (redirectTo) {
        // Check if the redirect URL contains success parameter to avoid loops
        const redirectUrl = new URL(redirectTo, window.location.origin);
        if (redirectUrl.searchParams.get('success') === 'true') {
          // If already marked as success, go directly to dashboard
          navigate('/dashboard');
        } else {
          navigate(redirectTo);
        }
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate, redirectTo]);

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')}
          className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Button>

        {redirectTo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-center text-blue-800">
              Sign in to continue with your invitation
            </p>
          </div>
        )}

        <SecureAuthForm 
          isLogin={isLogin} 
          onToggleMode={handleToggleMode}
        />
      </div>
    </div>
  );
};

export default Auth;
