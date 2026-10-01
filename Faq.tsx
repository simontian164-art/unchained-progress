import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SITE } from "@/config/site";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "How does the analysis work?",
    a: (
      <>
        You add three photos — front, side and full body — and answer a few questions about your goals and current routine.
        The face scan maps facial landmarks in your browser. We combine that with your answers to find the areas you can
        realistically change (haircut, skin care, grooming, clothing fit, posture) and turn them into a prioritized plan
        with specific steps. <Link to="/example" className="underline underline-offset-4">See an example</Link>.
      </>
    ),
  },
  {
    q: "Do you rate my attractiveness?",
    a: "No. You won't get an attractiveness score, a rank, or a comparison with other people. You'll see what's already working in your favor and the changes most likely to make a visible difference for the goal you set.",
  },
  {
    q: "Are my photos stored?",
    a: (
      <>
        Your photos are scanned and saved only in your browser, on your device. They aren't uploaded to our servers,
        which also means they don't sync between devices yet. Full details are in the{" "}
        <Link to="/privacy#photos" className="underline underline-offset-4">Privacy Policy</Link>.
      </>
    ),
  },
  {
    q: "Can I delete my photos?",
    a: (
      <>
        Yes. Delete single check-in photos on the Progress page, or everything at once in Settings → Delete everything. To
        remove your early-access sign-up too, email{" "}
        <a href={`mailto:${SITE.privacyEmail}`} className="underline underline-offset-4">{SITE.privacyEmail}</a>.
      </>
    ),
  },
  {
    q: "Can I redo my analysis?",
    a: "Yes. You can update your answers anytime and your plan rebuilds. New photo analyses are spaced at least 2 weeks apart (monthly on Essentials), because real changes take that long to show and re-scanning more often mostly picks up lighting differences.",
  },
  {
    q: "What do I receive?",
    a: "What's already working, your top 3 priorities, and a breakdown of face shape, hair and hairline, facial hair, skin, eyes and brows, smile habits and style (plus body on Plus). You also get haircut options with a card to show your barber, a morning and evening routine, a shopping list with local and online search, and clear notes on when to see a professional.",
  },
  {
    q: "How long does it take?",
    a: "Adding photos and answering the questions takes about five minutes. The face scan itself takes a few seconds.",
  },
  {
    q: "Can I cancel anytime?",
    a: (
      <>
        Yes. Cancel whenever you like and you keep access until the end of the period you've paid for. See the{" "}
        <Link to="/refunds" className="underline underline-offset-4">refund & cancellation policy</Link>.
      </>
    ),
  },
  {
    q: "Is this medical advice?",
    a: "No. We give general appearance, grooming and style suggestions. We don't diagnose skin, hair or health conditions. For acne, hair loss, irritation or anything that worries you, talk to a dermatologist or doctor.",
  },
];

export const Faq = () => (
  <Accordion type="single" collapsible className="mx-auto max-w-3xl">
    {FAQS.map((f, i) => (
      <AccordionItem key={f.q} value={`q${i}`} className="border-white/[0.08]">
        <AccordionTrigger className="py-5 text-left text-base font-medium text-foreground hover:no-underline">
          {f.q}
        </AccordionTrigger>
        <AccordionContent className="pb-5 text-[15px] leading-7 text-muted-foreground">{f.a}</AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);
