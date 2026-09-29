import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

/** Fades + lifts content in once when it scrolls into view. Respects reduced motion. */
export const Reveal = ({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) => {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
};

export const SectionHeading = ({
  eyebrow,
  title,
  body,
  align = "center",
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "center" | "left";
  id?: string;
}) => (
  <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h2 id={id} className="mt-3 font-display text-3xl font-semibold leading-[1.1] text-foreground sm:text-4xl">
      {title}
    </h2>
    {body && <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">{body}</p>}
  </div>
);
