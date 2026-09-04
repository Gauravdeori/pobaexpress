import { useState, useEffect, useCallback, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Search,
  ChevronDown,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Cake,
  Pill,
  MessageCircle,
  Percent,
  CheckCircle2,
  Clock,
} from "lucide-react";

import biryaniImg from "@/assets/biryani.png";
import momosImg from "@/assets/momos.png";
import chowmeinImg from "@/assets/chowmein.png";
import pizzaImg from "@/assets/pizza.jpg";
import chocolateCakeImg from "@/assets/chocolate-cake.jpg";
import cakeCategoryImg from "@/assets/cake_category.jpg";
import medicineCategoryImg from "@/assets/medicine_category.jpg";
import { MIN_DELIVERY_FEE } from "@/lib/menu";
import { AREA_EDGES, AREA_SUMMARY } from "@/lib/delivery-area";
import {
  DELIVERY_HOURS_LABEL,
  LAUNCH_DATE_LABEL,
  useLaunched,
  useServiceHours,
} from "@/lib/launch";

/**
 * Everywhere inside the delivery area, with the four edges named exactly as
 * `AREA_EDGES` names them — a picker offering "Rotkey Area" while the boundary
 * is drawn at "Rotkey Playground" invites an order from just outside it.
 */
const JONAI_LOCATIONS = [
  "Jonai Main Market",
  AREA_EDGES.north,
  AREA_EDGES.south,
  AREA_EDGES.east,
  AREA_EDGES.west,
  "College Road",
  "Station Road",
];

const SEARCH_PLACEHOLDERS = [
  "Search for 'Chicken Biryani'...",
  "Search for 'Black Forest Cake'...",
  "Search for 'Steamed Momos'...",
  "Search for 'Paracetamol & Medicine'...",
  "Search for 'Chowmein & Fried Rice'...",
];

/**
 * Where a tile, chip or search lands.
 *
 * Every one of these used to be an `#order` anchor. That worked only on the
 * landing page, where the order form supplies the id — on the app home screen,
 * which renders this same banner, there is nothing for the hash to scroll to
 * and each of them was a tap that did nothing.
 */
type Destination = {
  to: "food" | "cake" | "medicine";
  /** The dish to pre-fill the kitchen search with. Only read for "food". */
  query?: string;
};

/**
 * The chips under the search box.
 *
 * Each query is spelled to match something a partner actually sells — the
 * kitchen search understands "biryani" for Biriyani Corner's "Biriyani", so a
 * chip can be labelled the way customers say it and still find the dish.
 */
const TRENDING: (Destination & { label: string })[] = [
  { label: "Chicken Biryani", to: "food", query: "biryani" },
  { label: "Local Thalis", to: "food", query: "thali" },
  { label: "Steamed Momos", to: "food", query: "momo" },
  { label: "Black Forest Cake", to: "cake" },
  { label: "Dispy Pizza", to: "food", query: "pizza" },
  { label: "Paracetamol", to: "medicine" },
];

type CategoryItem = Destination & {
  id: string;
  name: string;
  tag: string;
  image?: string;
  fallbackEmoji: string;
  color: string;
  borderColor: string;
};

const CATEGORIES: CategoryItem[] = [
  {
    id: "biryani",
    name: "Biryani",
    tag: "From ₹129",
    image: biryaniImg,
    fallbackEmoji: "🍗",
    color: "from-accent/15 to-accent/5",
    borderColor: "border-accent/25",
    to: "food",
    query: "biryani",
  },
  {
    id: "thalis",
    name: "Local Thalis",
    tag: "Assamese & Ethnic",
    fallbackEmoji: "🍱",
    color: "from-accent/15 to-accent/5",
    borderColor: "border-accent/25",
    to: "food",
    query: "thali",
  },
  {
    id: "momos",
    name: "Momos",
    tag: "Customer Fav",
    image: momosImg,
    fallbackEmoji: "🥟",
    color: "from-accent/15 to-accent/5",
    borderColor: "border-accent/25",
    to: "food",
    query: "momo",
  },
  {
    id: "cakes",
    name: "Cakes",
    tag: "Fresh Baked",
    image: cakeCategoryImg,
    fallbackEmoji: "🎂",
    color: "from-accent/15 to-accent/5",
    borderColor: "border-accent/25",
    to: "cake",
  },
  {
    id: "pizza",
    name: "Pizza",
    tag: "Fast Food Fav",
    image: pizzaImg,
    fallbackEmoji: "🍕",
    color: "from-accent/15 to-accent/5",
    borderColor: "border-accent/25",
    to: "food",
    query: "pizza",
  },
  {
    id: "chowmein",
    name: "Chowmein",
    tag: "Chinese Delights",
    image: chowmeinImg,
    fallbackEmoji: "🍜",
    color: "from-accent/15 to-accent/5",
    borderColor: "border-accent/25",
    to: "food",
    query: "chowmein",
  },
  {
    id: "medicine",
    name: "Medicines",
    tag: "⚡ 24/7 RX",
    image: medicineCategoryImg,
    fallbackEmoji: "💊",
    color: "from-cyan-500/30 via-teal-500/15 to-accent/5",
    borderColor: "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.45)] ring-2 ring-cyan-400/50",
    to: "medicine",
  },
];

const HERO_SLIDES = [
  {
    id: "montu-deal",
    badge: "MONTU FAST FOOD",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    title: "Special Cake Offer",
    highlight: "1 kg Cake at ₹800",
    description: "Sweet way to say Thank You. Same Day Delivery in Jonai.",
    cta: "Order Now",
    ctaLink: "/app/r/montu-fast-food",
    external: false,
    code: "HAPPY TEACHER'S DAY",
    gradient: "from-[#0f3622] via-[#155431] to-[#1a7341]",
    accentColor: "#10b981",
    tagIcon: Cake,
    heroImage: chocolateCakeImg,
    heroSecondary: cakeCategoryImg,
    heroBadge: "SPECIAL OFFER",
    offerPill: "FROM ₹800",
    features: ["🎂 Fresh Baked", "⚡ Same Day Delivery", "❤️ Thank You"],
  },
  {
    id: "poba-deal",
    badge: "POBA EXPRESS EXCLUSIVE",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    title: `Fast Doorstep Delivery in Jonai`,
    highlight: `Zero Commission • Delivery from ₹${MIN_DELIVERY_FEE}`,
    description:
      "Order hot meals, sizzling momos, fresh birthday cakes, and urgent medicines delivered in 15–35 mins.",
    cta: "Download the App to Order",
    ctaLink: "/app",
    external: false,
    // Replaced by "LIVE NOW" the moment the shop opens — see `slideCode`.
    // A banner still advertising an opening date is the clearest possible
    // signal that a site has not been touched since before it launched.
    code: `OPENING ${LAUNCH_DATE_LABEL}`,
    gradient: "from-[#082817] via-[#0f4427] to-[#1a6b3e]",
    accentColor: "#10b981",
    tagIcon: Percent,
    heroImage: biryaniImg,
    heroSecondary: momosImg,
    heroBadge: "HOT & FRESH",
    offerPill: "FLAT ₹5 DELIVERY",
    features: ["Free Poba Express App", "Order in a Few Taps", "Live Doorstep Tracking"],
  },
  {
    id: "prarthona-deal",
    badge: "PRARTHONA RESTAURANT",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    title: "Momos, Chow & Sizzling Delights",
    highlight: "Dishes Starting from ₹58",
    description:
      "Authentic fried rice, chowmein, crispy chicken rolls, and spicy chilli chicken cooked fresh to order.",
    cta: "Explore Prarthona Menu",
    ctaLink: "/app/r/prarthona",
    external: false,
    code: "FRESH & HOT",
    gradient: "from-[#2b1004] via-[#4d2008] to-[#7c340d]",
    accentColor: "#f59e0b",
    tagIcon: Sparkles,
    heroImage: chowmeinImg,
    heroSecondary: momosImg,
    heroBadge: "TOP RATED",
    offerPill: "FROM ₹58",
    features: ["⚡ 15–35 Min Delivery", "🥟 Steamed & Fried Momos", "🔥 Cooked Fresh"],
  },
  {
    id: "dcakery-deal",
    badge: "DCAKERY ARTISANAL BAKERY",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-400/30",
    title: "Fresh Cakes & NY Cheesecakes",
    highlight: "Custom Birthday Cakes in 30 Mins",
    description:
      "Indulgent Chocolate Truffle, Butterscotch, New York Cheesecakes & freshly baked dessert loaves.",
    cta: "Order Bakery Cakes",
    ctaLink: "/app/r/montu-fast-food",
    external: false,
    code: "ARTISAN BAKERY",
    gradient: "from-[#280517] via-[#4a0d2d] to-[#781849]",
    accentColor: "#f43f5e",
    tagIcon: Cake,
    heroImage: chocolateCakeImg,
    heroSecondary: cakeCategoryImg,
    heroBadge: "100% EGGLESS AVAILABLE",
    offerPill: "FRESH BAKED",
    features: ["🎂 Custom Messages", "🧀 Authentic Cheesecakes", "⚡ Safe Packaging"],
  },
  {
    id: "medicine-deal",
    badge: "24/7 MEDICINE DELIVERY",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
    title: "Prescriptions & Healthcare Essentials",
    highlight: "Doorstep Pharmacy in 20 Mins",
    description:
      "Send your prescription from the app. We pick up from verified Jonai pharmacies & deliver safely.",
    cta: "Order Medicines",
    ctaLink: "/app/medicine",
    external: false,
    code: "VERIFIED PHARMACY",
    gradient: "from-[#04202b] via-[#093d52] to-[#106282]",
    accentColor: "#06b6d4",
    tagIcon: Pill,
    heroImage: medicineCategoryImg,
    heroSecondary: undefined,
    heroBadge: "GENUINE MEDS",
    offerPill: "RAPID DISPATCH",
    features: ["💊 Verified Pharmacies", "📋 Prescription Upload", "⚡ Contactless Delivery"],
  },
];

/** Thematic Background SVG Illustrations for Hero Slides */
function SlideBackgroundIllustrations({ slideId }: { slideId: string }) {
  if (slideId === "montu-deal") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <div className="absolute -left-10 -top-10 size-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-10 bottom-0 size-96 rounded-full bg-green-400/20 blur-3xl" />

        {/* Celebration Confetti & Sparkles */}
        <svg
          className="absolute inset-0 size-full text-emerald-300/[0.15]"
          viewBox="0 0 400 200"
          fill="currentColor"
        >
          <circle cx="40" cy="30" r="5" />
          <circle cx="120" cy="70" r="4" />
          <circle cx="280" cy="40" r="6" />
          <circle cx="340" cy="90" r="4" />
          <circle cx="200" cy="20" r="5" />
          <rect x="70" y="45" width="10" height="10" rx="3" transform="rotate(25 70 45)" />
          <rect x="250" y="80" width="12" height="8" rx="3" transform="rotate(-35 250 80)" />
          <rect x="160" y="110" width="10" height="10" rx="3" transform="rotate(45 160 110)" />
          <path
            d="M30 120 Q50 140 70 120 T110 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="4 4"
          />
          <path
            d="M220 30 Q240 50 260 30 T300 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Floating Heart / Sparkle */}
        <svg
          className="absolute right-1/4 top-8 size-12 text-emerald-200/[0.25] animate-pulse"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
    );
  }

  if (slideId === "poba-deal") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        {/* Ambient radial glow */}
        <div className="absolute -left-20 -bottom-20 size-80 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute right-10 -top-20 size-96 rounded-full bg-amber-400/15 blur-3xl" />

        {/* Concentric speed radar rings */}
        <svg
          className="absolute -right-24 -top-24 size-[500px] stroke-white/10 opacity-70"
          viewBox="0 0 400 400"
          fill="none"
        >
          <circle cx="200" cy="200" r="80" strokeWidth="1.5" strokeDasharray="4 6" />
          <circle cx="200" cy="200" r="130" strokeWidth="1.5" strokeDasharray="6 8" />
          <circle cx="200" cy="200" r="180" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="230" strokeWidth="1.5" strokeDasharray="8 10" />
        </svg>

        {/* Delivery Scooter & Speed Lines Illustration */}
        <svg
          className="absolute left-1/3 bottom-2 h-36 w-72 text-white/[0.12]"
          viewBox="0 0 200 100"
          fill="currentColor"
        >
          <path
            d="M20 75 Q40 75 50 65 Q60 55 70 55 L90 55 L100 40 L115 40 L120 50 L140 50 Q150 50 155 60 L165 75 Z"
            opacity="0.6"
          />
          <circle cx="45" cy="80" r="14" fill="none" stroke="currentColor" strokeWidth="5" />
          <circle cx="150" cy="80" r="14" fill="none" stroke="currentColor" strokeWidth="5" />
          <path
            d="M0 65 L40 65 M5 75 L30 75 M10 85 L35 85"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Floating Biryani Pot & Herb Silhouettes */}
        <svg
          className="absolute left-10 top-14 size-20 text-amber-300/[0.18]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3.5-4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>

        <svg
          className="absolute left-1/2 top-4 size-10 text-white/[0.2] animate-pulse"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z" />
        </svg>
      </div>
    );
  }

  if (slideId === "prarthona-deal") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <div className="absolute -right-20 -bottom-20 size-80 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute left-10 -top-20 size-96 rounded-full bg-orange-600/20 blur-3xl" />

        {/* Wok Flame & Sizzle Steam Wave Illustration */}
        <svg
          className="absolute -right-6 bottom-0 h-72 w-96 text-orange-400/[0.12]"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M100 20 C80 60 40 80 40 120 C40 160 80 190 100 190 C120 190 160 160 160 120 C160 80 120 60 100 20 Z" />
          <path
            d="M100 60 C90 85 70 100 70 125 C70 150 90 170 100 170 C110 170 130 150 130 125 C130 100 110 85 100 60 Z"
            fill="#f59e0b"
            opacity="0.4"
          />
        </svg>

        {/* Floating Dumpling / Momo Steam Curves */}
        <svg
          className="absolute left-1/4 top-8 h-56 w-56 text-amber-200/[0.15]"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        >
          <path d="M20 80 Q30 50 20 20" />
          <path d="M40 85 Q55 50 40 15" />
          <path d="M60 80 Q70 50 60 20" />
        </svg>

        {/* Decorative Grid Pattern */}
        <svg
          className="absolute left-6 bottom-6 size-32 text-white/[0.08]"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
        >
          <line x1="0" y1="20" x2="100" y2="20" strokeDasharray="4 4" />
          <line x1="0" y1="50" x2="100" y2="50" strokeDasharray="4 4" />
          <line x1="0" y1="80" x2="100" y2="80" strokeDasharray="4 4" />
        </svg>
      </div>
    );
  }

  if (slideId === "dcakery-deal") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <div className="absolute -left-10 -top-10 size-80 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-10 bottom-0 size-96 rounded-full bg-pink-400/20 blur-3xl" />

        {/* Birthday Party Confetti & Streamers Illustration */}
        <svg
          className="absolute inset-0 size-full text-rose-300/[0.15]"
          viewBox="0 0 400 200"
          fill="currentColor"
        >
          <circle cx="40" cy="30" r="5" />
          <circle cx="120" cy="70" r="4" />
          <circle cx="280" cy="40" r="6" />
          <circle cx="340" cy="90" r="4" />
          <circle cx="200" cy="20" r="5" />
          <rect x="70" y="45" width="10" height="10" rx="3" transform="rotate(25 70 45)" />
          <rect x="250" y="80" width="12" height="8" rx="3" transform="rotate(-35 250 80)" />
          <rect x="160" y="110" width="10" height="10" rx="3" transform="rotate(45 160 110)" />
          <path
            d="M30 120 Q50 140 70 120 T110 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="4 4"
          />
          <path
            d="M220 30 Q240 50 260 30 T300 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Celebration Sparkles */}
        <svg
          className="absolute right-1/3 top-6 size-14 text-rose-200/[0.25] animate-pulse"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>
    );
  }

  // Medicine deal
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      <div className="absolute -right-10 -top-10 size-80 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute left-10 bottom-0 size-96 rounded-full bg-teal-400/20 blur-3xl" />

      {/* Heartbeat / ECG Wave Line */}
      <svg
        className="absolute inset-x-0 bottom-6 h-24 w-full text-cyan-300/[0.18]"
        viewBox="0 0 500 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        preserveAspectRatio="none"
      >
        <path d="M0 50 L120 50 L135 20 L150 80 L165 30 L180 65 L195 50 L320 50 L335 15 L350 85 L365 35 L380 60 L395 50 L500 50" />
      </svg>

      {/* Hexagonal Molecular Mesh */}
      <svg
        className="absolute left-6 top-6 size-56 text-cyan-200/[0.12]"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="30,10 50,20 50,40 30,50 10,40 10,20" />
        <polygon points="70,10 90,20 90,40 70,50 50,40 50,20" />
        <polygon points="50,40 70,50 70,70 50,80 30,70 30,50" />
      </svg>
    </div>
  );
}

/**
 * A link to whichever screen actually sells the thing named on it.
 *
 * The destination is branched here rather than kept as one `to` string,
 * because the router types each route's search separately and a union would
 * lose that — it is what lets `search={{ q }}` be checked against what
 * `/app/food` really accepts. Same shape as `ShopCard` on the landing page.
 */
function ShopLink({
  dest,
  className,
  children,
}: {
  dest: Destination;
  className: string;
  children: ReactNode;
}) {
  if (dest.to === "cake") {
    return (
      <Link to="/app/cake" className={className}>
        {children}
      </Link>
    );
  }

  if (dest.to === "medicine") {
    return (
      <Link to="/app/medicine" className={className}>
        {children}
      </Link>
    );
  }

  return (
    <Link to="/app/food" search={{ q: dest.query }} className={className}>
      {children}
    </Link>
  );
}

/**
 * "Open now till 11 PM", or "Closed — opens 10 AM".
 *
 * The window is printed either way. A shut shop that does not say when it
 * opens sends people to look somewhere else; one that does gets them back in
 * the morning.
 */
function DeliveryHoursChip() {
  const { open, nextChangeLabel } = useServiceHours();

  return (
    <div
      className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2 ${
        open
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"
      }`}
    >
      <Clock className="size-4 shrink-0" />
      <div className="min-w-0 leading-tight">
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider">
          <span className="relative flex size-1.5 shrink-0">
            {open && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-70" />
            )}
            <span className="relative inline-flex size-1.5 rounded-full bg-current" />
          </span>
          {open ? `Open now · till ${nextChangeLabel}` : `Closed · opens ${nextChangeLabel}`}
        </div>
        <div className="truncate text-xs font-bold text-foreground">
          Delivery {DELIVERY_HOURS_LABEL}
        </div>
      </div>
    </div>
  );
}

/** One circle under "What's on your mind?". */
function CategoryTile({ cat }: { cat: CategoryItem }) {
  return (
    <ShopLink
      dest={cat}
      className="group flex flex-col items-center gap-2.5 shrink-0 transition-transform active:scale-95"
    >
      <div
        className={`relative flex size-20 sm:size-24 items-center justify-center rounded-full bg-gradient-to-br ${cat.color} border-2 ${cat.borderColor} p-2 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:border-accent`}
      >
        {cat.image ? (
          <img
            src={cat.image}
            alt={cat.name}
            className="size-full rounded-full object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <span className="text-3xl sm:text-4xl drop-shadow-md">{cat.fallbackEmoji}</span>
        )}

        {/* Offer Tag Badge */}
        <span
          className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-sm border ${
            cat.id === "medicine"
              ? "border-cyan-300 bg-cyan-600 animate-pulse text-white shadow-[0_0_8px_rgba(6,182,212,0.6)]"
              : "border-accent-light bg-accent"
          }`}
        >
          {cat.tag}
        </span>
      </div>

      <span
        className={`text-xs font-extrabold transition-colors ${
          cat.id === "medicine"
            ? "text-cyan-400 font-black group-hover:text-cyan-300"
            : "text-foreground group-hover:text-accent"
        }`}
      >
        {cat.name}
      </span>
    </ShopLink>
  );
}

export function ZomatoTopBanner() {
  const launched = useLaunched();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(JONAI_LOCATIONS[0]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Rotating search placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Slide autoplay
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const activeSlide = HERO_SLIDES[currentSlide];

  /**
   * Hands the typed dish to the kitchen list.
   *
   * A form rather than a click handler, so Enter searches — which is what
   * everyone does, and what the old `#order` link could not do at all.
   */
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = searchQuery.trim();
    void navigate({ to: "/app/food", search: { q: q || undefined } });
  };

  return (
    <div className="w-full space-y-6 pt-4 pb-8">
      {/* 1. TOP ZOMATO/SWIGGY STYLE LOCATION & SEARCH BAR */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          {/* Location Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLocationOpen((prev) => !prev)}
              className="group flex items-center gap-2.5 rounded-xl bg-accent/10 px-3.5 py-2 text-left transition-all hover:bg-accent/20"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-md transition-transform group-hover:scale-105">
                <MapPin className="size-5 fill-white/20" />
              </div>
              <div className="min-w-[140px]">
                <div className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-accent">
                  <span>Deliver To</span>
                  <ChevronDown
                    className={`size-3 transition-transform duration-200 ${
                      locationOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <div className="truncate text-xs font-bold text-foreground">{selectedLocation}</div>
              </div>
            </button>

            {/* Location Dropdown Modal */}
            <AnimatePresence>
              {locationOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-card p-2 shadow-2xl"
                >
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Select Delivery Zone in Jonai
                  </div>
                  {/* The boundary, stated where the zone is chosen: the list
                      below is the whole of it, not a sample of a wider area. */}
                  <p className="px-3 pb-1.5 text-[10px] font-medium leading-relaxed text-muted-foreground">
                    {AREA_SUMMARY}
                  </p>
                  <div className="mt-1 max-h-48 overflow-y-auto space-y-0.5">
                    {JONAI_LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          setSelectedLocation(loc);
                          setLocationOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                          selectedLocation === loc
                            ? "bg-accent text-white font-bold"
                            : "text-foreground hover:bg-secondary"
                        }`}
                      >
                        <span>{loc}</span>
                        {selectedLocation === loc && <CheckCircle2 className="size-3.5" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Interactive Search Bar */}
          <div className="relative flex-1">
            <form onSubmit={submitSearch} role="search" className="relative flex items-center">
              <Search className="absolute left-3.5 size-4 text-accent pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                aria-label="Search restaurants or dishes"
                className="w-full rounded-xl border border-border/80 bg-background/80 py-2.5 pl-10 pr-24 text-xs font-medium text-foreground transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <button
                type="submit"
                className="absolute right-1.5 flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-primary active:scale-95"
              >
                <span>Search</span>
                <ArrowRight className="size-3" />
              </button>
            </form>
          </div>

          {/* Delivery hours. Sits beside the location and the search because
              it answers the same question they do — can I get food, here,
              now — and it is shown at every width, unlike the offer tag: most
              people open this on a phone, and "are you open" is not a
              desktop-only question. */}
          <DeliveryHoursChip />

          {/* Quick Offer Tag */}
          <div className="hidden shrink-0 xl:flex items-center gap-2 rounded-xl bg-accent/10 px-3.5 py-2 text-accent border border-accent/20">
            <Sparkles className="size-4 text-accent animate-pulse" />
            <span className="text-xs font-extrabold">Delivery from ₹{MIN_DELIVERY_FEE}</span>
          </div>
        </div>

        {/* Trending Search Chips */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
          <span className="shrink-0 font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
            Trending:
          </span>
          {TRENDING.map((tag) => (
            <ShopLink
              key={tag.label}
              dest={tag}
              className="shrink-0 rounded-full border border-border/60 bg-card/80 px-3 py-1 font-semibold text-foreground/80 transition-all hover:border-accent hover:bg-accent/10 hover:text-primary"
            >
              {tag.label}
            </ShopLink>
          ))}
        </div>
      </div>

      {/* 2. ZOMATO/SWIGGY HERO OFFER BANNER CAROUSEL */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className={`bg-gradient-to-br ${activeSlide.gradient} p-6 sm:p-8 lg:p-10 text-white min-h-[340px] flex flex-col justify-between relative transition-all duration-500`}
          >
            {/* Thematic Background SVG Illustrations */}
            <SlideBackgroundIllustrations slideId={activeSlide.id} />

            {/* Top Bar on Banner */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm ${activeSlide.badgeBg}`}
              >
                <activeSlide.tagIcon className="size-3.5" />
                {activeSlide.badge}
              </span>
              {/* Any slide counting down to a date says LIVE NOW instead once
                  we are open; the slides whose code is a shop's own label
                  ("ARTISAN BAKERY") are left alone. */}
              {launched && activeSlide.code.startsWith("OPENING") ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-black tracking-wide text-white shadow-sm">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-white" />
                  </span>
                  LIVE NOW
                </span>
              ) : (
                <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide text-white backdrop-blur-md border border-white/20 shadow-sm">
                  {activeSlide.code}
                </span>
              )}
            </div>

            {/* Main Content Grid: Left Text & Right Image Showcase */}
            <div className="relative z-10 my-4 grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
              {/* Left Column: Copy & Details */}
              <div className="lg:col-span-7">
                <motion.h2
                  key={activeSlide.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl text-white leading-[1.15]"
                >
                  {activeSlide.title}
                </motion.h2>

                <motion.div
                  key={activeSlide.highlight}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="mt-2.5 flex items-center gap-2"
                >
                  <span className="inline-block rounded-md bg-white/20 px-2.5 py-0.5 text-sm font-black uppercase tracking-wide text-white border border-white/20 backdrop-blur-sm">
                    {activeSlide.offerPill}
                  </span>
                  <p className="text-base font-bold text-white/95 sm:text-lg">
                    {activeSlide.highlight}
                  </p>
                </motion.div>

                <motion.p
                  key={activeSlide.description}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="mt-3 text-xs sm:text-sm text-white/85 max-w-lg leading-relaxed font-medium"
                >
                  {activeSlide.description}
                </motion.p>

                {/* Feature Chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeSlide.features.map((feat) => (
                    <span
                      key={feat}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md border border-white/10 shadow-sm"
                    >
                      <CheckCircle2 className="size-3 text-white" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Hero Visual Showcase */}
              <div className="relative flex items-center justify-center lg:col-span-5 lg:justify-end">
                <motion.div
                  key={activeSlide.id + "-image"}
                  initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
                  className="relative group flex items-center justify-center"
                >
                  {/* Floating Halo Glow */}
                  <div className="absolute -inset-4 rounded-full bg-white/20 blur-2xl animate-pulse" />

                  {/* Main Hero Image in Floating Platter / Glass Frame */}
                  <div className="relative size-48 sm:size-56 lg:size-64 overflow-hidden rounded-3xl border-2 border-white/30 bg-white/10 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
                    <img
                      src={activeSlide.heroImage}
                      alt={activeSlide.title}
                      className="size-full rounded-2xl object-cover transition-transform duration-500 hover:scale-105"
                    />

                    {/* Floating Floating Ribbon Badge */}
                    <div className="absolute top-4 right-4 rounded-full bg-black/70 px-3 py-1 text-[10px] font-extrabold tracking-wider text-amber-300 backdrop-blur-md border border-amber-400/30 shadow-lg">
                      {activeSlide.heroBadge}
                    </div>

                    {/* Bottom Gradient Overlay on Image */}
                    <div className="absolute inset-x-2 bottom-2 rounded-b-2xl bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2.5 text-center">
                      <span className="text-[11px] font-extrabold uppercase tracking-wide text-white">
                        Fast 15-25 min delivery
                      </span>
                    </div>
                  </div>

                  {/* Secondary Floating Mini Avatar if present */}
                  {activeSlide.heroSecondary && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="absolute -bottom-3 -left-3 size-20 sm:size-24 rounded-2xl border-2 border-white/40 bg-black/60 p-1.5 shadow-2xl backdrop-blur-lg hidden sm:block"
                    >
                      <img
                        src={activeSlide.heroSecondary}
                        alt=""
                        className="size-full rounded-xl object-cover"
                      />
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Action Button & Carousel Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                {activeSlide.external && !launched ? (
                  <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-white/30 px-6 py-3 text-xs font-bold text-white">
                    Ordering opens {LAUNCH_DATE_LABEL}
                  </span>
                ) : activeSlide.external ? (
                  <a
                    href={activeSlide.ctaLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-primary shadow-xl transition-all hover:bg-accent-light hover:text-primary active:scale-95"
                  >
                    <MessageCircle className="size-4 fill-green-600 text-green-600" />
                    {activeSlide.cta}
                    <ArrowRight className="size-4" />
                  </a>
                ) : (
                  <a
                    href={activeSlide.ctaLink}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-primary shadow-xl transition-all hover:bg-accent-light hover:text-primary active:scale-95"
                  >
                    {activeSlide.cta}
                    <ArrowRight className="size-4" />
                  </a>
                )}
              </div>

              {/* Navigation Arrows & Indicators */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous Slide"
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/30"
                >
                  <ChevronLeft className="size-5" />
                </button>

                <div className="flex gap-1.5">
                  {HERO_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentSlide === idx ? "w-6 bg-accent-light" : "w-2 bg-white/30"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next Slide"
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/30"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. "WHAT'S ON YOUR MIND?" SWIGGY/ZOMATO CATEGORY SLIDER */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
              What&apos;s on your mind?
              <Sparkles className="size-5 text-accent" />
            </h3>
            <p className="text-xs font-semibold text-muted-foreground">
              Explore Jonai&apos;s favourite dishes & services
            </p>
          </div>

          <Link
            to="/app/food"
            className="flex items-center gap-1 text-xs font-extrabold text-accent hover:text-primary transition-colors"
          >
            <span>See all menu</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {/* Circular Category Avatars Container */}
        <div className="-mx-4 flex items-center gap-4 overflow-x-auto px-4 pb-4 pt-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => (
            <CategoryTile key={cat.id} cat={cat} />
          ))}
        </div>
      </div>

      {/* 4. PERKS & TRUST STRIP */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="group relative overflow-hidden flex items-center gap-3 rounded-2xl border border-border/80 bg-gradient-to-br from-emerald-950/40 via-card to-card p-3 shadow-soft transition-all duration-300 hover:border-emerald-500/40">
            <svg
              className="pointer-events-none absolute -right-2 -bottom-2 size-16 text-emerald-500/10 transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
            >
              <path d="M10 50 Q50 20 90 50" strokeWidth="4" strokeDasharray="6 6" />
              <path d="M30 80 L70 20" strokeWidth="3" />
            </svg>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 shadow-sm group-hover:bg-emerald-500 group-hover:text-emerald-950 transition-colors">
              <Zap className="size-5" />
            </div>
            <div className="min-w-0 z-10">
              <div className="text-xs font-extrabold text-foreground">15–25 Min Delivery</div>
              <div className="text-[10px] font-semibold text-muted-foreground">Fast in Jonai</div>
            </div>
          </div>

          <div className="group relative overflow-hidden flex items-center gap-3 rounded-2xl border border-border/80 bg-gradient-to-br from-amber-950/40 via-card to-card p-3 shadow-soft transition-all duration-300 hover:border-amber-500/40">
            <svg
              className="pointer-events-none absolute -right-2 -bottom-2 size-16 text-amber-500/10 transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <circle cx="50" cy="50" r="30" opacity="0.2" />
            </svg>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 shadow-sm group-hover:bg-amber-500 group-hover:text-amber-950 transition-colors">
              <Percent className="size-5" />
            </div>
            <div className="min-w-0 z-10">
              <div className="text-xs font-extrabold text-foreground">
                Delivery from ₹{MIN_DELIVERY_FEE}
              </div>
              <div className="text-[10px] font-semibold text-muted-foreground">
                No hidden charges
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden flex items-center gap-3 rounded-2xl border border-border/80 bg-gradient-to-br from-cyan-950/40 via-card to-card p-3 shadow-soft transition-all duration-300 hover:border-cyan-500/40">
            <svg
              className="pointer-events-none absolute -right-2 -bottom-2 size-16 text-cyan-500/10 transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
            >
              <path d="M50 10 L85 25 V55 Q50 90 50 90 Q50 90 15 55 V25 Z" strokeWidth="3" />
            </svg>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 shadow-sm group-hover:bg-cyan-500 group-hover:text-cyan-950 transition-colors">
              <ShieldCheck className="size-5" />
            </div>
            <div className="min-w-0 z-10">
              <div className="text-xs font-extrabold text-foreground">100% Safe Packaging</div>
              <div className="text-[10px] font-semibold text-muted-foreground">
                Hygienic & sealed
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden flex items-center gap-3 rounded-2xl border border-border/80 bg-gradient-to-br from-rose-950/40 via-card to-card p-3 shadow-soft transition-all duration-300 hover:border-rose-500/40">
            <svg
              className="pointer-events-none absolute -right-2 -bottom-2 size-16 text-rose-500/10 transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path d="M50 0 L63 37 L100 50 L63 63 L50 100 L37 63 L0 50 L37 37 Z" opacity="0.2" />
            </svg>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 shadow-sm group-hover:bg-rose-500 group-hover:text-rose-950 transition-colors">
              <Sparkles className="size-5" />
            </div>
            <div className="min-w-0 z-10">
              <div className="text-xs font-extrabold text-foreground">Zero Commission</div>
              <div className="text-[10px] font-semibold text-muted-foreground">
                Direct shop price
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

