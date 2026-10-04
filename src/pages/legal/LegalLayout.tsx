import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { SITE, isPlaceholder } from "@/config/site";
import { usePageMeta } from "@/hooks/usePageMeta";

/** Highlights text that must be replaced with company-specific details. */
export const Ph = ({ children }: { children: ReactNode }) => <span className="placeholder-mark">[{children}]</span>;

/** Renders a config value, highlighting it if it's still a placeholder. */
export const Val = ({ v }: { v: string }) => (isPlaceholder(v) ? <span className="placeholder-mark">{v}</span> : <>{v}</>);

export const LegalLayout = ({
  title,
  description,
  toc,
  children,
}: {
  title: string;
  description: string;
  toc?: { id: string; label: string }[];
  children: ReactNode;
}) => {
  usePageMeta(title, description);
  const draft = isPlaceholder(SITE.legal.companyName);
  // Deep links like /privacy#digital-model land on that section.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
  }, [hash]);
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl font-semibold text-foreground sm:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: <Val v={SITE.legal.lastUpdated} />
        </p>
      </header>

      {draft && (
        <div
          role="note"
          className="mt-8 flex max-w-3xl gap-3 rounded-2xl border border-[hsl(42_70%_50%/0.3)] bg-[hsl(42_70%_50%/0.07)] p-4 text-sm leading-6 text-foreground"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(42_75%_70%)]" aria-hidden="true" />
          <p>
            <strong className="font-medium">Draft.</strong> Highlighted items in brackets are placeholders that still need
            company-specific details, and this document should be reviewed by a qualified lawyer before launch.
          </p>
        </div>
      )}

      <div className="mt-10 grid gap-12 lg:grid-cols-[220px_1fr]">
        {toc && (
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs text-muted-foreground">On this page</p>
              <ul className="mt-3 space-y-2">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="text-sm text-muted-foreground hover:text-foreground">
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
        <article className="prose-legal max-w-3xl">{children}</article>
      </div>
    </div>
  );
};
