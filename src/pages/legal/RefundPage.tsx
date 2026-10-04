import { SITE } from "@/config/site";
import { LegalLayout, Ph, Val } from "./LegalLayout";

const RefundPage = () => (
  <LegalLayout
    title="Refund & Cancellation Policy"
    description="How to cancel your subscription and when refunds apply."
    toc={[
      { id: "cancel", label: "Cancelling" },
      { id: "refunds", label: "Refunds" },
      { id: "annual", label: "Annual plans" },
      { id: "request", label: "How to request a refund" },
      { id: "early-access", label: "Early access" },
    ]}
  >
    <h2 id="cancel">Cancelling</h2>
    <ul>
      <li>You can cancel anytime from your account settings, or by emailing us.</li>
      <li>Cancelling stops future renewals. You keep full access until the end of the period you've already paid for.</li>
      <li>There are no cancellation fees.</li>
    </ul>

    <h2 id="refunds">Refunds</h2>
    <p>
      <Ph>Choose and state one clear policy. Example: “If you're not happy, email us within 14 days of your first payment
      and we'll refund it in full, no questions asked. After that, payments are non-refundable except where required by
      law.”</Ph>
    </p>
    <p>
      Nothing in this policy affects refund rights you have under the consumer protection laws where you live.
    </p>

    <h2 id="annual">Annual plans</h2>
    <p>
      <Ph>State whether annual plans can be refunded pro-rata after the initial refund window, e.g. “Annual plans can be
      refunded within 14 days of purchase or renewal.”</Ph>
    </p>

    <h2 id="request">How to request a refund</h2>
    <p>
      Email{" "}
      <a href={`mailto:${SITE.supportEmail}`}>
        <Val v={SITE.supportEmail} />
      </a>{" "}
      from the address on your account. Approved refunds go back to the original payment method, usually within{" "}
      <Ph>5–10</Ph> business days depending on your bank.
    </p>

    <h2 id="early-access">Early access</h2>
    <p>Joining the early-access list is free. You won't be charged unless you choose a plan and complete checkout.</p>
  </LegalLayout>
);

export default RefundPage;
