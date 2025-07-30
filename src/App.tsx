
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import TrackActivity from '@/pages/TrackActivity';
import Reports from '@/pages/Reports';
import PediatricianReports from '@/pages/PediatricianReports';
import SleepSchedule from '@/pages/SleepSchedule';
import Sounds from '@/pages/Sounds';
import Memories from '@/pages/Memories';
import Messages from '@/pages/Messages';
import FamilySharing from '@/pages/FamilySharing';
import Notifications from '@/pages/Notifications';
import Account from '@/pages/Account';
import Subscription from '@/pages/Subscription';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Careers from '@/pages/Careers';
import Download from '@/pages/Download';
import Blog from '@/pages/Blog';
import BlogArticle from '@/pages/BlogArticle';
import HelpCenter from '@/pages/HelpCenter';
import HelpArticles from '@/pages/HelpArticles';
import HelpArticle from '@/pages/HelpArticle';
import Tutorial from '@/pages/Tutorial';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import ResetPassword from '@/pages/ResetPassword';
import InvitationAccept from '@/pages/InvitationAccept';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import { SubscriptionProvider } from '@/hooks/useSubscription';
import { TranslationWrapper } from '@/components/TranslationWrapper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TranslationWrapper>
        <AuthProvider>
          <SubscriptionProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/track-activity" element={<TrackActivity />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/pediatrician-reports" element={<PediatricianReports />} />
                <Route path="/sleep-schedule" element={<SleepSchedule />} />
                <Route path="/sounds" element={<Sounds />} />
                <Route path="/memories" element={<Memories />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/family-sharing" element={<FamilySharing />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/account" element={<Account />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/download" element={<Download />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogArticle />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/help/articles" element={<HelpArticles />} />
                <Route path="/help/articles/:slug" element={<HelpArticle />} />
                <Route path="/tutorial" element={<Tutorial />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/invitation/accept/:token" element={<InvitationAccept />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </SubscriptionProvider>
        </AuthProvider>
      </TranslationWrapper>
    </QueryClientProvider>
  );
}

export default App;
