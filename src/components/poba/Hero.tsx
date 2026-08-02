import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, Zap, ShieldCheck, Handshake, Utensils, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LAUNCH_DATE_LABEL, useLaunched } from "@/lib/launch";

/** Three promises, each with a supporting line, as a row under the buttons. */
const promises = [
  { icon: Zap, title: "Fast Delivery", detail: "On-time, every time" },
  { icon: ShieldCheck, title: "Affordable", detail: "Best prices in Jonai" },
  { icon: Handshake, title: "Reliable Service", detail: "You can count on us" },
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const launched = useLaunched();

  return (
    <section id="home" className="relative overflow-hidden bg-background">
      {/* Custom Background Image */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/hero-bg.png"
          alt=""
          className="h-full w-full object-cover object-center opacity-60"
        />
        {/* Soft overlay to ensure text remains readable */}
        <div className="absolute inset-0 bg-background/50" />
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
              Fast, affordable and reliable delivery from your favourite restaurants right to your doorstep.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.32 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Button className="rounded-full bg-primary hover:bg-primary-deep text-primary-foreground font-semibold px-8 shadow-lg" size="xl" asChild>
                <a href="#order">
                  {launched ? "Order Now" : "Order Now"}
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
              <Button variant="outline" size="xl" className="rounded-full bg-card hover:bg-card/90 font-semibold px-8 border-border text-foreground shadow-sm" asChild>
                <a href="#order">
                  Explore Restaurants
                  <Utensils className="ml-2 size-4 text-muted-foreground" />
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
                    <span className="block text-xs font-medium text-muted-foreground">{p.detail}</span>
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
            <img
              src="/hero-final.png"
              alt="Poba Express Delivery Rider"
              className="object-contain w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[450px] xl:max-w-[550px] drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>

      <motion.a
        href="#why-us"
        aria-label="Scroll down"
        animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative mx-auto mb-8 hidden w-max flex-col items-center gap-1 text-muted-foreground sm:flex z-10"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">Scroll</span>
        <ChevronDown className="size-5" />
      </motion.a>
    </section>
  );
}
