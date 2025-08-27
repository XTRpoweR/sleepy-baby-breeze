
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Baby, Crown, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useGuestCheckout } from '@/hooks/useGuestCheckout';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const { user } = useAuth();
  const { createCheckout, upgrading } = useSubscription();
  const { createGuestCheckout, loading: guestLoading } = useGuestCheckout();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      // Authenticated user - use regular checkout
      createCheckout();
    } else {
      // Guest user - use guest checkout
      createGuestCheckout();
    }
  };

  const isLoading = upgrading || guestLoading;

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-blue-100/50 bg-[size:20px_20px] opacity-30" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
              ✨ Trusted by 10,000+ Parents
            </Badge>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-sm text-gray-600 font-medium">4.9/5 Rating</span>
            </div>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Sleep Better with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SleepyBabyy
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            The complete baby tracking solution that helps you understand your baby's patterns, 
            optimize their sleep, and get the rest your family deserves.
          </p>

          {/* Key benefits */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-10 text-gray-700">
            <div className="flex items-center space-x-2">
              <Baby className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Smart Sleep Tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="font-medium">AI-Powered Insights</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span className="font-medium">Family Sharing</span>
            </div>
          </div>

          {/* Pricing and CTA */}
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto mb-8 border border-gray-100">
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Badge className="bg-red-500 text-white text-sm font-bold px-3 py-1">
                  40% OFF
                </Badge>
                <span className="text-lg text-gray-500 line-through font-medium">$14.99</span>
              </div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                <span className="text-4xl font-bold text-gray-900">$9.99</span>
                <span className="text-gray-600 font-medium">/month</span>
              </div>
              <p className="text-red-600 text-sm font-medium">Save $5.00 per month!</p>
            </div>

            <Button 
              onClick={handleGetStarted}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  Start Premium Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <p>✓ 30-day money-back guarantee</p>
              <p>✓ Cancel anytime</p>
              <p>✓ Instant access to all features</p>
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="mx-2 border-gray-300 hover:border-gray-400 transition-colors"
            >
              Try Basic Version Free
            </Button>
            <p className="text-sm text-gray-500">
              No payment required • Start tracking immediately
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
