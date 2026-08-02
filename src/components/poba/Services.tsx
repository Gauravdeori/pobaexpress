import { motion } from "motion/react";
import { UtensilsCrossed, Cake, Pill } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

const services = [
  {
    icon: UtensilsCrossed,
    title: "Food Delivery",
    text: "Biryani, chowmein, momos and more — from ₹29, hot to your door.",
  },
  {
    icon: Cake,
    title: "Cake Delivery",
    text: "Vanilla to black forest, plus bento cakes for last-minute surprises.",
  },
  {
    icon: Pill,
    title: "Medicine Delivery",
    text: "Fast delivery from trusted pharmacies. Just send your prescription.",
  },
];

export function Services() {
  return (
    <section id="services" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Our Services"
          title="Everything Delivered, Right to Your Door"
          subtitle="One platform for everything Jonai needs — picked up locally and delivered with care."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <motion.article
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="group h-full rounded-3xl border border-border bg-card/70 p-7 shadow-soft backdrop-blur-xl transition-colors duration-300 hover:border-accent"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                  <s.icon className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-primary">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
