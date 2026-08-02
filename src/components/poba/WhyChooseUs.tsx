import { motion } from "motion/react";
import { Zap, MapPin, Wallet, ShieldCheck, Handshake, Heart } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

const features = [
  {
    icon: Zap,
    title: "Fast Delivery",
    text: "Riders dispatched in minutes across every Jonai neighbourhood.",
  },
  {
    icon: MapPin,
    title: "Local Expertise",
    text: "We know every lane, shop and shortcut in town.",
  },
  {
    icon: Wallet,
    title: "Affordable Pricing",
    text: "Honest, flat delivery fees with no hidden charges.",
  },
  {
    icon: ShieldCheck,
    title: "Safe Deliveries",
    text: "Sealed handling and careful transit for every order.",
  },
  {
    icon: Handshake,
    title: "Trusted Partners",
    text: "Verified restaurants, stores and pharmacies only.",
  },
  {
    icon: Heart,
    title: "Supporting Local Businesses",
    text: "Every order helps a Jonai entrepreneur grow.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Built For Jonai, By Jonai"
          subtitle="A delivery service that puts the community first — from our riders to our partner shops."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <motion.article
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="group relative h-full overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-soft"
              >
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-accent transition-transform duration-500 group-hover:scale-x-100" />
                <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-primary">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
