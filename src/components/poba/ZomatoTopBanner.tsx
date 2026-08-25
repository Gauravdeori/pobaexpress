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
import pizzaImg from "@/assets/pizza.jpg";
import chocolateCakeImg from "@/assets/chocolate-cake.jpg";
import cakeCategoryImg from "@/assets/cake_category.jpg";
import medicineCategoryImg from "@/assets/medicine_category.jpg";
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
    tag: "Fast Food Fav",
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
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    title: `Fast Doorstep Delivery in Jonai`,
    highlight: `Zero Commission • Delivery from ₹${MIN_DELIVERY_FEE}`,
    description:
      "Order hot meals, sizzling momos, fresh birthday cakes, and urgent medicines delivered in 15–25 mins.",
    cta: "Download the App to Order",
    ctaLink: "/app",
    external: false,
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
    features: ["⚡ 15–25 Min Delivery", "🥟 Steamed & Fried Momos", "🔥 Cooked Fresh"],
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
    ctaLink: "/app/cake",
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
            {/* Background Decorative Mesh Glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 size-[450px] rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-1/4 size-72 rounded-full bg-black/20 blur-2xl" />

            {/* Top Bar on Banner */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm ${activeSlide.badgeBg}`}
              >
                <activeSlide.tagIcon className="size-3.5" />
                {activeSlide.badge}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide text-white backdrop-blur-md border border-white/20 shadow-sm">
                {activeSlide.code}
              </span>
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
              <div className="text-xs font-extrabold text-foreground">Order in the App</div>
              <div className="text-[10px] font-semibold text-muted-foreground">
                Ready in a few taps
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
