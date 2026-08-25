import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";

import biryaniImg from "@/assets/biryani.png";
import burgerImg from "@/assets/burger.png";
import momosImg from "@/assets/momos.png";
import chowmeinImg from "@/assets/chowmein.png";
import cakeCategoryImg from "@/assets/cake_category.jpg";
import medicineCategoryImg from "@/assets/medicine_category.jpg";
import { whatsappLink } from "@/lib/contact";
import { MIN_DELIVERY_FEE } from "@/lib/menu";
import { LAUNCH_DATE_LABEL, useLaunched } from "@/lib/launch";

const JONAI_LOCATIONS = [
  "Jonai Main Market",
  "Ruskin Gate",
  "Jonai P.H.C Road",
  "College Road",
  "Station Road",
  "Torajan Side",
  "Rotkey Area",
];

const SEARCH_PLACEHOLDERS = [
  "Search for 'Chicken Biryani'...",
  "Search for 'Black Forest Cake'...",
  "Search for 'Steamed Momos'...",
  "Search for 'Paracetamol & Medicine'...",
  "Search for 'Chowmein & Fried Rice'...",
];

type CategoryItem = {
  id: string;
  name: string;
  tag: string;
  image?: string;
  fallbackEmoji: string;
  color: string;
  borderColor: string;
  href: string;
};

const CATEGORIES: CategoryItem[] = [
  {
    id: "biryani",
    name: "Biryani",
    tag: "From ₹59",
    image: biryaniImg,
    fallbackEmoji: "🍗",
    color: "from-accent/15 to-accent/5",
    borderColor: "border-accent/25",
    href: "#order",
  },
  {
    id: "momos",
    name: "Momos",
    tag: "Customer Fav",
    image: momosImg,
    fallbackEmoji: "🥟",
    color: "from-accent/15 to-accent/5",
    borderColor: "border-accent/25",
    href: "#order",
  },
  {
    id: "cakes",
    name: "Cakes",
    tag: "Fresh Baked",
    image: cakeCategoryImg,
    fallbackEmoji: "🎂",
    color: "from-accent/15 to-accent/5",
    borderColor: "border-accent/25",
    href: "/app/cake",
  },
  {
    id: "burgers",
    name: "Burgers",
    tag: "Dipjoy's Special",
    image: burgerImg,
    fallbackEmoji: "🍔",
    color: "from-accent/15 to-accent/5",
    borderColor: "border-accent/25",
    href: "#order",
  },
  {
    id: "chowmein",
    name: "Chowmein",
    tag: "Chinese Delights",
    image: chowmeinImg,
    fallbackEmoji: "🍜",
    color: "from-accent/15 to-accent/5",
    borderColor: "border-accent/25",
    href: "#order",
  },
  {
    id: "medicine",
    name: "Medicines",
    tag: `Delivery from ₹${MIN_DELIVERY_FEE}`,
    image: medicineCategoryImg,
    fallbackEmoji: "💊",
    color: "from-accent/15 to-accent/5",
    borderColor: "border-accent/25",
    href: "/app/medicine",
  },
];

const HERO_SLIDES = [
  {
    id: "poba-deal",
    badge: "POBA EXPRESS EXCLUSIVE",
    badgeBg: "bg-white/15 text-accent-light border-white/25",
    title: `Delivery from ₹${MIN_DELIVERY_FEE} across Jonai`,
    highlight: "Zero Commission. Best Prices.",
    description:
      "Order fresh food, cakes, and medicines delivered right to your doorstep in 15–25 mins.",
    cta: "Order on WhatsApp",
    ctaLink: whatsappLink(),
    external: true,
    code: `OPENING ${LAUNCH_DATE_LABEL}`,
    gradient: "from-[#0a2717] via-[#113a23] to-[#0a2717]",
    accentColor: "var(--accent)",
    tagIcon: Percent,
    features: [
      "No App Download Required",
      "Instant WhatsApp Order",
      `Delivery from ₹${MIN_DELIVERY_FEE}`,
    ],
  },
  {
    id: "prarthona-deal",
    badge: "PRARTHONA RESTAURANT",
    badgeBg: "bg-white/15 text-accent-light border-white/25",
    title: "Momos, chow and everything after",
    highlight: "Starting from ₹58",
    description:
      "Fried rice, chowmein, rolls, momos and chilli chicken, cooked to order at Prarthona.",
    cta: "Explore the menu",
    ctaLink: "/app/r/prarthona",
    external: false,
    code: "COOKED TO ORDER",
    gradient: "from-[#0a2717] via-[#113a23] to-[#0a2717]",
    accentColor: "var(--accent)",
    tagIcon: Sparkles,
    features: ["⚡ Delivery in 15–25 mins", "🥟 Momos, rolls & chow", "🔥 Fresh & hot"],
  },
  {
    id: "dcakery-deal",
    badge: "DCAKERY BAKERY",
    badgeBg: "bg-white/15 text-accent-light border-white/25",
    title: "Fresh Custom Cakes & Cheesecakes",
    highlight: "Delivered in 30 Mins",
    description: "Birthday cakes, New York cheesecakes, and artisanal loaves baked with love.",
    cta: "Order Fresh Cake",
    ctaLink: "/app/cake",
    external: false,
    code: "EXPRESS CAKE DELIVERY",
    gradient: "from-[#0a2717] via-[#113a23] to-[#0a2717]",
    accentColor: "var(--accent)",
    tagIcon: Cake,
    features: ["🎂 Custom Birthday Designs", "🧀 NY Cheesecakes", "⚡ Delivered Safe"],
  },
  {
    id: "medicine-deal",
    badge: "24/7 MEDICINE DELIVERY",
    badgeBg: "bg-white/15 text-accent-light border-white/25",
    title: "Medicines & Healthcare Essentials",
    highlight: "Upload Prescription & Get Delivery",
    description: "Prescription medicines and daily healthcare products delivered to your door.",
    cta: "Upload Prescription",
    ctaLink: "/app/medicine",
    external: false,
    code: "SAFE & HYGIENIC",
    gradient: "from-[#0a2717] via-[#113a23] to-[#0a2717]",
    accentColor: "var(--accent)",
    tagIcon: Pill,
    features: ["💊 Genuine Pharmacy Stock", "📋 Prescription Order", "⚡ Urgent Delivery"],
  },
];

export function ZomatoTopBanner() {
  const launched = useLaunched();
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
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 size-4 text-accent pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                className="w-full rounded-xl border border-border/80 bg-background/80 py-2.5 pl-10 pr-24 text-xs font-medium text-foreground transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <a
                href="#order"
                className="absolute right-1.5 flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-primary active:scale-95"
              >
                <span>Search</span>
                <ArrowRight className="size-3" />
              </a>
            </div>
          </div>

          {/* Quick Offer Tag */}
          <div className="hidden shrink-0 lg:flex items-center gap-2 rounded-xl bg-accent/10 px-3.5 py-2 text-accent border border-accent/20">
            <Sparkles className="size-4 text-accent animate-pulse" />
            <span className="text-xs font-extrabold">Delivery from ₹{MIN_DELIVERY_FEE}</span>
          </div>
        </div>

        {/* Trending Search Chips */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
          <span className="shrink-0 font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
            Trending:
          </span>
          {[
            "Chicken Biryani",
            "Steamed Momos",
            "Black Forest Cake",
            "Dispy Pizza",
            "Paracetamol",
          ].map((tag) => (
            <a
              key={tag}
              href="#order"
              className="shrink-0 rounded-full border border-border/60 bg-card/80 px-3 py-1 font-semibold text-foreground/80 transition-all hover:border-accent hover:bg-accent/10 hover:text-primary"
            >
              {tag}
            </a>
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
            {/* Background Decorative Graphic */}
            <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 pointer-events-none overflow-hidden">
              <div className="absolute -right-10 -top-10 size-96 rounded-full bg-white/10 blur-3xl" />
            </div>

            {/* Top Bar on Banner */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md ${activeSlide.badgeBg}`}
              >
                <activeSlide.tagIcon className="size-3.5" />
                {activeSlide.badge}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wide text-white/90 backdrop-blur-sm border border-white/10">
                {activeSlide.code}
              </span>
            </div>

            {/* Main Content */}
            <div className="relative z-10 my-4 max-w-2xl">
              <motion.h2
                key={activeSlide.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white leading-tight"
              >
                {activeSlide.title}
              </motion.h2>

              <motion.p
                key={activeSlide.highlight}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mt-2 text-lg font-bold text-accent-light sm:text-xl"
              >
                {activeSlide.highlight}
              </motion.p>

              <motion.p
                key={activeSlide.description}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-3 text-sm text-white/80 max-w-lg leading-relaxed"
              >
                {activeSlide.description}
              </motion.p>

              {/* Feature Chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                {activeSlide.features.map((feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1 rounded-lg bg-black/30 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm border border-white/10"
                  >
                    <CheckCircle2 className="size-3 text-accent-light" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Button & Carousel Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
              <div>
                {/* The WhatsApp button is the one door that was still open
                    before launch day — the navbar, the hero, the sticky bar and
                    the order form all close on `launched`, so this closes too
                    rather than taking an order nobody is cooking for yet. */}
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

          <a
            href="#order"
            className="flex items-center gap-1 text-xs font-extrabold text-accent hover:text-primary transition-colors"
          >
            <span>See all menu</span>
            <ChevronRight className="size-4" />
          </a>
        </div>

        {/* Circular Category Avatars Container */}
        <div className="-mx-4 flex items-center gap-4 overflow-x-auto px-4 pb-4 pt-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={cat.href}
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
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-accent-light bg-accent px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-sm">
                  {cat.tag}
                </span>
              </div>

              <span className="text-xs font-extrabold text-foreground group-hover:text-accent transition-colors">
                {cat.name}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* 4. PERKS & TRUST STRIP */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Zap className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-foreground">15–25 Min Delivery</div>
              <div className="text-[10px] font-semibold text-muted-foreground">Fast in Jonai</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Percent className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-foreground">
                Delivery from ₹{MIN_DELIVERY_FEE}
              </div>
              <div className="text-[10px] font-semibold text-muted-foreground">
                No hidden charges
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <ShieldCheck className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-foreground">100% Safe Packaging</div>
              <div className="text-[10px] font-semibold text-muted-foreground">
                Hygienic & sealed
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <MessageCircle className="size-5 fill-green-600 text-green-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-foreground">WhatsApp Ordering</div>
              <div className="text-[10px] font-semibold text-muted-foreground">No app download</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
