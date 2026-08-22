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
import { priceFrom, restaurantsIn } from "@/lib/restaurants";
import { LAUNCH_DATE_LABEL, useLaunched } from "@/lib/launch";
import { whatsappLink } from "@/lib/contact";

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

  /* Read off the menu rather than written into the copy: the banner used to
     claim "50% OFF", which no partner offers and nothing in the code applies,
     and a flat ₹5 fee on categories that charge ₹20 and ₹30. */
  const foodFrom = Math.min(...restaurantsIn("food").map(priceFrom));

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 font-sans space-y-6">
      {/* Zomato / Swiggy Style App Location & Search Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0a2717] to-[#124227] p-4 text-white shadow-xl">
        {/* `truncate` needs min-w-0 the whole way up a flex chain, or the text
            refuses to shrink and pushes the fee badge off the card instead —
            a saved address is a full postal line, not "Jonai, Assam". */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
              <MapPin className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Deliver To
              </div>
              <div className="truncate text-xs font-bold text-white">
                {profile?.address?.trim() || "Jonai, Assam"}
              </div>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/20 px-2.5 py-1 text-[10px] font-extrabold text-amber-300">
            <Percent className="size-3" />
            DELIVERY FROM ₹{MIN_DELIVERY_FEE}
          </span>
        </div>

        {/* Search Bar Input */}
        <Link
          to="/app/food"
          className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2.5 text-xs text-white/70 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all"
        >
          <Search className="size-4 text-emerald-400 shrink-0" />
          <span className="min-w-0 truncate">
            Search for biryani, momos, cake, medicines&hellip;
          </span>
        </Link>

        {/* No promotion here, because there is no promotion to report. This
            said "50% OFF at Biryani Bite & Local Partners"; no partner gives
            that and no code applies it, so it would have been a discount the
            customer discovers does not exist at checkout. It carries the real
            starting price instead — the same rule Spotlight.tsx follows. */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-950/60 p-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
              <Sparkles className="size-3.5 shrink-0 text-amber-400" />
              <span className="min-w-0 truncate">Food from ₹{foodFrom} at Jonai kitchens</span>
            </div>
            <p className="mt-0.5 text-[10px] text-white/70">
              {launched
                ? "Fast 15–25 min doorstep delivery in Jonai town"
                : `Browse now — ordering opens ${LAUNCH_DATE_LABEL}`}
            </p>
          </div>

          {/* Ordering is gated everywhere else in the app until launch day, so
              a live WhatsApp button here would be the one door left open. */}
          {launched ? (
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-gray-950 shadow-md transition-colors hover:bg-emerald-400"
            >
              <span>Order</span>
              <ArrowRight className="size-3" />
            </a>
          ) : (
            <Link
              to="/app/food"
              className="flex shrink-0 items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-white/20"
            >
              <span>Menu</span>
              <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
      </div>

      {/* What do you need Section */}
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold text-[#1a2f26]">What do you need?</h1>
        <Link
          to="/app/food"
          className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-[#1a2f26]"
        >
          See all
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {categories.map((c) => {
          const className = `relative flex flex-col items-center gap-2 rounded-[20px] ${c.bgClass} px-1.5 py-4 text-center transition-all duration-200 ${
            c.soon ? "opacity-70" : "active:scale-[0.97]"
          }`;

          const body = (
            <>
              {c.soon && (
                <span className="absolute right-1.5 top-1.5 rounded-full bg-[#0f4427] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                  Soon
                </span>
              )}
              <span
                className={`flex size-14 items-center justify-center rounded-full ${c.iconBgClass} ${c.iconColorClass} shadow-sm`}
              >
                <c.icon className="size-7" />
              </span>
              <span className="min-w-0">
                <span className="mb-1 block text-[13px] font-bold text-[#1a2f26]">{c.label}</span>
                <span className="block whitespace-pre-wrap text-[10px] leading-[1.2] text-gray-500">
                  {c.hint}
                </span>
              </span>
            </>
          );

          /* A service we cannot deliver yet is shown but not linked: tapping
             "Health Tests" and landing on the medicine form would be a promise
             we can't keep. This becomes a Link the day booking opens. */
          return c.soon ? (
            <div key={c.label} aria-disabled className={className}>
              {body}
            </div>
          ) : (
            <Link key={c.label} to={c.to} className={className}>
              {body}
            </Link>
          );
        })}
      </div>

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
          <span className="-mt-1 text-[9px] font-bold tracking-widest text-[#f36b21]">EXPRESS</span>
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
  );
}
