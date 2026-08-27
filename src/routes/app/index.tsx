import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Cake,
  ChevronRight,
  Pill,
  UtensilsCrossed,
  Droplet,
  Home,
  FlaskConical,
  Calendar,
  CheckCircle2,
  Bike,
  ShieldCheck,
  Award,
  Headphones,
  Shield,
  MessageCircle,
  MapPin,
  Search,
  Sparkles,
  Percent,
  ArrowRight,
} from "lucide-react";

import { useAccount } from "@/lib/account";
import { MIN_DELIVERY_FEE } from "@/lib/menu";
import { RESTAURANTS, priceFrom, restaurantsIn } from "@/lib/restaurants";
import { LiveBanner } from "@/components/poba/LiveBanner";
import { ZomatoTopBanner } from "@/components/poba/ZomatoTopBanner";
import { RestaurantTile } from "@/components/app/Shared";

export const Route = createFileRoute("/app/")({
  component: AppHome,
});

const categories = [
  {
    to: "/app/food",
    label: "Food",
    soon: false,
    hint: "Biryani, momos,\npizza & more",
    icon: UtensilsCrossed,
    bgClass: "bg-[#F4FBF4]",
    iconBgClass: "bg-[#E6F5E6]",
    iconColorClass: "text-[#1B5E20]", // green
  },
  {
    to: "/app/cake",
    label: "Cakes",
    soon: false,
    hint: "Fresh cakes for\nevery occasion",
    icon: Cake,
    bgClass: "bg-[#FFF5F5]",
    iconBgClass: "bg-[#FFEBEB]",
    iconColorClass: "text-[#D32F2F]", // red
  },
  {
    to: "/app/medicine",
    label: "Medicine",
    soon: false,
    hint: "Send prescription,\nget it delivered",
    icon: Pill,
    bgClass: "bg-[#F0F8FF]",
    iconBgClass: "bg-[#E0F0FF]",
    iconColorClass: "text-[#1976D2]", // blue
  },
  {
    to: "/app/medicine",
    label: "Health Tests",
    soon: true,
    hint: "Blood tests\nat home",
    icon: Droplet,
    bgClass: "bg-[#F5F3FF]",
    iconBgClass: "bg-[#EDE9FF]",
    iconColorClass: "text-[#D32F2F]", // red blood drop
  },
] as const;

const promises = [
  { icon: Bike, label: "Fast Delivery", detail: "At your doorstep" },
  { icon: ShieldCheck, label: "Safe & Secure", detail: "Your safety is our priority" },
  { icon: Award, label: "Trusted Partners", detail: "Quality you can rely on" },
  { icon: Headphones, label: "24/7 Support", detail: "We're here to help" },
] as const;

function AppHome() {
  const { profile } = useAccount();

  return (
    <div className="font-sans pb-6">
      {/* Whether we are open, said on the screen people actually order from.
          Until now this only appeared on the marketing page, so anyone who
          installed the app and opened it first found out at checkout. */}
      <div className="pt-4">
        <LiveBanner />
      </div>

      {/* Premium Zomato/Swiggy Layout top section */}
      <ZomatoTopBanner />

      {/* Quick Category Filter Pills */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 -mt-2 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { label: "⚡ Fast Delivery (15-25 min)", to: "/app/food" },
            { label: "⭐ Top Rated Kitchens", to: "/app/food" },
            { label: "🎂 Fresh Birthday Cakes", to: "/app/cake" },
            { label: "🍕 Handcrafted Pizzas", to: "/app/r/dispy-bakery" },
            { label: "🥟 Steamed & Fried Momos", to: "/app/r/prarthona" },
            { label: "💊 24/7 Medicines", to: "/app/medicine" },
          ].map((pill) => (
            <Link
              key={pill.label}
              to={pill.to}
              className="shrink-0 rounded-full border border-border/80 bg-card px-4 py-2 text-xs font-bold text-foreground/90 shadow-sm backdrop-blur-md transition-all hover:border-accent hover:bg-accent/10 hover:text-accent active:scale-95"
            >
              {pill.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Top Brands For You Rail */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-10">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Top brands for you
            </h3>
            <p className="text-xs font-semibold text-muted-foreground mt-0.5">
              Explore trusted kitchens and bakeries across Jonai
            </p>
          </div>
          <Link
            to="/app/food"
            className="flex items-center gap-1 text-xs font-extrabold text-accent hover:underline"
          >
            <span>See all (4)</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
        <div className="-mx-4 flex items-stretch gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          {RESTAURANTS.map((restaurant) => (
            <RestaurantTile key={restaurant.slug} restaurant={restaurant} />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-4">
        {/* The photo that used to sit here was an absolutely-positioned half of
            the card behind text that ran 65% wide, so the button and the line
            under it were overlapped and unreadable. The panel stacks instead:
            nothing overlaps at any width, and the artwork is drawn rather than
            hotlinked from a stock library. */}
        {/* Home Blood Sample Collection Banner */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-[#092918] via-[#0e3b23] to-[#155332] text-white shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-emerald-300 shadow-inner backdrop-blur-md border border-white/20">
                <Home className="size-6 stroke-[2]" />
                <Droplet className="absolute -bottom-1 -right-1 size-4 fill-rose-500 text-rose-500" />
              </span>
              <div className="min-w-0">
                <span className="inline-block rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase text-amber-300 border border-amber-400/30">
                  HEALTHCARE ESSENTIALS • COMING SOON
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Home Blood Sample Collection
                </h2>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="mb-4 text-sm font-semibold text-emerald-200">
              Professional diagnostic blood tests collected right from the comfort of your home.
            </p>

            <ul className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <li className="flex items-center gap-2.5 rounded-2xl bg-black/25 p-3 backdrop-blur-md border border-white/10">
                <span className="shrink-0 rounded-xl bg-emerald-500/20 p-2 text-emerald-300">
                  <Home className="size-4" />
                </span>
                <span className="text-xs font-semibold text-white/90">
                  Trained phlebotomists visit your home
                </span>
              </li>
              <li className="flex items-center gap-2.5 rounded-2xl bg-black/25 p-3 backdrop-blur-md border border-white/10">
                <span className="shrink-0 rounded-xl bg-emerald-500/20 p-2 text-emerald-300">
                  <FlaskConical className="size-4" />
                </span>
                <span className="text-xs font-semibold text-white/90">
                  Full body & diagnostic checkups
                </span>
              </li>
              <li className="flex items-center gap-2.5 rounded-2xl bg-black/25 p-3 backdrop-blur-md border border-white/10">
                <span className="shrink-0 rounded-xl bg-emerald-500/20 p-2 text-emerald-300">
                  <MessageCircle className="size-4" />
                </span>
                <span className="text-xs font-semibold text-white/90">
                  Reports delivered directly on WhatsApp
                </span>
              </li>
            </ul>

            <button
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3.5 text-xs font-black uppercase tracking-wider text-white/70 border border-white/10 backdrop-blur-md"
            >
              <Calendar className="size-4" />
              <span>Booking Opens Soon in Jonai</span>
            </button>
          </div>
        </div>

        {/* 4 Trust Feature Cards */}
        <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {promises.map((p) => (
            <div
              key={p.label}
              className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-card p-4 shadow-sm backdrop-blur-md transition-all hover:shadow-md hover:border-accent/40"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <p.icon className="size-5 stroke-[2]" />
              </span>
              <div>
                <div className="text-xs font-extrabold text-foreground">{p.label}</div>
                <div className="text-[11px] font-medium text-muted-foreground mt-0.5">
                  {p.detail}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Banner */}
        <div className="relative mb-2 flex items-center justify-between gap-3 overflow-hidden rounded-xl bg-[#0f4427] p-3 shadow-md">
          <div className="relative z-10 flex min-w-0 items-center gap-3">
            <span className="shrink-0 rounded-lg bg-white/20 p-2">
              <Shield className="size-6 stroke-[1.5] text-white" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[13px] font-bold text-white">Your Health. Our Priority.</h3>
              <p className="mt-0.5 text-[10px] text-white/80">Safe • Hygienic • Reliable</p>
            </div>
          </div>

          {/* Wordmark rather than a photo: the stock delivery picture here was
            hotlinked from Unsplash, so it broke the panel whenever that URL
            moved and pulled a third-party request into every page view. */}
          <div className="relative z-10 flex shrink-0 flex-col items-center pr-1">
            <span className="text-sm font-extrabold italic tracking-wide text-white">POBA</span>
            <span className="-mt-1 text-[9px] font-bold tracking-widest text-[#f36b21]">
              EXPRESS
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-0 right-0 h-full w-32 opacity-20">
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full fill-white"
              preserveAspectRatio="none"
            >
              <path d="M100,100 L0,100 C30,70 70,30 100,0 Z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
