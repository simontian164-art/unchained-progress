import { Link } from "react-router-dom";
import { SITE } from "@/config/site";
import { LegalLayout, Ph, Val } from "./LegalLayout";

const TOC = [
  { id: "summary", label: "Summary" },
  { id: "collect", label: "What we collect" },
  { id: "photos", label: "Photos & face analysis" },
  { id: "use", label: "How we use it" },
  { id: "sharing", label: "Who we share it with" },
  { id: "retention", label: "How long we keep it" },
  { id: "deletion", label: "Deleting your data" },
  { id: "rights", label: "Your rights" },
  { id: "security", label: "Security" },
  { id: "children", label: "Age requirement" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
];

const PrivacyPage = () => (
  <LegalLayout
    title="Privacy Policy"
    description="How we handle your photos, face analysis data and personal information."
    toc={TOC}
  >
    <p>
      This policy explains what information {SITE.name} (“we”, “us”) collects, how photos used for appearance analysis are
      handled, and the choices you have. {SITE.name} is operated by <Val v={SITE.legal.companyName} />,{" "}
      <Val v={SITE.legal.companyAddress} />.
    </p>

    <h2 id="summary">Summary</h2>
    <ul>
      <li>
        <strong className="text-foreground">The face scan runs on your device.</strong> In the current version, facial
        landmark detection runs in your web browser. The photo or camera frame used for the scan is not uploaded to our
        servers.
      </li>
      <li>We don't give attractiveness scores and we don't use your face to identify you.</li>
      <li>We don't sell your photos or personal information, and we don't use your photos for advertising.</li>
      <li>You can ask us to delete your data at any time.</li>
    </ul>

    <h2 id="collect">What we collect</h2>
    <h3>Information you give us</h3>
    <ul>
      <li>
        <strong className="text-foreground">Early-access sign-ups:</strong> your email address, and optionally your first
        name, chosen plan and main goal.
      </li>
      <li>
        <strong className="text-foreground">Account information</strong> (once accounts are available): email address and
        login credentials. <Ph>Describe authentication provider, e.g. Supabase Auth / Lovable Cloud</Ph>
      </li>
      <li>
        <strong className="text-foreground">Profile answers:</strong> goals, current routine, and optional details such as
        gender and ethnicity, which are used only to tailor skin-care and style suggestions. In the current version these
        answers are stored in your browser's local storage on your device. <Ph>Update if profile data is moved to a server</Ph>
      </li>
      <li>
        <strong className="text-foreground">Payment information</strong> (once payments are available): handled by our
        payment processor <Ph>e.g. Stripe</Ph>. We never see or store your full card number.
      </li>
    </ul>
    <h3>Information collected automatically</h3>
    <p>
      Our hosting provider may log basic technical data such as IP address, browser type and pages requested, for security
      and reliability. <Ph>List any analytics tools, e.g. none / Plausible / Google Analytics, and cookies used</Ph>
    </p>

    <h2 id="photos">Photos & face analysis</h2>
    <h3>What photos are used for</h3>
    <p>
      Photos you take or upload are used only to generate your appearance analysis and personalized recommendations, and —
      if you choose to save them — to show your progress over time. We do not use your photos to identify you, to build a
      facial-recognition template, or for advertising.
    </p>
    <h3>How the face scan works</h3>
    <p>
      The face scan uses an open-source landmark detection model (TensorFlow.js Face Landmarks Detection) that runs inside
      your browser. Your browser downloads the model files from a public content delivery network; your image is not sent
      with that request. The scan measures the position of points on your face (for example eyes, nose, mouth and jaw) to
      inform suggestions such as haircut and beard shape.
    </p>
    <h3>Are photos stored?</h3>
    <p>
      In the current version, photos used for the face scan are held temporarily in your browser's memory while the page
      is open and are not uploaded to or stored on our servers.
    </p>
    <p>
      If you choose to save check-in photos for progress tracking, they will be stored <Ph>storage provider and region,
      e.g. Supabase Storage, Canada/US</Ph>, <Ph>encryption details you can verify</Ph>, and accessible only to your
      account. We will ask for your permission before any photo is saved.
    </p>
    <h3>Retention</h3>
    <p>
      Saved photos are kept until you delete them or close your account, and are removed from our systems within{" "}
      <Ph>number</Ph> days of deletion, including backups within <Ph>number</Ph> days.
    </p>
    <h3>Third-party AI services</h3>
    <p>
      In the current version, no third-party AI service receives your photos. <Ph>If you add an external AI provider
      (e.g. OpenAI, Google, Anthropic, Replicate), name it here, state what it receives, where it processes data, how long
      it retains data, and whether it may use data for training.</Ph>
    </p>
    <h3>Sensitive information</h3>
    <p>
      Images of your face and measurements derived from them may be considered biometric or sensitive information in some
      places. We process them only with your consent and only to provide the service. <Ph>Legal review: confirm
      requirements for your users' locations, e.g. PIPEDA / Quebec Law 25, GDPR, Illinois BIPA, Texas CUBI</Ph>
    </p>

    <h2 id="use">How we use your information</h2>
    <ul>
      <li>To provide your analysis, plan and progress tracking.</li>
      <li>To contact you about your early-access spot, account and subscription.</li>
      <li>To send occasional product updates if you agreed to receive them — you can unsubscribe anytime.</li>
      <li>To keep the service secure and working properly.</li>
    </ul>

    <h2 id="sharing">Who we share it with</h2>
    <p>
      We share information only with service providers that help us run {SITE.name}, under contracts that limit their use
      of it: <Ph>list processors, e.g. hosting (Lovable), database/auth (Supabase), payments (Stripe), email (Resend)</Ph>.
      We may disclose information if required by law. We do not sell personal information.
    </p>

    <h2 id="retention">How long we keep it</h2>
    <ul>
      <li>Early-access sign-ups: until you unsubscribe or ask us to remove you, or <Ph>period</Ph> after launch.</li>
      <li>Account data: while your account is open, then deleted within <Ph>number</Ph> days of closure.</li>
      <li>Billing records: as long as required for tax and accounting law <Ph>period for your jurisdiction</Ph>.</li>
    </ul>

    <h2 id="deletion">Deleting your data</h2>
    <p>
      You can delete saved photos yourself from your account at any time. To delete everything associated with you —
      including your early-access sign-up — email{" "}
      <a href={`mailto:${SITE.privacyEmail}`}>
        <Val v={SITE.privacyEmail} />
      </a>{" "}
      from the address you signed up with. We will confirm when it's done, within <Ph>number</Ph> days.
    </p>
    <p>
      Profile answers stored in your browser can be removed at any time by clearing this site's data in your browser
      settings.
    </p>

    <h2 id="rights">Your rights</h2>
    <p>
      Depending on where you live, you may have the right to access, correct, delete or export your personal information,
      and to withdraw consent. Contact us to make a request. <Ph>Legal review: add region-specific rights and your
      regulator's contact details</Ph>
    </p>

    <h2 id="security">Security</h2>
    <p>
      We use reasonable technical and organizational measures to protect your information. No method of transmission or
      storage is completely secure, so we can't guarantee absolute security.
    </p>

    <h2 id="children">Age requirement</h2>
    <p>
      {SITE.name} is intended for people aged <Ph>18</Ph> and over. We don't knowingly collect information from anyone
      younger. If you believe someone under that age has used the service, contact us and we'll delete their information.
    </p>

    <h2 id="changes">Changes to this policy</h2>
    <p>
      If we make material changes — for example, starting to store photos on our servers or using a new AI provider — we'll
      update this page and notify you before the change affects your data.
    </p>

    <h2 id="contact">Contact</h2>
    <p>
      Privacy questions or requests:{" "}
      <a href={`mailto:${SITE.privacyEmail}`}>
        <Val v={SITE.privacyEmail} />
      </a>
      . General support: <Link to="/contact">contact page</Link>.
    </p>
  </LegalLayout>
);

export default PrivacyPage;
