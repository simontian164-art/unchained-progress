import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { SITE } from "@/config/site";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", to: "/#how-it-works" },
      { label: "Example analysis", to: "/example" },
      { label: "What we analyze", to: "/#what-we-analyze" },
      { label: "Pricing", to: "/pricing" },
      { label: "FAQ", to: "/#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Refund & Cancellation", to: "/refunds" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", to: "/contact" },
      { label: "Photo privacy", to: "/privacy#photos" },
      { label: "Cookies", to: "/privacy#cookies" },
      { label: "Delete my data", to: "/privacy#deletion" },
    ],
  },
];

export const SiteFooter = () => (
  <footer className="border-t border-white/[0.07]">
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            A 90-day plan for your hair, skin, grooming and style, built from your photos and answers.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            <a href={`mailto:${SITE.supportEmail}`} className="text-foreground underline-offset-4 hover:underline">
              {SITE.supportEmail}
            </a>
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-medium text-foreground">{col.title}</h2>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.07] pt-6 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-start sm:justify-between">
        <p>
          © {new Date().getFullYear()} {SITE.legal.companyName}. All rights reserved.
        </p>
        <p className="max-w-xl sm:text-right">
          {SITE.name} provides general appearance and grooming suggestions. It is not medical advice and does not diagnose
          skin or health conditions. Results vary by person.
        </p>
      </div>
    </div>
  </footer>
);
