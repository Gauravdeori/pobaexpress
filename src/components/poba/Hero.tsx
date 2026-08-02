import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, Zap, ShieldCheck, Handshake, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BANNER_SRC, onPhotoError, photoRef } from "@/lib/assets";
import { LAUNCH_DATE_LABEL, useLaunched } from "@/lib/launch";

/** Three promises, each with a supporting line, as a row under the buttons. */
const promises = [
  { icon: Zap, title: "Fast Delivery", detail: "On-time, every time" },
  { icon: ShieldCheck, title: "Affordable", detail: "Best prices in Jonai" },
  { icon: Handshake, title: "Reliable Service", detail: "You can count on us" },
];

/** Chips that float over the photo. */
const badges = [
  { icon: Zap, label: "Fast Delivery", pos: "-left-4 top-10" },
  { icon: ShieldCheck, label: "Safe", pos: "-right-4 top-1/2" },
  { icon: Handshake, label: "Reliable", pos: "left-6 -bottom-5" },
];

export function Hero() {
  // Looping motion is the kind that triggers motion sickness, so honour the
  // system setting rather than animating regardless.
  const reduceMotion = useReducedMotion();
  const launched = useLaunched();

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-background pt-28 pb-20 lg:pt-36 lg:pb-28"
    >
      {/* Soft shapes stand in for the illustrated landscape — they give the
          cream page some depth without competing with the copy. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-[32rem] rounded-full bg-accent/8 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 size-[28rem] rounded-full bg-accent/6 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent"
          >
            <Rocket className="size-3.5" />
            Launching {LAUNCH_DATE_LABEL}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 text-4xl font-bold leading-[1.08] text-primary sm:text-5xl lg:text-6xl"
          >
            Jonai&apos;s Own
            <br />
            <span className="text-accent">Delivery Service</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Fast, affordable and reliable delivery of food, cake and medicine — from your favourite
            local shops right to your doorstep.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button variant="accent" size="xl" asChild>
              <a href="#order">
                {launched ? "Order Now" : "See the Menu"}
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button variant="outline" size="xl" className="rounded-full" asChild>
              <a href="#partners">Become a Partner</a>
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.42 }}
            className="mt-12 grid gap-6 sm:grid-cols-3"
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

        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={
            reduceMotion
              ? { duration: 0.4 }
              : { type: "spring", stiffness: 90, damping: 16, delay: 0.2 }
          }
          className="relative mx-auto w-full max-w-lg"
        >
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="overflow-hidden rounded-4xl bg-secondary shadow-lift"
          >
            <img
              ref={photoRef}
              src={BANNER_SRC}
              onError={onPhotoError}
              alt="Forest road through the hills of Jonai, Assam"
              className="h-[22rem] w-full object-cover sm:h-[26rem]"
            />
          </motion.div>

          {badges.map((b, i) => (
            <motion.div
              key={b.label}
              animate={reduceMotion ? undefined : { y: [0, i % 2 === 0 ? -9 : 9, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute ${b.pos} flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-primary shadow-soft`}
            >
              <b.icon className="size-4 text-accent" />
              {b.label}
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.a
        href="#services"
        aria-label="Scroll down"
        animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-16 hidden flex-col items-center gap-1 text-muted-foreground sm:flex"
      >
        <span className="text-[11px] uppercase tracking-[0.25em]">Scroll</span>
        <ChevronDown className="size-5" />
      </motion.a>
    </section>
  );
}
