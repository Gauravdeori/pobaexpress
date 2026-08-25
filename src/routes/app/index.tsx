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
import { LAUNCH_DATE_LABEL, useLaunched } from "@/lib/launch";
import { whatsappLink } from "@/lib/contact";
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
  const launched = useLaunched();
  const { profile } = useAccount();

  return (
    <div className="font-sans pb-6">
      {/* Premium Zomato/Swiggy Layout top section */}
      <ZomatoTopBanner />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-2 mb-8">
        <h3 className="mb-4 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          Top brands for you
        </h3>
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
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#f8fcf9] to-[#ebf5ef] ring-1 ring-[#0f4427]/10">
          <div className="flex items-center gap-3 border-b border-[#0f4427]/10 bg-white/60 px-4 py-3">
            <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <Home className="size-6 stroke-[1.5] text-green-700" />
              <Droplet className="absolute -bottom-0.5 -right-0.5 size-3.5 fill-red-500 text-red-500" />
            </span>
            <div className="min-w-0 flex-1">
              <span className="mb-1 inline-block rounded bg-[#8a5a00] px-2 py-0.5 text-[9px] font-bold text-white">
                COMING SOON
              </span>
              <h2 className="text-lg font-extrabold leading-tight text-[#1a2f26]">
                Home Blood Sample Collection
              </h2>
            </div>
          </div>

          <div className="p-4">
            <p className="mb-3 text-sm font-semibold text-[#0d6138]">Healthcare at your doorstep</p>

            <ul className="mb-4 space-y-2.5">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 rounded-full bg-[#dcf0e3] p-1.5">
                  <Home className="size-4 text-green-800" />
                </span>
                <span className="text-xs font-medium leading-snug text-gray-700">
                  Trained professionals visit your home to collect blood samples.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 rounded-full bg-[#dcf0e3] p-1.5">
                  <FlaskConical className="size-4 text-green-800" />
                </span>
                <span className="text-xs font-medium leading-snug text-gray-700">
                  Wide range of blood and diagnostic tests available.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 rounded-full bg-[#dcf0e3] p-1.5">
                  <MessageCircle className="size-4 fill-green-800 text-green-800" />
                </span>
                <span className="text-xs font-medium leading-snug text-gray-700">
                  Reports delivered securely on WhatsApp.
                </span>
              </li>
            </ul>

            {/* Deliberately disabled rather than wired up: home collection is not
              running yet, and a button that accepted a booking we cannot honour
              is worse than one that plainly says so. Swap in the real handler
              and drop `disabled` when the service opens. */}
            <button
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#0a3821]/40 px-4 py-3 text-xs font-bold text-white"
            >
              <Calendar className="size-4" />
              BOOKING OPENS SOON
            </button>
            <p className="mt-2 text-center text-[10px] font-medium text-gray-600">
              We&rsquo;ll announce the date here once collection starts.
            </p>

            <div className="mt-3 flex items-center gap-1.5 border-t border-[#0f4427]/10 pt-3">
              <CheckCircle2 className="size-4 shrink-0 text-green-700" />
              <span className="text-[10px] font-medium leading-tight text-gray-600">
                In association with trusted diagnostic partners
              </span>
            </div>
          </div>
        </div>

        {/* Four across on a phone gave each promise about 80px, which cut every
          second line off mid-word. Two across fits the words. */}
        <div className="mb-6 grid grid-cols-2 gap-x-3 gap-y-4">
          {promises.map((p) => (
            <div key={p.label} className="flex items-center gap-2.5">
              <p.icon className="size-7 shrink-0 stroke-[1.5] text-green-800" />
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-gray-900">{p.label}</div>
                <div className="text-[10px] leading-tight text-gray-500">{p.detail}</div>
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
