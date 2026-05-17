import React, { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { CookieConsentProvider } from "@/hooks/useCookieConsent";
import { CookieConsentBanner } from "@/components/cookies/CookieConsentBanner";
import { CookieSettingsButton } from "@/components/cookies/CookieSettingsButton";
import { preloadCriticalResources } from "@/utils/performanceUtils";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { captureUtmParams } from "@/utils/utmCapture";

// Eager-load the landing page so the first paint is instant
import Index from "./pages/Index";

// Lazy-load every other route to keep the initial bundle small and fast
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const TrackActivity = lazy(() => import("./pages/TrackActivity"));
const Reports = lazy(() => import("./pages/Reports"));
const SleepSchedule = lazy(() => import("./pages/SleepSchedule"));
const FamilySharing = lazy(() => import("./pages/FamilySharing"));
const InvitationAcceptPage = lazy(() => import("./pages/InvitationAccept"));
const Sounds = lazy(() => import("./pages/Sounds"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Account = lazy(() => import("./pages/Account"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Download = lazy(() => import("./pages/Download"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const HelpArticles = lazy(() => import("./pages/HelpArticles"));
const HelpArticle = lazy(() => import("./pages/HelpArticle"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Blog = lazy(() => import("./pages/Blog"));
const Careers = lazy(() => import("./pages/Careers"));
const Tutorial = lazy(() => import("./pages/Tutorial"));
const Memories = lazy(() => import("./pages/Memories"));
const PediatricianReports = lazy(() => import("./pages/PediatricianReports"));
const Notifications = lazy(() => import("./pages/Notifications"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
// AccountSecurity merged into /account?tab=security — keep import removed to avoid lazy chunk load
const EnhancedPasswordReset = lazy(() => import("./components/auth/EnhancedPasswordReset"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const ChatAssistant = lazy(() => import("./components/chat/ChatAssistant"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminThread = lazy(() => import("./pages/admin/AdminThread"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminCampaigns = lazy(() => import("./pages/admin/AdminCampaigns"));
const AdminCampaignDetail = lazy(() => import("./pages/admin/AdminCampaignDetail"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const LandingSleep = lazy(() => import("./pages/LandingSleep"));
const UpgradePreview = lazy(() => import("./pages/UpgradePreview"));
const DashboardPreview = lazy(() => import("./pages/DashboardPreview"));
const ProfileModalPreview = lazy(() => import("./pages/ProfileModalPreview"));
const DashboardFeaturesPreview = lazy(() => import("./pages/DashboardFeaturesPreview"));
const NewsletterFeaturesPreview = lazy(() => import("./pages/NewsletterFeaturesPreview"));
import { OnboardingGate } from "./components/onboarding/OnboardingGate";

// Create queryClient outside of component to avoid recreation on each render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Lightweight fallback while route chunks load — uses brand-gradient background
// so it feels like a continuation of the dashboard, not a separate "loading" screen.
const RouteFallback: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50/60 to-indigo-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 rounded-full border-2 border-purple-200 border-t-purple-500 animate-spin" />
    </div>
  </div>
);

// Fires Meta Pixel PageView on every SPA route change.
// Lives inside <BrowserRouter> via the AppRoutes wrapper below.
const PixelRouteTracker: React.FC = () => {
  usePageViewTracking();
  return null;
};

const App: React.FC = () => {
  useEffect(() => {
    // Initialize performance optimizations
    preloadCriticalResources();
    // Capture UTM/fbclid/gclid on landing for attribution
    captureUtmParams();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <SubscriptionProvider>
              <CookieConsentProvider>
                <PixelRouteTracker />
                <OnboardingGate />
                <div className="min-h-screen bg-background font-sans antialiased">
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/lp/sleep" element={<LandingSleep />} />
                      <Route path="/dev/upgrade-preview" element={<UpgradePreview />} />
                      <Route path="/dev/dashboard-preview" element={<DashboardPreview />} />
                      <Route path="/dev/profile-modal-preview" element={<ProfileModalPreview />} />
                      <Route path="/dev/dashboard-features-preview" element={<DashboardFeaturesPreview />} />
                      <Route path="/dev/newsletter-features-preview" element={<NewsletterFeaturesPreview />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/reset-password" element={<EnhancedPasswordReset />} />
                      <Route path="/security" element={<Navigate to="/account?tab=security" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route path="/track" element={<TrackActivity />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/sleep-schedule" element={<SleepSchedule />} />
                      <Route path="/family" element={<FamilySharing />} />
                      <Route path="/invitation" element={<InvitationAcceptPage />} />
                      <Route path="/sounds" element={<Sounds />} />
                      <Route path="/memories" element={<Memories />} />
                      <Route path="/pediatrician-reports" element={<PediatricianReports />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/subscription" element={<Subscription />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/features" element={<Features />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/download" element={<Download />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/help" element={<HelpCenter />} />
                      <Route path="/help/category/:categoryName" element={<HelpArticles />} />
                      <Route path="/help/article/:categoryName/:articleId" element={<HelpArticle />} />
                      <Route path="/tutorial" element={<Tutorial />} />
                      <Route path="/getting-started" element={<Tutorial />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogArticle />} />
                      <Route path="/careers" element={<Careers />} />
                      <Route path="/unsubscribe" element={<Unsubscribe />} />
                      <Route path="/admin" element={<Navigate to="/admin/messages" replace />} />
                      <Route path="/admin/messages" element={<AdminMessages />} />
                      <Route path="/admin/messages/:threadId" element={<AdminThread />} />
                      <Route path="/admin/newsletter" element={<AdminNewsletter />} />
                      <Route path="/admin/campaigns" element={<AdminCampaigns />} />
                      <Route path="/admin/campaigns/:id" element={<AdminCampaignDetail />} />
                      <Route path="/admin/analytics" element={<AdminAnalytics />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/404" element={<NotFound />} />
                      <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                  </Suspense>
                  <Suspense fallback={null}>
                    <ChatAssistant />
                  </Suspense>
                  <CookieConsentBanner />
                  <CookieSettingsButton />
                </div>
                <Toaster />
                <Sonner />
              </CookieConsentProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
