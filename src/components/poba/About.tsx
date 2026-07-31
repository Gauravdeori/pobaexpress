import { motion } from "motion/react";
import { MapPin, Users, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";
import { BANNER_SRC, onPhotoError, photoRef } from "@/lib/assets";

const stats = [
  { icon: MapPin, value: "Jonai", label: "Assam" },
  { icon: Users, value: "50+", label: "Local partners" },
  { icon: Sparkles, value: "30 min", label: "Avg. delivery" },
];

export function About() {
  return (
    <section id="about" className="bg-secondary/50 py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <span className="inline-flex items-center rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            About Us
          </span>
          <h2 className="mt-4 text-3xl font-bold text-primary sm:text-4xl">About Poba Express</h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Poba Express is Jonai's own local delivery platform serving the community with fast,
            affordable, and reliable home delivery. We connect customers with local restaurants,
            grocery stores, pharmacies, and businesses while supporting the growth of local
            entrepreneurs and creating employment opportunities.
          </p>

          <dl className="mt-9 grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <s.icon className="size-5 text-accent" />
                <dt className="mt-3 text-xl font-bold text-primary">{s.value}</dt>
                <dd className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.15}>
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="relative overflow-hidden rounded-4xl bg-primary-deep shadow-lift"
          >
            <img
              ref={photoRef}
              src={BANNER_SRC}
              onError={onPhotoError}
              alt="Delivery rider on the forest highway near Jonai"
              className="h-[420px] w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-hero p-6">
              <p className="font-display text-lg font-semibold text-primary-foreground">
                Delivering Happiness Across Jonai
              </p>
              <p className="mt-1 text-sm text-primary-foreground/80">
                You stay, <span className="text-accent font-semibold">we deliver</span>.
              </p>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
