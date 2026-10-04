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
  { id: "cookies", label: "Cookies & local storage" },
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
        answers are stored in your browser's local storage on your device.
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
      Photos you take or upload are used only to generate your appearance analysis and personalized recommendations and, if you choose to save them,
      to show your progress over time. We do not use your photos to identify you, to build a
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
      In the current version, your photos (setup photos and check-ins), answers, plan and progress are saved only in your
      browser's local storage on your device. They are not uploaded to or stored on our servers, and we cannot see them.
      Photos are downscaled on your device before they're saved.
    </p>
    <p>
      <Ph>If you later add accounts that sync data to a server, describe the storage provider and region, encryption you
      can verify, and who can access it, and ask users before moving existing photos off their device.</Ph>
    </p>
    <h3>Retention</h3>
    <p>
      Data stays in your browser until you delete it: remove single check-ins on the Progress page, delete everything in
      Settings, or clear this site's data in your browser settings. Because it only exists on your device, clearing browser
      data also removes it permanently. You can export a copy from Settings first.
    </p>
    <h3>Digital You (body and profile photos)</h3>
    <p>
      If you build a Digital You profile, you add a face-and-shoulders photo, optional profile photos, a full-body photo
      and optional side photo, plus your height, weight, age range and any body measurements you choose to enter. Each
      photo is checked on your device (size, and that only one person is in it) and re-saved without its metadata,
      including location. Measurements are self-reported and are not medical measurements.
    </p>
    <p>
      Until accounts launch, Digital You is stored only in your browser on this device. Once you sign in to an account,
      it's stored in a private storage area that only your account can access (enforced by row-level security), and
      shown to you through short-lived links. You can replace or delete any single photo, or delete your whole Digital
      You profile, from the You tab. Deleting the profile also deletes your digital model and any looks generated from it.
    </p>
    <h3 id="digital-model">Digital model (AI-generated)</h3>
    <p>
      If you choose to create a digital model, and tick the box agreeing to it, our server sends your front face photo
      to FASHN, our image-generation provider, which builds an upper-body model from it. Only that photo is sent: not
      your name, email address, measurements or other photos. The app never contacts FASHN directly and never holds a
      key for it.
    </p>
    <p>
      FASHN deletes its processing copy of your photo when the job finishes (with an automatic clean-up after one day
      at the latest), keeps the generated image for up to 60 minutes so our server can collect it, and does not use
      customer content to train AI models. The generated model is then stored in your private storage area, separately
      from your original photo, which is never changed. If you don't keep a result, it's deleted when you generate
      another or keep a different one. You can delete your model at any time from the You tab, and deleting Digital You
      deletes it too. The model's body shape is estimated from your face; it is not a measurement.
      <Ph>Confirm FASHN's processing location and sign their Data Processing Addendum before launch.</Ph>
    </p>
    <h3>Third-party AI services</h3>
    <p>
      The only third-party AI service that receives your data is FASHN, and only for the digital model described
      above, when you ask for one. Face analysis during onboarding runs on your device.
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
      <li>To send occasional product updates if you agreed to receive them. You can unsubscribe anytime.</li>
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
      You can delete everything the app has saved at any time in Settings → Delete everything, and export a copy first
      with Export my data. To delete information we hold on our side,
      including your early-access sign-up, email{" "}
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

    <h2 id="cookies">Cookies and local storage</h2>
    <p>
      {SITE.name} doesn't use advertising cookies, analytics, tracking pixels or session recording. The site sets no
      cookies of its own. The app uses your browser's local storage to keep your answers, photos, plan, progress and
      settings on your device, because the app can't work without it. These are strictly necessary for the service you
      asked for, so no cookie banner is shown. Fonts are served from our own site, not from a third party.
    </p>
    <p>
      Two third-party requests can happen, only when you act: the face scan downloads its open-source model from Google's
      tfhub.dev (your photo is not sent), and links such as "Find near me" or "Search online" open Google Maps, Google
      Shopping or a retailer in a new tab. <Ph>If you add analytics or any tracking later, list it here and ask for consent
      first where required.</Ph>
    </p>

    <h2 id="children">Age requirement</h2>
    <p>
      {SITE.name} is intended for people aged <Ph>18</Ph> and over. Setup asks for your age range and stops if you're
      under 18. We don't knowingly collect information from anyone younger. If you believe someone under that age has used the service, contact us and we'll delete their information.
    </p>

    <h2 id="changes">Changes to this policy</h2>
    <p>
      If we make material changes (for example, starting to store photos on our servers or using a new AI provider), we'll
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
