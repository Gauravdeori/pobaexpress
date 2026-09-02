import { motion } from "motion/react";
import { Zap, MapPin, Wallet, ShieldCheck, Handshake, Heart } from "lucide-react";
import { Reveal } from "./Reveal";

const features = [
  {
    icon: Zap,
    title: "Fast Delivery",
    text: "Riders dispatched in minutes across every Jonai neighbourhood.",
    badge: "15-35 MINS",
    gradient: "from-amber-500/10 via-emerald-500/5 to-card",
    borderColor: "hover:border-amber-500/40",
    iconBg: "bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-amber-950",
    Illustration: () => (
      <svg
        className="pointer-events-none absolute -right-6 -bottom-6 size-40 text-amber-500/10 transition-transform duration-500 group-hover:scale-110 group-hover:text-amber-500/20"
        viewBox="0 0 160 160"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M20 100 L70 100 L50 140 L120 70 L70 70 L90 20 Z"
          fill="currentColor"
          opacity="0.3"
        />
        <path d="M10 50 Q50 30 90 50" strokeWidth="3" strokeDasharray="6 6" />
        <path d="M30 130 Q80 110 130 130" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
    ),
  },
  {
    icon: MapPin,
    title: "Local Expertise",
    text: "We know every lane, shop and shortcut in town.",
    badge: "100% JONAI",
    gradient: "from-emerald-500/15 via-teal-500/5 to-card",
    borderColor: "hover:border-emerald-500/40",
    iconBg:
      "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-emerald-950",
    Illustration: () => (
      <svg
        className="pointer-events-none absolute -right-6 -bottom-6 size-40 text-emerald-500/10 transition-transform duration-500 group-hover:scale-110 group-hover:text-emerald-500/20"
        viewBox="0 0 160 160"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="80" cy="80" r="60" strokeWidth="2" strokeDasharray="6 6" />
        <circle cx="80" cy="80" r="40" strokeWidth="1.5" />
        <circle cx="80" cy="80" r="15" fill="currentColor" opacity="0.2" />
        <path d="M80 20 V140 M20 80 H140" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>
    ),
  },
  {
    icon: Wallet,
    title: "Affordable Pricing",
    text: "Honest, flat delivery fees starting from just ₹5.",
    badge: "NO MARKUP",
    gradient: "from-green-500/15 via-emerald-500/5 to-card",
    borderColor: "hover:border-green-500/40",
    iconBg: "bg-green-500/10 text-green-400 group-hover:bg-green-500 group-hover:text-green-950",
    Illustration: () => (
      <svg
        className="pointer-events-none absolute -right-6 -bottom-6 size-40 text-green-500/10 transition-transform duration-500 group-hover:scale-110 group-hover:text-green-500/20"
        viewBox="0 0 160 160"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="100" cy="100" r="45" strokeWidth="2" />
        <path
          d="M90 75 H115 M90 88 H115 M90 75 V125 M105 88 Q115 95 105 105 T90 115"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M30 40 L60 70 M40 30 L70 60" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Safe Deliveries",
    text: "Sealed handling and careful transit for every order.",
    badge: "SEALED PACKS",
    gradient: "from-cyan-500/15 via-teal-500/5 to-card",
    borderColor: "hover:border-cyan-500/40",
    iconBg: "bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-cyan-950",
    Illustration: () => (
      <svg
        className="pointer-events-none absolute -right-6 -bottom-6 size-40 text-cyan-500/10 transition-transform duration-500 group-hover:scale-110 group-hover:text-cyan-500/20"
        viewBox="0 0 160 160"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M80 20 L130 45 V90 Q80 145 80 145 Q80 145 30 90 V45 Z"
          strokeWidth="2"
          fill="currentColor"
          opacity="0.15"
        />
        <path
          d="M60 80 L75 95 L105 65"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    icon: Handshake,
    title: "Trusted Partners",
    text: "Verified local restaurants, stores and pharmacies only.",
    badge: "VERIFIED",
    gradient: "from-indigo-500/15 via-purple-500/5 to-card",
    borderColor: "hover:border-indigo-500/40",
    iconBg:
      "bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-indigo-950",
    Illustration: () => (
      <svg
        className="pointer-events-none absolute -right-6 -bottom-6 size-40 text-indigo-500/10 transition-transform duration-500 group-hover:scale-110 group-hover:text-indigo-500/20"
        viewBox="0 0 160 160"
        fill="none"
        stroke="currentColor"
      >
        <polygon
          points="80,20 95,50 130,55 105,80 110,115 80,95 50,115 55,80 30,55 65,50"
          strokeWidth="2"
          fill="currentColor"
          opacity="0.2"
        />
      </svg>
    ),
  },
  {
    icon: Heart,
    title: "Supporting Local",
    text: "Every order empowers local Jonai entrepreneurs to grow.",
    badge: "COMMUNITY",
    gradient: "from-rose-500/15 via-pink-500/5 to-card",
    borderColor: "hover:border-rose-500/40",
    iconBg: "bg-rose-500/10 text-rose-400 group-hover:bg-rose-500 group-hover:text-rose-950",
    Illustration: () => (
      <svg
        className="pointer-events-none absolute -right-6 -bottom-6 size-40 text-rose-500/10 transition-transform duration-500 group-hover:scale-110 group-hover:text-rose-500/20"
        viewBox="0 0 160 160"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M80 135 C20 90 20 45 55 30 C75 22 80 40 80 40 C80 40 85 22 105 30 C140 45 140 90 80 135 Z"
          fill="currentColor"
          opacity="0.2.5"
          strokeWidth="2"
        />
        <circle cx="40" cy="40" r="4" fill="currentColor" opacity="0.4" />
        <circle cx="125" cy="45" r="5" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Built For Jonai
          </span>
          <h2 className="mt-4 text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
            Why Choose Poba Express?
          </h2>
          <div className="mx-auto mt-6 h-1 w-12 rounded-full bg-accent" />
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <motion.article
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`group relative flex h-full flex-col overflow-hidden rounded-[2.25rem] border border-border/80 bg-gradient-to-br ${f.gradient} p-8 shadow-lift backdrop-blur-xl transition-all duration-300 ${f.borderColor}`}
              >
                {/* Custom Background Vector Art Illustration */}
                <f.Illustration />

                {/* Top Badge + Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`flex size-14 items-center justify-center rounded-2xl ${f.iconBg} transition-colors duration-300 shadow-sm`}
                  >
                    <f.icon className="size-7" strokeWidth={1.75} />
                  </div>
                  <span className="rounded-full bg-background/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground shadow-sm backdrop-blur">
                    {f.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-primary transition-colors group-hover:text-accent">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-medium">
                  {f.text}
                </p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
