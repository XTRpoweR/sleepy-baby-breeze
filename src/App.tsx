
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TrackActivity from "./pages/TrackActivity";
import SleepSchedule from "./pages/SleepSchedule";
import Sounds from "./pages/Sounds";
import Reports from "./pages/Reports";
import FamilySharing from "./pages/FamilySharing";
import NotFound from "./pages/NotFound";
import { InvitationAccept } from "./components/family/InvitationAccept";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/track" element={<TrackActivity />} />
            <Route path="/sleep-schedule" element={<SleepSchedule />} />
            <Route path="/sounds" element={<Sounds />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/family" element={<FamilySharing />} />
            <Route path="/invitation" element={<InvitationAccept />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
