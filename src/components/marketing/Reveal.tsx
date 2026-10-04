import { createElement, ReactNode } from "react";

/**
 * Formerly a fade-in-on-scroll wrapper. Content now simply renders: fading every section in as you
 * scroll is a template tell and delays reading. Kept as a passthrough so call sites stay simple;
 * motion is reserved for moments that mean something (rewards, the analysis sequence).
 */
export const Reveal = ({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) => createElement(as, { className }, children);

/**
 * Section heading: left-aligned, no badge above it. On wide screens the section's name sits in a
 * quiet left rail (no numbers: the sections aren't a sequence), and the heading carries the message.
 */
export const SectionHeading = ({
  eyebrow,
  index,
  title,
  body,
  id,
}: {
  eyebrow?: string;
  index?: number;
  title: ReactNode;
  body?: ReactNode;
  align?: "center" | "left";
  id?: string;
}) => (
  <div className="grid gap-4 lg:grid-cols-[200px_1fr] lg:gap-12">
    <p className="hidden pt-2 text-sm text-muted-foreground lg:block">
      {eyebrow}
    </p>
    <div className="max-w-2xl">
      <h2 id={id} className="font-display text-3xl font-semibold leading-[1.08] text-foreground sm:text-[2.6rem]">
        {title}
      </h2>
      {body && <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">{body}</p>}
    </div>
  </div>
);
