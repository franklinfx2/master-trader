import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GradientMeshBackground } from "@/components/ui/gradient-mesh-background";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import Analyze from "./pages/Analyze";
import Settings from "./pages/Settings";
import Callback from "./pages/Callback";
import Webhook from "./pages/Webhook";
import AdminTestMode from "./pages/AdminTestMode";
import AdminFeedback from "./pages/AdminFeedback";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Disclaimer from "./pages/Disclaimer";
import CookiePolicy from "./pages/CookiePolicy";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Affiliate from "./pages/Affiliate";
import Pricing from "./pages/Pricing";
import EliteJournalDebug from "./pages/EliteJournalDebug";
import EliteTradeEntry from "./pages/EliteTradeEntry";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <GradientMeshBackground />
        
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/trades" element={<ProtectedRoute><Trades /></ProtectedRoute>} />
            <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/callback" element={<ProtectedRoute><Callback /></ProtectedRoute>} />
            <Route path="/webhook" element={<Webhook />} />
            <Route path="/admin/test-mode" element={<ProtectedRoute><AdminTestMode /></ProtectedRoute>} />
            <Route path="/admin/feedback" element={<ProtectedRoute><AdminFeedback /></ProtectedRoute>} />
            <Route path="/elite-journal-debug" element={<ProtectedRoute><EliteJournalDebug /></ProtectedRoute>} />
            <Route path="/elite-trade-entry" element={<ProtectedRoute><EliteTradeEntry /></ProtectedRoute>} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/affiliate" element={<Affiliate />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
