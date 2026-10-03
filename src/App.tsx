import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { PageSkeleton } from "./app/visuals/Skeleton";

import MarketingLayout from "./components/marketing/MarketingLayout";
import LandingPage from "./pages/LandingPage";
import ExampleAnalysisPage from "./pages/ExampleAnalysisPage";
import PricingPage from "./pages/PricingPage";
import GetStartedPage from "./pages/GetStartedPage";
import PrivacyPage from "./pages/legal/PrivacyPage";
import TermsPage from "./pages/legal/TermsPage";
import RefundPage from "./pages/legal/RefundPage";
import ContactPage from "./pages/legal/ContactPage";
import CheckoutLayout from "./pages/checkout/CheckoutLayout";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import CheckoutSuccessPage from "./pages/checkout/CheckoutSuccessPage";
import NotFound from "./pages/NotFound";

// Member app is code-split so marketing pages stay light (the face scan loads TensorFlow on demand).
const MemberApp = lazy(() => import("./app/MemberApp"));

const queryClient = new QueryClient();

// The member app's layout is known, so show its skeleton instead of a spinner.
const AppLoading = () => (
  <div className="min-h-screen bg-background">
    <PageSkeleton />
  </div>
);



const App = () => (
  <MotionConfig reducedMotion="user">
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<AppLoading />}>
        <Routes>
          {/* Public marketing site */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/example" element={<ExampleAnalysisPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/get-started" element={<GetStartedPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/refunds" element={<RefundPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Checkout (distraction-free layout). Runs in demo mode until auth + Stripe are connected. */}
          <Route element={<CheckoutLayout />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          </Route>

          {/* Legacy URLs from the previous funnel */}
          <Route path="/membership" element={<Navigate to="/pricing" replace />} />
          <Route path="/preview" element={<Navigate to="/example" replace />} />

          {/* Member app */}
          <Route path="/app/*" element={<MemberApp />} />

          {/* Old member-area URLs */}
          <Route path="/hub/*" element={<Navigate to="/app" replace />} />
          <Route path="/onboarding" element={<Navigate to="/app/start" replace />} />
          <Route path="/intro" element={<Navigate to="/app/start" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </MotionConfig>
);

export default App;
