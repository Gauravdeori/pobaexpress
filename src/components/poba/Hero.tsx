import { motion, useScroll, useTransform } from "motion/react";
import {
  ChevronDown,
  Zap,
  ShieldCheck,
  Handshake,
  UtensilsCrossed,
  Cake,
  Pill,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BANNER_SRC, LOGO_SRC, logoRef, onLogoError, onPhotoError, photoRef } from "@/lib/assets";

const chips = [
  { icon: UtensilsCrossed, label: "Food" },
  { icon: Cake, label: "Cake" },
  { icon: Pill, label: "Medicine" },
];

const badges = [
  { icon: Zap, label: "Fast Delivery", pos: "-left-5 top-8" },
  { icon: ShieldCheck, label: "Safe", pos: "-right-4 top-1/2" },
  { icon: Handshake, label: "Reliable", pos: "-left-2 -bottom-4" },
];

export function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 140]);
  const scale = useTransform(scrollY, [0, 600], [1.05, 1.18]);

  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      {/* The deep-green base keeps the hero readable if the photo can't load. */}
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0 bg-primary-deep">
        <img
          ref={photoRef}
          src={BANNER_SRC}
          onError={onPhotoError}
          alt="Forest road through the hills of Jonai, Assam"
          className="h-full w-full object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 z-10 bg-gradient-hero" />

      <div className="relative z-20 mx-auto grid max-w-7xl items-center gap-14 px-5 pt-32 pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pt-40 lg:pb-32">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground"
          >
            Jonai's Own Delivery Service
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 text-4xl font-bold leading-[1.08] text-primary-foreground sm:text-5xl lg:text-6xl"
          >
            Jonai's Fastest <span className="text-accent">Local Delivery</span> Platform
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg"
          >
            Food, Cake & Medicine Delivery — Fast, Affordable and Reliable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button variant="accent" size="xl" asChild>
              <a href="#order">Order Now</a>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <a href="#partners">Become a Partner</a>
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.42 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            {chips.map((c) => (
              <li
                key={c.label}
                className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary-foreground transition-transform duration-300 hover:-translate-y-1"
              >
                <c.icon className="size-4 text-accent" />
                {c.label}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="relative mx-auto hidden w-full max-w-md lg:block"
        >
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="bg-white rounded-4xl p-8 shadow-lift transition-transform duration-500 hover:scale-[1.03]"
          >
            <img
              ref={logoRef}
              src={LOGO_SRC}
              onError={onLogoError}
              alt="Poba Express"
              className="mx-auto w-full drop-shadow-2xl bg-white rounded-full p-4"
            />
          </motion.div>

          {badges.map((b, i) => (
            <motion.div
              key={b.label}
              animate={{ y: [0, i % 2 === 0 ? -10 : 10, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
              className={`bg-white absolute ${b.pos} flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-primary shadow-soft`}
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
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-7 z-20 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-primary-foreground/70 sm:flex"
      >
        <span className="text-[11px] uppercase tracking-[0.25em]">Scroll</span>
        <ChevronDown className="size-5" />
      </motion.a>
    </section>
  );
}
