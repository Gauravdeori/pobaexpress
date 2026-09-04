import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Cake,
  ChevronRight,
  Pill,
  ShieldCheck,
  Sparkles,
  Star,
  UtensilsCrossed,
  Zap,
  Percent,
  ArrowRight,
} from "lucide-react";

import biryaniImg from "@/assets/biryani.png";
import momosImg from "@/assets/momos.png";
import cakeCategoryImg from "@/assets/cake_category.jpg";
import chowmeinImg from "@/assets/chowmein.png";
import msMaaHotelImg from "@/assets/ms_maa_hotel_cover.jpg";
import chocolateCakeImg from "@/assets/chocolate-cake.jpg";
import { PHARMACIES } from "@/lib/pharmacies";
import { RESTAURANTS, priceFrom } from "@/lib/restaurants";
import { LiveBanner } from "@/components/poba/LiveBanner";

export const Route = createFileRoute("/app/")({
  component: AppHome,
});

/** Top category items matching the user's screenshot */
const topCategories = [
  {
    name: "Biriyani",
    image: biryaniImg,
    to: "/app/food",
    search: { q: "biryani" },
  },
  {
    name: "Local Thalis",
    image: msMaaHotelImg,
    to: "/app/food",
    search: { q: "thali" },
  },
  {
    name: "Momos",
    image: momosImg,
    to: "/app/food",
    search: { q: "momo" },
  },
  {
    name: "Cakes",
    image: cakeCategoryImg,
    to: "/app/r/montu-fast-food",
  },
  {
    name: "Pegu Drugs House",
    isPharmacyIcon: true,
    to: "/app/medicine",
  },
  {
    name: "Medicine",
    isMedicineIcon: true,
    isNew: true,
    to: "/app/medicine",
  },
];

/** Trust cards matching the 2x2 grid in screenshot */
const trustPromises = [
  {
    icon: Zap,
    iconBg: "bg-emerald-500/10 text-emerald-600",
    label: "15–35 Min Delivery",
    detail: "Fast in Jonai",
  },
  {
    icon: Percent,
    iconBg: "bg-amber-500/10 text-amber-600",
    label: "Delivery from ₹5",
    detail: "No hidden charges",
  },
  {
    icon: ShieldCheck,
    iconBg: "bg-sky-500/10 text-sky-600",
    label: "100% Safe Packaging",
    detail: "Hygienic & sealed",
  },
  {
    icon: Sparkles,
    iconBg: "bg-rose-500/10 text-rose-600",
    label: "Zero Commission",
    detail: "Direct shop price",
  },
];

function AppHome() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-4 font-sans pb-10">
      <LiveBanner />

      {/* Promotional Banner (Montu Cake Offer) */}
      <div className="mb-6 relative overflow-hidden rounded-3xl shadow-sm border border-emerald-500/30">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f3622] via-[#155431] to-[#1a7341]"></div>
        {/* Confetti SVG */}
        <svg className="absolute inset-0 size-full text-emerald-300/[0.15]" viewBox="0 0 400 200" fill="currentColor">
          <circle cx="40" cy="30" r="5" />
          <circle cx="120" cy="70" r="4" />
          <circle cx="280" cy="40" r="6" />
          <circle cx="340" cy="90" r="4" />
          <circle cx="200" cy="20" r="5" />
          <rect x="70" y="45" width="10" height="10" rx="3" transform="rotate(25 70 45)" />
          <rect x="250" y="80" width="12" height="8" rx="3" transform="rotate(-35 250 80)" />
          <rect x="160" y="110" width="10" height="10" rx="3" transform="rotate(45 160 110)" />
        </svg>

        <div className="relative z-10 p-5 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm backdrop-blur-md border border-white/20">
                <Cake className="size-3" />
                HAPPY TEACHER'S DAY
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-200 border border-emerald-400/30">
                MONTU FAST FOOD
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Special Cake Offer
            </h2>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="rounded bg-white/20 px-2 py-0.5 text-[11px] font-black text-white border border-white/20">
                FLAT ₹800
              </span>
              <span className="text-sm font-bold text-emerald-50">1 kg Cake</span>
            </div>
            <p className="mt-2 text-xs font-medium text-emerald-100/90 max-w-[200px] leading-relaxed">
              Sweet way to say Thank You. Same Day Delivery in Jonai.
            </p>
            <Link
              to="/app/r/montu-fast-food"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[11px] font-bold text-emerald-900 shadow-xl transition-transform active:scale-95"
            >
              Order Now <ArrowRight className="size-3" />
            </Link>
          </div>
          
          <div className="relative size-28 sm:size-32 shrink-0 rounded-full border-[3px] border-white/30 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm p-1">
            <img 
              src={chocolateCakeImg} 
              alt="Chocolate Cake" 
              className="size-full rounded-full object-cover"
            />
            <div className="absolute -bottom-2 -right-2 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-amber-300 backdrop-blur-md border border-amber-400/30 shadow-lg">
              FRESH
            </div>
          </div>
        </div>
      </div>

      {/* Top 6 Category Rail (Pixel Perfect to Screenshot) */}
      <div className="mb-6 grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
        {topCategories.map((cat) => (
          <Link
            key={cat.name}
            to={cat.to}
            search={cat.search}
            className="group relative flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-2 shadow-sm transition-all duration-200 hover:border-emerald-500/50 hover:shadow-md active:scale-95 text-center h-28"
          >
            {/* NEW Badge */}
            {cat.isNew && (
              <span className="absolute -top-1.5 -right-1 z-10 rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
                NEW
              </span>
            )}

            <div className="relative mb-1.5 flex size-12 items-center justify-center rounded-xl overflow-hidden bg-secondary/50">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="size-full object-cover" />
              ) : cat.isPharmacyIcon ? (
                /* Pegu Drugs House Green Pharmacy Building Icon */
                <div className="flex size-full flex-col items-center justify-center bg-emerald-700 text-white">
                  <span className="text-2xl">🏥</span>
                </div>
              ) : (
                /* Medicine Bottle & Pills Icon */
                <div className="flex size-full items-center justify-center bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                  <span className="text-2xl">🧴</span>
                </div>
              )}
            </div>

            <span className="text-xs font-extrabold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 line-clamp-1">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      {/* "Top brands for you" Header */}
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">Top brands for you</h2>
          <p className="text-xs font-medium text-muted-foreground mt-0.5">
            Explore trusted kitchens, pharmacies and bakeries across Jonai
          </p>
        </div>
        <Link
          to="/app/food"
          className="flex items-center gap-0.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          <span>See all</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {/* 1. MEDICINE SECTION (Mint Green Card Container) */}
      <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/20 p-4 sm:p-5 shadow-sm">
        {/* Section Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Pill className="size-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-emerald-950 dark:text-emerald-200">
                Medicine
              </h3>
              <p className="text-xs font-medium text-muted-foreground">Trusted pharmacies</p>
            </div>
          </div>
          <Link
            to="/app/medicine"
            className="flex items-center gap-0.5 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 hover:underline"
          >
            <span>See all ({PHARMACIES.length})</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {/* Pharmacy Cards Rail */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PHARMACIES.map((pharmacy) => (
            <Link
              key={pharmacy.slug}
              to="/app/medicine"
              className="group overflow-hidden rounded-2xl border border-border/80 bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-emerald-500/40"
            >
              <div className="relative h-36 w-full overflow-hidden rounded-xl bg-secondary">
                <img
                  src={pharmacy.image}
                  alt={pharmacy.name}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Rating Badge Overlay */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-emerald-800 px-2 py-0.5 text-xs font-bold text-white shadow-md">
                  <Star className="size-3 fill-white text-white" />
                  <span>{pharmacy.rating}</span>
                </div>
              </div>

              <div className="mt-3">
                <h4 className="text-base font-extrabold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {pharmacy.name}
                </h4>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                  {pharmacy.categoryLine1}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {pharmacy.categoryLine2}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                  <span className="flex items-center gap-1 font-extrabold text-emerald-700 dark:text-emerald-400">
                    <span className="inline-block size-1.5 rounded-full bg-emerald-600" />
                    {pharmacy.eta}
                  </span>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {pharmacy.fulfillment}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. RESTAURANTS SECTION (Soft Pink Card Container) */}
      <div className="mb-6 rounded-3xl border border-rose-500/20 bg-rose-500/10 dark:bg-rose-950/20 p-4 sm:p-5 shadow-sm">
        {/* Section Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
              <UtensilsCrossed className="size-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-rose-950 dark:text-rose-200">Restaurants</h3>
              <p className="text-xs font-medium text-muted-foreground">
                Your favourite restaurants
              </p>
            </div>
          </div>
          <Link
            to="/app/food"
            className="flex items-center gap-0.5 text-xs font-extrabold text-rose-800 dark:text-rose-300 hover:underline"
          >
            <span>See all ({RESTAURANTS.length})</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {/* Restaurant Cards Rail */}
        <div className="-mx-1 flex items-stretch gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {RESTAURANTS.slice(0, 3).map((r, i) => {
            const ratings = [4.3, 4.3, 4.2];
            const startingPrices = [63, 49, 60];
            const rating = ratings[i] ?? 4.3;
            const fromPrice = startingPrices[i] ?? priceFrom(r);
            const foodImages = [chowmeinImg, momosImg, msMaaHotelImg];
            const displayImage = foodImages[i] ?? r.image;

            return (
              <Link
                key={r.slug}
                to={`/app/r/${r.slug}`}
                className="group flex w-64 shrink-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-rose-500/40"
              >
                <div className="relative h-32 w-full overflow-hidden rounded-xl bg-secondary">
                  {displayImage && (
                    <img
                      src={displayImage}
                      alt={r.name}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}

                  {/* Price Tag Overlay bottom left */}
                  <div className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
                    FROM ₹{fromPrice}
                  </div>

                  {/* Rating Badge top right */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-emerald-800 px-2 py-0.5 text-xs font-bold text-white shadow-md">
                    <Star className="size-3 fill-white text-white" />
                    <span>{rating}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-1 flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-foreground group-hover:text-rose-700 dark:group-hover:text-rose-400 truncate">
                      {r.name}
                    </h4>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5 line-clamp-1">
                      {r.cuisine}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                    <span className="flex items-center gap-1 font-extrabold text-emerald-700 dark:text-emerald-400">
                      <span className="inline-block size-1.5 rounded-full bg-emerald-600" />
                      15–35 min
                    </span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      Doorstep
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. 2x2 TRUST FEATURES GRID */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {trustPromises.map((p) => (
          <div
            key={p.label}
            className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-sm transition-all hover:border-emerald-500/40"
          >
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${p.iconBg}`}
            >
              <p.icon className="size-5 stroke-[2]" />
            </span>
            <div>
              <div className="text-xs font-extrabold text-foreground">{p.label}</div>
              <div className="text-[11px] font-medium text-muted-foreground">{p.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { label: "⚡ Fast Delivery (15–35 min)", to: "/app/food" },
          { label: "🍱 Traditional & Local Thali", to: "/app/food?q=thali" },
        ].map((pill) => (
          <Link
            key={pill.label}
            to={pill.to}
            className="shrink-0 rounded-full border border-border/80 bg-card px-4 py-2 text-xs font-extrabold text-foreground/90 shadow-sm backdrop-blur-md transition-all hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-700 active:scale-95"
          >
            {pill.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

