import { motion } from "motion/react";
import { MapPin, Users, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";

const stats = [
  {
    icon: MapPin,
    value: "Jonai",
    label: "Assam",
    bgPattern: (
      <svg
        className="pointer-events-none absolute -right-2 -bottom-2 size-20 text-accent/10"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="50" cy="50" r="35" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    icon: Users,
    value: "4+",
    label: "Delivery partners",
    bgPattern: (
      <svg
        className="pointer-events-none absolute -right-2 -bottom-2 size-20 text-accent/10"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
      >
        <path d="M20 70 Q50 30 80 70" strokeWidth="3" />
        <circle cx="50" cy="30" r="12" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    icon: Sparkles,
    value: "15–20 min",
    label: "Avg. delivery",
    bgPattern: (
      <svg
        className="pointer-events-none absolute -right-2 -bottom-2 size-20 text-accent/10"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path d="M50 0 L63 37 L100 50 L63 63 L50 100 L37 63 L0 50 L37 37 Z" opacity="0.2" />
      </svg>
    ),
  },
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
                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-accent/5 p-5 shadow-soft transition-all duration-300 hover:border-accent/50"
              >
                {s.bgPattern}
                <div className="flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <s.icon className="size-4" />
                </div>
                <dt className="mt-3 text-xl font-bold text-primary">{s.value}</dt>
                <dd className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.15}>
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="relative overflow-hidden rounded-4xl shadow-lift border border-border/60"
          >
            <img
              src="/delivery-map.png"
              alt="Poba Express Delivery Area Map"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
