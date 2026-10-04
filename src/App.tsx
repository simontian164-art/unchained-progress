import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { PageSkeleton } from "./app/visuals/Skeleton";

import MarketingLayout from "./components/marketing/MarketingLayout";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

// Only the landing page ships in the first bundle; every other page loads when it's visited.
const ExampleAnalysisPage = lazy(() => import("./pages/ExampleAnalysisPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const GetStartedPage = lazy(() => import("./pages/GetStartedPage"));
const PrivacyPage = lazy(() => import("./pages/legal/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/legal/TermsPage"));
const RefundPage = lazy(() => import("./pages/legal/RefundPage"));
const ContactPage = lazy(() => import("./pages/legal/ContactPage"));
const CheckoutLayout = lazy(() => import("./pages/checkout/CheckoutLayout"));
const CheckoutPage = lazy(() => import("./pages/checkout/CheckoutPage"));
const CheckoutSuccessPage = lazy(() => import("./pages/checkout/CheckoutSuccessPage"));

/** Marketing pages: hold the page height while a chunk loads, so the footer doesn't jump up. */
const Page = ({ C }: { C: React.ComponentType }) => (
  <Suspense fallback={<div className="min-h-[80vh]" />}>
    <C />
  </Suspense>
);

// Member app is code-split so marketing pages stay light (the face scan loads TensorFlow on demand).
const MemberApp = lazy(() => import("./app/MemberApp"));


// The member app's layout is known, so show its skeleton instead of a spinner.
const AppLoading = () => (
  <div className="min-h-screen bg-background">
    <PageSkeleton />
  </div>
);



const App = () => (
  <MotionConfig reducedMotion="user">
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<AppLoading />}>
        <Routes>
          {/* Public marketing site */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/example" element={<Page C={ExampleAnalysisPage} />} />
            <Route path="/pricing" element={<Page C={PricingPage} />} />
            <Route path="/get-started" element={<Page C={GetStartedPage} />} />
            <Route path="/privacy" element={<Page C={PrivacyPage} />} />
            <Route path="/terms" element={<Page C={TermsPage} />} />
            <Route path="/refunds" element={<Page C={RefundPage} />} />
            <Route path="/contact" element={<Page C={ContactPage} />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Checkout (distraction-free layout). Runs in demo mode until auth + Stripe are connected. */}
          <Route element={<Page C={CheckoutLayout} />}>
            <Route path="/checkout" element={<Page C={CheckoutPage} />} />
            <Route path="/checkout/success" element={<Page C={CheckoutSuccessPage} />} />
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
  </MotionConfig>
);

export default App;
