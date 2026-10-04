import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { RingLoader } from "./visuals/ring/Moments";
import { AppStateProvider } from "./store";
import AppLayout from "./AppLayout";
import Guest from "./pages/Guest";
import Onboarding from "./pages/Onboarding";
import Today from "./pages/Today";
import Plan from "./pages/Plan";
import Report from "./pages/Report";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Barber from "./pages/Barber";
import Shop from "./pages/Shop";
import Guides from "./pages/Guides";
import Briefing from "./pages/Briefing";
import CheckIn from "./pages/CheckIn";
import You from "./pages/You";
import DigitalScan from "./pages/DigitalScan";
import DigitalModel from "./pages/DigitalModel";
import NotFound from "@/pages/NotFound";

/**
 * The member app, mounted at /app/*.
 * TODO(backend): wrap in an auth + active-subscription guard once accounts and Stripe exist.
 */
/** Once per browser session, returning members get the ring loader as the app opens. */
const BootLoader = () => {
  const [show, setShow] = useState(() => {
    try {
      if (sessionStorage.getItem("gm_boot")) return false;
      const st = JSON.parse(localStorage.getItem("glowmax_app_v1") || "null");
      return !!st?.analyses?.length;
    } catch {
      return false;
    }
  });
  if (!show) return null;
  return (
    <RingLoader
      ready
      onDone={() => {
        try { sessionStorage.setItem("gm_boot", "1"); } catch { /* ignore */ }
        setShow(false);
      }}
    />
  );
};

const MemberApp = () => (
  <AppStateProvider>
    <BootLoader />
    <Route path="guest" element={<Guest />} />
      <Routes>
      <Route path="start" element={<Onboarding />} />
      <Route path="you/scan" element={<DigitalScan />} />
      <Route path="you/model" element={<DigitalModel />} />
      <Route element={<AppLayout />}>
        <Route index element={<Today />} />
        <Route path="plan" element={<Plan />} />
        <Route path="analysis" element={<Report />} />
        <Route path="progress" element={<Progress />} />
        <Route path="settings" element={<Settings />} />
        <Route path="barber" element={<Barber />} />
        <Route path="shop" element={<Shop />} />
        <Route path="guides" element={<Guides />} />
        <Route path="briefing" element={<Briefing />} />
        <Route path="checkin" element={<CheckIn />} />
        <Route path="you" element={<You />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </AppStateProvider>
);

export default MemberApp;
