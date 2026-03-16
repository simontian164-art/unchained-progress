import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProfileProvider } from "@/contexts/UserProfileContext";

import StarterPage from "./pages/StarterPage";
import MembershipPage from "./pages/MembershipPage";
import PreviewPage from "./pages/PreviewPage";
import CheckoutPage from "./pages/CheckoutPage";
import IntroPage from "./pages/IntroPage";
import HubPage from "./pages/HubPage";
import HubLayout from "./components/HubLayout";
import NotFound from "./pages/NotFound";

import SkinMaxPage from "./pages/modules/SkinMaxPage";
import StyleMaxPage from "./pages/modules/StyleMaxPage";
import BodyMaxPage from "./pages/modules/BodyMaxPage";
import IQMaxPage from "./pages/modules/IQMaxPage";
import PresenceMaxPage from "./pages/modules/PresenceMaxPage";
import MoneyMaxPage from "./pages/modules/MoneyMaxPage";
import FaceAnalyzerPage from "./pages/FaceAnalyzerPage";
import AttractivenessPage from "./pages/AttractivenessPage";
import GoldenRatioPage from "./pages/GoldenRatioPage";
import JawlineAnalyzerPage from "./pages/JawlineAnalyzerPage";
import CheekboneAnalyzerPage from "./pages/CheekboneAnalyzerPage";
import EyeAnalyzerPage from "./pages/EyeAnalyzerPage";
import NoseAnalyzerPage from "./pages/NoseAnalyzerPage";
import FaceHarmonyPage from "./pages/FaceHarmonyPage";
import BeardStylePage from "./pages/BeardStylePage";
import HairlineAnalyzerPage from "./pages/HairlineAnalyzerPage";
import GroomingMaxPage from "./pages/modules/GroomingMaxPage";
import StyleMaxDashboard from "./pages/modules/StyleMaxDashboard";
import FaceMaxPage from "./pages/FaceMaxPage";
import PhotoMaxPage from "./pages/modules/PhotoMaxPage";
import GlowUpPage from "./pages/GlowUpPage";
import GlowUpCoachPage from "./pages/GlowUpCoachPage";
import StyleSimulatorPage from "./pages/modules/StyleSimulatorPage";
import GamificationPage from "./pages/GamificationPage";
import LooksmaxScorePage from "./pages/LooksmaxScorePage";
import TransformationTimelinePage from "./pages/TransformationTimelinePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProfileProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StarterPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/intro" element={<IntroPage />} />
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
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
