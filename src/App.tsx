import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { lazy, Suspense } from "react";

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

// Member app is code-split so the marketing pages don't download TensorFlow etc.
const IntroPage = lazy(() => import("./pages/IntroPage"));
const HubPage = lazy(() => import("./pages/HubPage"));
const HubLayout = lazy(() => import("./components/HubLayout"));
const SkinMaxPage = lazy(() => import("./pages/modules/SkinMaxPage"));
const StyleMaxPage = lazy(() => import("./pages/modules/StyleMaxPage"));
const BodyMaxPage = lazy(() => import("./pages/modules/BodyMaxPage"));
const IQMaxPage = lazy(() => import("./pages/modules/IQMaxPage"));
const PresenceMaxPage = lazy(() => import("./pages/modules/PresenceMaxPage"));
const MoneyMaxPage = lazy(() => import("./pages/modules/MoneyMaxPage"));
const FaceAnalyzerPage = lazy(() => import("./pages/FaceAnalyzerPage"));
const AttractivenessPage = lazy(() => import("./pages/AttractivenessPage"));
const GoldenRatioPage = lazy(() => import("./pages/GoldenRatioPage"));
const JawlineAnalyzerPage = lazy(() => import("./pages/JawlineAnalyzerPage"));
const CheekboneAnalyzerPage = lazy(() => import("./pages/CheekboneAnalyzerPage"));
const EyeAnalyzerPage = lazy(() => import("./pages/EyeAnalyzerPage"));
const NoseAnalyzerPage = lazy(() => import("./pages/NoseAnalyzerPage"));
const FaceHarmonyPage = lazy(() => import("./pages/FaceHarmonyPage"));
const BeardStylePage = lazy(() => import("./pages/BeardStylePage"));
const HairlineAnalyzerPage = lazy(() => import("./pages/HairlineAnalyzerPage"));
const GroomingMaxPage = lazy(() => import("./pages/modules/GroomingMaxPage"));
const StyleMaxDashboard = lazy(() => import("./pages/modules/StyleMaxDashboard"));
const FaceMaxPage = lazy(() => import("./pages/FaceMaxPage"));
const PhotoMaxPage = lazy(() => import("./pages/modules/PhotoMaxPage"));
const GlowUpPage = lazy(() => import("./pages/GlowUpPage"));
const GlowUpCoachPage = lazy(() => import("./pages/GlowUpCoachPage"));
const StyleSimulatorPage = lazy(() => import("./pages/modules/StyleSimulatorPage"));
const GamificationPage = lazy(() => import("./pages/GamificationPage"));
const LooksmaxScorePage = lazy(() => import("./pages/LooksmaxScorePage"));
const TransformationTimelinePage = lazy(() => import("./pages/TransformationTimelinePage"));
const MakeupMaxPage = lazy(() => import("./pages/modules/MakeupMaxPage"));
const HairMaxPage = lazy(() => import("./pages/modules/HairMaxPage"));
const NailMaxPage = lazy(() => import("./pages/modules/NailMaxPage"));
const FragranceMaxPage = lazy(() => import("./pages/modules/FragranceMaxPage"));
const OnboardingFlowPage = lazy(() => import("./pages/OnboardingFlowPage"));

const queryClient = new QueryClient();

const AppLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Loading">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
  </div>
);



const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProfileProvider>
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

          {/* Member app (currently an unauthenticated preview with sample data) */}
          <Route path="/intro" element={<IntroPage />} />
          <Route path="/onboarding" element={<OnboardingFlowPage />} />
          <Route path="/hub" element={<HubLayout />}>
            <Route index element={<HubPage />} />
            <Route path="skin" element={<SkinMaxPage />} />
            <Route path="style" element={<StyleMaxDashboard />} />
            <Route path="body" element={<BodyMaxPage />} />
            <Route path="iq" element={<IQMaxPage />} />
            <Route path="presence" element={<PresenceMaxPage />} />
            <Route path="money" element={<MoneyMaxPage />} />
            <Route path="face-analyzer" element={<FaceAnalyzerPage />} />
            <Route path="attractiveness" element={<AttractivenessPage />} />
            <Route path="golden-ratio" element={<GoldenRatioPage />} />
            <Route path="jawline" element={<JawlineAnalyzerPage />} />
            <Route path="cheekbone" element={<CheekboneAnalyzerPage />} />
            <Route path="eyes" element={<EyeAnalyzerPage />} />
            <Route path="nose" element={<NoseAnalyzerPage />} />
            <Route path="harmony" element={<FaceHarmonyPage />} />
            <Route path="beard" element={<BeardStylePage />} />
            <Route path="hairline" element={<HairlineAnalyzerPage />} />
            <Route path="grooming" element={<GroomingMaxPage />} />
            <Route path="facemax" element={<FaceMaxPage />} />
            <Route path="photo" element={<PhotoMaxPage />} />
            <Route path="glowup" element={<GlowUpPage />} />
            <Route path="coach" element={<GlowUpCoachPage />} />
            <Route path="simulator" element={<StyleSimulatorPage />} />
            <Route path="gamification" element={<GamificationPage />} />
            <Route path="looksmax" element={<LooksmaxScorePage />} />
            <Route path="timeline" element={<TransformationTimelinePage />} />
            <Route path="makeup" element={<MakeupMaxPage />} />
            <Route path="hair" element={<HairMaxPage />} />
            <Route path="nails" element={<NailMaxPage />} />
            <Route path="fragrance" element={<FragranceMaxPage />} />
          </Route>
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </UserProfileProvider>
  </QueryClientProvider>
);

export default App;
