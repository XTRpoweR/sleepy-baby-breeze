
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import TrackActivity from "./pages/TrackActivity";
import Reports from "./pages/Reports";
import SleepSchedule from "./pages/SleepSchedule";
import FamilySharing from "./pages/FamilySharing";
import InvitationAcceptPage from "./pages/InvitationAccept";
import Sounds from "./pages/Sounds";
import Subscription from "./pages/Subscription";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Download from "./pages/Download";
import About from "./pages/About";
import Contact from "./pages/Contact";
import HelpCenter from "./pages/HelpCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Tutorial from "./pages/Tutorial";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <SubscriptionProvider>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/track" element={<TrackActivity />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/sleep-schedule" element={<SleepSchedule />} />
                <Route path="/family" element={<FamilySharing />} />
                <Route path="/invitation" element={<InvitationAcceptPage />} />
                <Route path="/sounds" element={<Sounds />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/account" element={<Account />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/download" element={<Download />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/tutorial" element={<Tutorial />} />
                <Route path="/getting-started" element={<Tutorial />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </div>
            <Toaster />
            <Sonner />
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
