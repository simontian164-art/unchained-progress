import { Route, Routes } from "react-router-dom";
import { AppStateProvider } from "./store";
import AppLayout from "./AppLayout";
import Onboarding from "./pages/Onboarding";
import Today from "./pages/Today";
import Plan from "./pages/Plan";
import Report from "./pages/Report";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Barber from "./pages/Barber";
import Shop from "./pages/Shop";
import Guides from "./pages/Guides";
import NotFound from "@/pages/NotFound";

/**
 * The member app, mounted at /app/*.
 * TODO(backend): wrap in an auth + active-subscription guard once accounts and Stripe exist.
 */
const MemberApp = () => (
  <AppStateProvider>
    <Routes>
      <Route path="start" element={<Onboarding />} />
      <Route element={<AppLayout />}>
        <Route index element={<Today />} />
        <Route path="plan" element={<Plan />} />
        <Route path="analysis" element={<Report />} />
        <Route path="progress" element={<Progress />} />
        <Route path="settings" element={<Settings />} />
        <Route path="barber" element={<Barber />} />
        <Route path="shop" element={<Shop />} />
        <Route path="guides" element={<Guides />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </AppStateProvider>
);

export default MemberApp;
