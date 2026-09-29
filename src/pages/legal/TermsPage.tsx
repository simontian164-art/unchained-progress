import { Link } from "react-router-dom";
import { SITE } from "@/config/site";
import { LegalLayout, Ph, Val } from "./LegalLayout";

const TOC = [
  { id: "service", label: "The service" },
  { id: "eligibility", label: "Eligibility" },
  { id: "not-medical", label: "Not medical advice" },
  { id: "results", label: "No guaranteed results" },
  { id: "photos", label: "Your photos" },
  { id: "billing", label: "Subscriptions & billing" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "ip", label: "Our content" },
  { id: "liability", label: "Disclaimers & liability" },
  { id: "termination", label: "Termination" },
  { id: "law", label: "Governing law" },
  { id: "contact", label: "Contact" },
];

const TermsPage = () => (
  <LegalLayout title="Terms of Service" description={`The terms for using ${SITE.name}.`} toc={TOC}>
    <p>
      These terms are an agreement between you and <Val v={SITE.legal.companyName} /> (“we”, “us”) about your use of{" "}
      {SITE.name}. By joining the early-access list, creating an account or using the service, you agree to them.
    </p>

    <h2 id="service">The service</h2>
    <p>
      {SITE.name} analyzes photos you provide, together with your answers about your goals and routine, and gives you
      general appearance, grooming and style recommendations and a plan to follow. Features differ by plan as described on
      the <Link to="/pricing">pricing page</Link>.
    </p>

    <h2 id="eligibility">Eligibility</h2>
    <p>
      You must be at least <Ph>18</Ph> years old to use {SITE.name}. You're responsible for keeping your account
      credentials secure.
    </p>

    <h2 id="not-medical">Not medical advice</h2>
    <p>
      Recommendations are general cosmetic and lifestyle suggestions. They are not medical, dermatological or
      psychological advice, and {SITE.name} does not diagnose or treat any condition. Talk to a qualified professional
      before starting any skin treatment, supplement, diet or exercise program, and stop using any product that causes
      irritation.
    </p>

    <h2 id="results">No guaranteed results</h2>
    <p>
      Everyone is different. We don't promise any particular outcome, and we don't claim that following your plan will make
      you objectively more attractive.
    </p>

    <h2 id="photos">Your photos and content</h2>
    <ul>
      <li>Only upload photos of yourself, and only if you're allowed to share them.</li>
      <li>
        You keep ownership of your photos. You give us a limited permission to process them solely to provide the service
        to you, as described in the <Link to="/privacy">Privacy Policy</Link>. We don't use them for advertising.
      </li>
    </ul>

    <h2 id="billing">Subscriptions & billing</h2>
    <ul>
      <li>Paid plans are billed in advance, monthly or annually, and renew automatically until you cancel.</li>
      <li>You can cancel anytime from your account. You keep access until the end of the period you've already paid for.</li>
      <li>
        Refunds are covered by our <Link to="/refunds">Refund & Cancellation Policy</Link>.
      </li>
      <li>
        If we change prices, we'll tell you at least <Ph>number</Ph> days before the change applies to your next renewal.
      </li>
      <li>Prices shown don't include applicable taxes, which are added at checkout where required.</li>
      <li>Joining the early-access list is free and does not commit you to buying anything.</li>
    </ul>

    <h2 id="acceptable-use">Acceptable use</h2>
    <p>
      Don't upload photos of other people without their permission, photos of anyone under <Ph>18</Ph>, or unlawful
      content. Don't try to break, reverse-engineer or overload the service, or resell access to it.
    </p>

    <h2 id="ip">Our content</h2>
    <p>
      The service, including guides, plans and software, belongs to us or our licensors. You can use it for your own
      personal, non-commercial purposes while your plan is active.
    </p>

    <h2 id="liability">Disclaimers & limitation of liability</h2>
    <p>
      The service is provided “as is”. To the extent allowed by law, we're not liable for indirect or consequential losses,
      and our total liability is limited to the amount you paid us in the <Ph>12</Ph> months before the claim. Nothing in
      these terms limits rights you have under consumer protection law. <Ph>Legal review required for this section</Ph>
    </p>

    <h2 id="termination">Termination</h2>
    <p>
      You can stop using {SITE.name} and delete your account at any time. We may suspend accounts that break these terms.
      If we discontinue the service, we'll give reasonable notice and refund any prepaid, unused period.
    </p>

    <h2 id="law">Governing law</h2>
    <p>
      These terms are governed by the laws of <Val v={SITE.legal.jurisdiction} />, without affecting any mandatory rights
      you have where you live.
    </p>

    <h2 id="contact">Contact</h2>
    <p>
      Questions about these terms:{" "}
      <a href={`mailto:${SITE.supportEmail}`}>
        <Val v={SITE.supportEmail} />
      </a>
      .
    </p>
  </LegalLayout>
);

export default TermsPage;
