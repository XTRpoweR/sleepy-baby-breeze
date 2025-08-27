import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { SubscriptionProvider } from '@/hooks/useSubscription';
import { TranslationWrapper } from '@/components/TranslationWrapper';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import Account from '@/pages/Account';
import Subscription from '@/pages/Subscription';
import Pricing from '@/pages/Pricing';
import { Toaster } from '@/components/ui/toaster';
import CompleteSetup from '@/pages/CompleteSetup';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SubscriptionProvider>
            <TranslationWrapper>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/complete-setup" element={<CompleteSetup />} />
                </Routes>
                <Toaster />
              </div>
            </TranslationWrapper>
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
