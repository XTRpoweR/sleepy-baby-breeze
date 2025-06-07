
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
import Sounds from "./pages/Sounds";
import Subscription from "./pages/Subscription";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";

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
                <Route path="/sounds" element={<Sounds />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/account" element={<Account />} />
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
