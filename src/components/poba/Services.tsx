import { motion } from "motion/react";
import { UtensilsCrossed, Cake, Pill, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

import biryaniImg from "@/assets/biryani.png";
import cakeCategoryImg from "@/assets/cake_category.jpg";
import medicineCategoryImg from "@/assets/medicine_category.jpg";
import { Reveal, SectionHeading } from "./Reveal";

const services = [
  {
    icon: UtensilsCrossed,
    title: "Food Delivery",
    tag: "15-25 MINS",
    text: "Biryani, chowmein, momos, pizza and more — from ₹39, delivered hot to your door.",
    image: biryaniImg,
    imageAlt: "Delicious Biryani and Food",
    href: "/app/food",
    actionLabel: "Explore Food Menu",
    gradient: "from-emerald-950/60 via-emerald-900/20 to-card/90",
    borderColor: "hover:border-emerald-500/50",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    iconBg:
      "bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-emerald-950",
    Illustration: () => (
      <svg
        className="pointer-events-none absolute -right-6 -bottom-6 size-48 text-emerald-400/10 transition-transform duration-500 group-hover:scale-110 group-hover:text-emerald-400/15"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {/* Steam waves */}
        <path d="M40 120 Q50 90 40 60 Q30 30 40 0" strokeWidth="3" strokeDasharray="6 6" />
        <path d="M70 130 Q85 95 70 60 Q55 25 70 0" strokeWidth="4" strokeDasharray="8 8" />
        <path d="M100 120 Q110 90 100 60 Q90 30 100 0" strokeWidth="3" strokeDasharray="6 6" />
        {/* Speed arcs */}
        <circle cx="140" cy="140" r="45" strokeWidth="2" strokeDasharray="10 10" />
        <circle cx="140" cy="140" r="25" strokeWidth="2" />
        {/* Sparkles */}
        <path
          d="M160 50 L165 65 L180 70 L165 75 L160 90 L155 75 L140 70 L155 65 Z"
          fill="currentColor"
          opacity="0.6"
        />
      </svg>
    ),
  },
  {
    icon: Cake,
    title: "Cake Delivery",
    tag: "FRESH BAKED",
    text: "Vanilla to black forest, plus Dcakery's handcrafted cheesecakes and loaves.",
    image: cakeCategoryImg,
    imageAlt: "Fresh Birthday Cake",
    href: "/app/cake",
    actionLabel: "Browse Bakery",
    gradient: "from-rose-950/60 via-pink-900/20 to-card/90",
    borderColor: "hover:border-rose-500/50",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    iconBg: "bg-rose-500/15 text-rose-400 group-hover:bg-rose-500 group-hover:text-rose-950",
    Illustration: () => (
      <svg
        className="pointer-events-none absolute -right-6 -bottom-6 size-48 text-rose-400/10 transition-transform duration-500 group-hover:scale-110 group-hover:text-rose-400/15"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {/* Celebration streamers */}
        <path d="M20 40 Q60 80 100 30 T180 60" strokeWidth="3" strokeDasharray="6 6" />
        <path d="M10 120 Q70 160 130 110 T190 140" strokeWidth="2.5" strokeDasharray="4 4" />
        {/* Confetti geometric shapes */}
        <rect
          x="130"
          y="40"
          width="12"
          height="12"
          rx="3"
          transform="rotate(25 130 40)"
          fill="currentColor"
          opacity="0.4"
        />
        <rect
          x="60"
          y="140"
          width="10"
          height="10"
          rx="2"
          transform="rotate(-35 60 140)"
          fill="currentColor"
          opacity="0.4"
        />
        <circle cx="160" cy="120" r="6" fill="currentColor" opacity="0.5" />
        <circle cx="40" cy="90" r="5" fill="currentColor" opacity="0.5" />
        {/* Cake candle sparkle */}
        <path
          d="M100 70 L104 82 L116 86 L104 90 L100 102 L96 90 L84 86 L96 82 Z"
          fill="currentColor"
          opacity="0.7"
        />
      </svg>
    ),
  },
  {
    icon: Pill,
    title: "Medicine Delivery",
    tag: "⚡ 24/7 EMERGENCY & RX",
    text: "Fast delivery from trusted local pharmacies. Just upload your prescription.",
    image: medicineCategoryImg,
    imageAlt: "Medicine & Pharmacy Essentials",
    href: "/app/medicine",
    actionLabel: "Order Medicines Now",
    gradient: "from-cyan-950/90 via-teal-900/40 to-card",
    borderColor: "border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.35)] ring-2 ring-cyan-400/50",
    badgeBg: "bg-cyan-500/30 text-cyan-200 border-cyan-400/60 animate-pulse",
    iconBg: "bg-cyan-500/25 text-cyan-300 group-hover:bg-cyan-500 group-hover:text-cyan-950",
    highlighted: true,
    Illustration: () => (
      <svg
        className="pointer-events-none absolute -right-6 -bottom-6 size-48 text-cyan-400/10 transition-transform duration-500 group-hover:scale-110 group-hover:text-cyan-400/15"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {/* ECG pulse line */}
        <path
          d="M10 130 L60 130 L70 100 L85 160 L100 80 L115 145 L125 130 L190 130"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Cross icon watermark */}
        <path
          d="M140 40 H160 V60 H180 V80 H160 V100 H140 V80 H120 V60 H140 Z"
          fill="currentColor"
          opacity="0.3"
        />
        {/* Molecular ring */}
        <circle cx="50" cy="50" r="20" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="50" cy="50" r="6" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
];

export function Services() {
  return (
    <section id="services" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Our Services"
          title="Everything Delivered, Right to Your Door"
          subtitle="One platform for everything Jonai needs — picked up locally and delivered with care."
        />

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <motion.article
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border bg-gradient-to-br ${s.gradient} ${
                  s.highlighted
                    ? `${s.borderColor}`
                    : `border-border/80 ${s.borderColor}`
                } p-7 shadow-lift backdrop-blur-xl transition-all duration-300`}
              >
                {/* Top Highlight Ribbon for Medicine */}
                {s.highlighted && (
                  <div className="absolute -right-12 top-6 rotate-45 bg-gradient-to-r from-cyan-500 to-teal-400 px-12 py-1 text-[9px] font-black uppercase tracking-widest text-slate-950 shadow-md z-20">
                    FEATURED
                  </div>
                )}

                {/* Custom Background Vector Illustration */}
                <s.Illustration />

                {/* Top Row: Icon + Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className={`flex size-14 items-center justify-center rounded-2xl ${s.iconBg} transition-colors duration-300 shadow-md`}
                  >
                    <s.icon className="size-6" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${s.badgeBg} shadow-sm backdrop-blur`}
                  >
                    {s.highlighted ? (
                      <span className="relative flex size-2 mr-0.5">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-cyan-400" />
                      </span>
                    ) : (
                      <Sparkles className="size-3" />
                    )}
                    {s.tag}
                  </span>
                </div>

                {/* Main Card Content */}
                <div className="mt-6 flex-1">
                  <h3 className="text-2xl font-bold text-primary transition-colors group-hover:text-accent flex items-center gap-2">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground font-medium">
                    {s.text}
                  </p>
                </div>

                {/* Card Artwork Image Preview */}
                <div className="relative mt-6 h-36 w-full overflow-hidden rounded-2xl border border-border/40 shadow-inner">
                  <img
                    src={s.image}
                    alt={s.imageAlt}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-bold text-foreground backdrop-blur">
                    <ShieldCheck className="size-3.5 text-cyan-400" />
                    Verified Local Pharmacy
                  </div>
                </div>

                {/* Action Link */}
                <div className="mt-6 pt-2">
                  <Link
                    to={s.href}
                    className={`inline-flex items-center gap-2 text-sm font-bold ${
                      s.highlighted ? "text-cyan-400 hover:text-cyan-300" : "text-accent"
                    } transition-all group-hover:gap-3`}
                  >
                    {s.actionLabel}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
