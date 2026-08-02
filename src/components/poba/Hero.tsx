import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, Zap, ShieldCheck, Handshake, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOGO_SRC, logoRef, onLogoError } from "@/lib/assets";
import { LAUNCH_DATE_LABEL, useLaunched } from "@/lib/launch";

/** Three promises, each with a supporting line, as a row under the buttons. */
const promises = [
  { icon: Zap, title: "Fast Delivery", detail: "On-time, every time" },
  { icon: ShieldCheck, title: "Affordable", detail: "Best prices in Jonai" },
  { icon: Handshake, title: "Reliable Service", detail: "You can count on us" },
];

export function Hero() {
  // Looping motion is the kind that triggers motion sickness, so honour the
  // system setting rather than animating regardless.
  const reduceMotion = useReducedMotion();
  const launched = useLaunched();

  return (
    <section id="home" className="relative overflow-hidden bg-background">
      {/* The illustration is composed with its open sky on the left and the
          rider on the right, so it is anchored right and the copy sits in the
          space the artwork leaves. */}
      <div aria-hidden className="absolute inset-0">
        <img
          src="/hero-scene.jpg"
          alt=""
          className="h-full w-full object-cover object-right-bottom"
        />
        {/* Fades the artwork out behind the text. Vertical on phones, where the
            copy sits above the rider rather than beside them. */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background/30 lg:bg-gradient-to-r lg:from-background lg:via-background/90 lg:to-transparent" />
      </div>

      {/* Sits in the sky the artwork leaves open, so the mark is part of the
          scene instead of stacked under the header's copy of it. Desktop only:
          the layout collapses on phones and there is nowhere for it to go. */}
      <motion.img
        ref={logoRef}
        src={LOGO_SRC}
        onError={onLogoError}
        alt="Poba Express"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="pointer-events-none absolute right-[6%] top-24 z-10 hidden h-28 w-auto drop-shadow-[0_10px_24px_rgba(0,0,0,0.14)] xl:block xl:h-32"
      />

      <div className="relative pt-28 pb-20 lg:pt-32 lg:pb-28 mx-auto max-w-[120rem] px-5 lg:px-12 2xl:px-20">
        <div className="max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent"
          >
            <Rocket className="size-3.5" />
            Launching {LAUNCH_DATE_LABEL}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mt-5 text-4xl font-bold leading-[1.08] text-primary sm:text-5xl lg:text-6xl"
          >
            Jonai&apos;s Own
            <br />
            <span className="text-accent">Delivery Service</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Fast, affordable and reliable delivery of food, cake and medicine — from your favourite
            local shops right to your doorstep.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button variant="accent" size="xl" asChild>
              <a href="#order">
                {launched ? "Order Now" : "See the Menu"}
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button variant="outline" size="xl" className="rounded-full bg-card/80" asChild>
              <a href="#partners">Become a Partner</a>
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.42 }}
            className="mt-12 grid gap-5 sm:grid-cols-3"
          >
            {promises.map((p) => (
              <li key={p.title} className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <p.icon className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-primary">{p.title}</span>
                  <span className="block text-xs text-muted-foreground">{p.detail}</span>
                </span>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      <motion.a
        href="#services"
        aria-label="Scroll down"
        animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative mx-auto mb-8 hidden w-max flex-col items-center gap-1 text-muted-foreground sm:flex"
      >
        <span className="text-[11px] uppercase tracking-[0.25em]">Scroll</span>
        <ChevronDown className="size-5" />
      </motion.a>
    </section>
  );
}
