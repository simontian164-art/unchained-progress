import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getJobs, markSeen, pollAll, subscribe } from "./tryOn";

/** Lives app-wide: resumes unfinished try-ons and notifies when a look is ready. */
export default function TryOnWatcher() {
  const nav = useNavigate();
  const told = useRef(new Set<string>());
  useEffect(() => {
    const check = async () => {
      for (const j of await getJobs()) {
        if (j.status === "complete" && !j.seen && !told.current.has(j.id) && !location.pathname.startsWith("/app/you/style")) {
          told.current.add(j.id);
          toast.success("Your look is ready", { action: { label: "View", onClick: () => nav("/app/you/style") } });
          void markSeen(j.id);
        }
      }
    };
    void pollAll();
    void check();
    return subscribe(() => void check());
  }, [nav]);
  return null;
}
