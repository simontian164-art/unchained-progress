import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import StarterPage from "./pages/StarterPage";
import MembershipPage from "./pages/MembershipPage";
import PreviewPage from "./pages/PreviewPage";
import CheckoutPage from "./pages/CheckoutPage";
import HubPage from "./pages/HubPage";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StarterPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/hub" element={<HubPage />} />
          <Route path="/hub/skin" element={<SkinMaxPage />} />
          <Route path="/hub/style" element={<StyleMaxPage />} />
          <Route path="/hub/body" element={<BodyMaxPage />} />
          <Route path="/hub/iq" element={<IQMaxPage />} />
          <Route path="/hub/presence" element={<PresenceMaxPage />} />
          <Route path="/hub/money" element={<MoneyMaxPage />} />
          <Route path="/hub/face-analyzer" element={<FaceAnalyzerPage />} />
          <Route path="/hub/attractiveness" element={<AttractivenessPage />} />
          <Route path="/hub/golden-ratio" element={<GoldenRatioPage />} />
          <Route path="/hub/jawline" element={<JawlineAnalyzerPage />} />
          <Route path="/hub/cheekbone" element={<CheekboneAnalyzerPage />} />
          <Route path="/hub/eyes" element={<EyeAnalyzerPage />} />
          <Route path="/hub/nose" element={<NoseAnalyzerPage />} />
          <Route path="/hub/harmony" element={<FaceHarmonyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
