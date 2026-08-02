import { motion } from "motion/react";
import { Zap, MapPin, Wallet, ShieldCheck, Handshake, Heart } from "lucide-react";
import { Reveal } from "./Reveal";

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
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-primary sm:text-4xl">Why Choose Poba Express?</h2>
          <div className="mx-auto mt-6 h-1 w-12 rounded-full bg-accent" />
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <motion.article
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="group relative h-full overflow-hidden rounded-[2rem] border border-border/60 bg-card p-8 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center"
              >
                <div className="flex size-16 items-center justify-center rounded-[1.25rem] bg-accent/10 text-accent mb-6">
                  <f.icon className="size-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-primary">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
