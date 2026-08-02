import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, Zap, ShieldCheck, Handshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLaunched } from "@/lib/launch";

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
      {/* Photograph of Jonai behind the whole section. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <img src="/hero-bg.jpg" alt="" className="h-full w-full object-cover object-center" />
        {/* Legibility comes from one scrim shaped around the copy, not from a
            flat wash over the whole frame — a wash dulls the parts of the photo
            nothing is sitting on, which is most of it. Body copy in
            muted-foreground needs the cream at close to full strength to clear
            4.5:1, so the scrim holds solid across the copy column and only then
            falls away: down the page on phones, across from the rider on
            desktop. */}
        <div className="absolute inset-0 bg-gradient-to-b from-background from-30% via-background/70 via-62% to-transparent to-88% lg:bg-gradient-to-r lg:from-28% lg:via-background/55 lg:via-52% lg:to-78%" />
      </div>

      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 mx-auto max-w-[120rem] px-6 lg:px-12 2xl:px-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text and Actions */}
          <div className="max-w-xl z-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="mb-4 text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase"
            >
              Poba Express
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="text-5xl font-extrabold leading-[1.1] text-primary sm:text-6xl lg:text-7xl tracking-tight"
            >
              Jonai&apos;s Own
              <br />
              Delivery Service
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24 }}
              className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              Fast, affordable and reliable delivery of food, cake and medicine — from your
              favourite local shops right to your doorstep.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.32 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              {/* Ordering does not open until launch day, so the label has to
                  agree with the header, the sticky bar and the form itself —
                  all of which offer the menu until then. */}
              <Button variant="hero" size="xl" className="font-semibold" asChild>
                <a href="#order">
                  {launched ? "Order Now" : "See the Menu"}
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="border-border bg-card font-semibold text-foreground shadow-sm hover:bg-card/90 hover:text-foreground"
                asChild
              >
                <a href="#partners">
                  Become a Partner
                  <Handshake className="size-4 text-muted-foreground" />
                </a>
              </Button>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.42 }}
              className="mt-16 flex flex-wrap gap-x-8 gap-y-6"
            >
              {promises.map((p) => (
                <li key={p.title} className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card shadow-sm text-primary">
                    <p.icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-primary">{p.title}</span>
                    <span className="block text-xs font-medium text-muted-foreground">
                      {p.detail}
                    </span>
                  </span>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Right Column: Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, type: "spring", stiffness: 50 }}
            className="relative w-full flex justify-center lg:justify-end items-center mt-12 lg:mt-0"
          >
            {/* The rider is drawn side-on at street level and the photo behind
                it was shot from the air, so the two never share a horizon and
                the cut-out reads as a sticker floating over the valley. The
                halo separates it from the busy photo, and the ellipse sits
                under the wheels so the scooter has something to stand on. Both
                are drawn before the artwork so it paints over them. */}
            <div className="relative w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[460px] xl:max-w-[560px]">
              <div
                aria-hidden
                className="spotlight absolute left-1/2 top-1/2 aspect-square w-[118%] -translate-x-1/2 -translate-y-1/2"
              />
              {/* Traced from the artwork: the wheels bottom out at 94% of its
                  height and the scooter spans 26%–90% across. */}
              <div
                aria-hidden
                className="absolute bottom-[3%] left-[26%] right-[10%] h-[4%] rounded-[50%] bg-primary/30 blur-[6px]"
              />
              {/* Decorative: the heading already carries the message. */}
              <img
                aria-hidden
                src="/hero-final.png"
                alt=""
                className="relative w-full object-contain drop-shadow-xl"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <motion.a
        href="#services"
        aria-label="Scroll down"
        animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative z-10 mx-auto mb-8 hidden w-max flex-col items-center gap-1 text-primary sm:flex"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">Scroll</span>
        <ChevronDown className="size-5" />
      </motion.a>
    </section>
  );
}
