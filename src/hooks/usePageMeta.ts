import { useEffect } from "react";
import { SITE } from "@/config/site";

/** Sets document title + meta description per route (SPA-friendly). */
export const usePageMeta = (title?: string, description?: string) => {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description ?? SITE.description);
  }, [title, description]);
};
