import { Link } from "react-router-dom";
import { Mail, ShieldCheck, Receipt } from "lucide-react";
import { SITE } from "@/config/site";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Val, Ph } from "./LegalLayout";

const CARDS = [
  {
    icon: Mail,
    title: "Support",
    body: "Questions about your plan, analysis or account.",
    email: SITE.supportEmail,
  },
  {
    icon: ShieldCheck,
    title: "Privacy & data deletion",
    body: "Access, correct or delete your data, including photos.",
    email: SITE.privacyEmail,
  },
  {
    icon: Receipt,
    title: "Billing & refunds",
    body: "Cancellations, refunds and invoices.",
    email: SITE.supportEmail,
  },
];

const ContactPage = () => {
  usePageMeta("Contact", `Get in touch with the ${SITE.name} team.`);
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
      <p className="eyebrow">Contact</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-foreground sm:text-5xl">How can we help?</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
        Email is the fastest way to reach us. We usually reply within <Ph>1–2 business days</Ph>.
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {CARDS.map((c) => (
          <li key={c.title} className="surface-card flex flex-col rounded-2xl p-6">
            <c.icon className="h-5 w-5 text-silver-bright" aria-hidden="true" />
            <h2 className="mt-4 font-display text-base font-semibold text-foreground">{c.title}</h2>
            <p className="mt-1.5 flex-1 text-sm leading-6 text-muted-foreground">{c.body}</p>
            <a href={`mailto:${c.email}`} className="mt-4 break-all text-sm text-foreground underline underline-offset-4">
              <Val v={c.email} />
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-10 surface-inset rounded-2xl p-6 text-sm leading-6 text-muted-foreground">
        <p className="font-medium text-foreground">Company details</p>
        <p className="mt-2">
          <Val v={SITE.legal.companyName} />
          <br />
          <Val v={SITE.legal.companyAddress} />
        </p>
        <p className="mt-4">
          See also: <Link to="/privacy" className="text-foreground underline underline-offset-4">Privacy Policy</Link> ·{" "}
          <Link to="/terms" className="text-foreground underline underline-offset-4">Terms</Link> ·{" "}
          <Link to="/refunds" className="text-foreground underline underline-offset-4">Refunds</Link>
        </p>
      </div>
    </div>
  );
};

export default ContactPage;
