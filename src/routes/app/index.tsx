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
} from "lucide-react";

import { useAccount } from "@/lib/account";
import { LAUNCH_DATE_LABEL, useLaunched } from "@/lib/launch";

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

function AppHome() {
  const launched = useLaunched();
  const { profile } = useAccount();

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 font-sans">
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

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#f8fcf9] to-[#ebf5ef] mb-6">
        {/* Placeholder for the doctor image on the right */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden flex justify-end">
          <img
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop"
            alt="Doctor taking blood sample"
            className="object-cover object-right h-full w-full opacity-90 rounded-r-2xl"
          />
        </div>

        {/* Overlapping badge on image */}
        <div className="absolute top-8 right-16 bg-white rounded-full p-2 py-3 w-[80px] h-[80px] flex flex-col items-center justify-center shadow-md z-10 border-2 border-white">
          <div className="relative">
            <Home className="size-6 text-green-700 stroke-[1.5]" />
            <Droplet className="size-3 text-red-500 absolute -bottom-1 -right-1 fill-red-500" />
          </div>
          <span className="text-[9px] font-bold text-center leading-tight mt-1 text-gray-800">
            Blood Test
            <br />
            at Home
          </span>
        </div>

        <div className="relative z-10 p-5 w-[65%]">
          <div className="mb-3 inline-block rounded bg-[#8a5a00] px-2 py-1 text-[10px] font-bold text-white">
            COMING SOON
          </div>

          <h2 className="text-2xl font-extrabold text-[#1a2f26] leading-tight mb-1">
            Home Blood
            <br />
            Sample Collection
          </h2>
          <p className="text-[#0d6138] text-sm font-semibold mb-4">Healthcare at your doorstep</p>

          <ul className="space-y-3 mb-5">
            <li className="flex items-start gap-2">
              <div className="bg-[#dcf0e3] p-1.5 rounded-full mt-0.5">
                <Home className="size-4 text-green-800" />
              </div>
              <span className="text-xs text-gray-700 font-medium leading-snug">
                Trained professionals visit your home to collect blood samples.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="bg-[#dcf0e3] p-1.5 rounded-full mt-0.5">
                <FlaskConical className="size-4 text-green-800" />
              </div>
              <span className="text-xs text-gray-700 font-medium leading-snug">
                Wide range of blood and diagnostic tests available.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="bg-[#dcf0e3] p-1.5 rounded-full mt-0.5">
                <MessageCircle className="size-4 text-green-800 fill-green-800" />
              </div>
              <span className="text-xs text-gray-700 font-medium leading-snug">
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
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#0a3821]/40 px-4 py-3 text-xs font-bold text-white shadow-md"
          >
            <Calendar className="size-4" />
            BOOKING OPENS SOON
          </button>
          <p className="mt-2 text-center text-[10px] font-medium text-gray-600">
            We&rsquo;ll announce the date here once collection starts.
          </p>

          <div className="flex items-center gap-1.5 mt-4">
            <CheckCircle2 className="size-4 text-green-700" />
            <span className="text-[10px] text-gray-600 font-medium leading-tight">
              In association with
              <br />
              trusted diagnostic partners
            </span>
          </div>
        </div>
      </div>

      {/* Trust Rail */}
      <div className="flex justify-between items-center gap-2 mb-6 px-1">
        <div className="flex items-center gap-2 max-w-[25%]">
          <Bike className="size-7 text-green-800 stroke-[1.5]" />
          <div>
            <div className="text-[10px] font-bold text-gray-900">Fast Delivery</div>
            <div className="text-[9px] text-gray-500 leading-tight">At your doorstep</div>
          </div>
        </div>
        <div className="flex items-center gap-2 max-w-[25%]">
          <ShieldCheck className="size-7 text-green-800 stroke-[1.5]" />
          <div>
            <div className="text-[10px] font-bold text-gray-900">Safe & Secure</div>
            <div className="text-[9px] text-gray-500 leading-tight">
              Your safety is
              <br />
              our priority
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 max-w-[25%]">
          <Award className="size-7 text-green-800 stroke-[1.5]" />
          <div>
            <div className="text-[10px] font-bold text-gray-900">Trusted Partners</div>
            <div className="text-[9px] text-gray-500 leading-tight">
              Quality you can
              <br />
              rely on
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 max-w-[25%]">
          <Headphones className="size-7 text-green-800 stroke-[1.5]" />
          <div>
            <div className="text-[10px] font-bold text-gray-900">24/7 Support</div>
            <div className="text-[9px] text-gray-500 leading-tight">
              We're here
              <br />
              to help
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Trust Banner */}
      <div className="bg-[#0f4427] rounded-xl p-3 flex items-center justify-between shadow-md mb-2 relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-white/20 p-2 rounded-lg">
            <Shield className="size-6 text-white stroke-[1.5]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-0.5">
              <span className="block w-2 h-2.5 border-2 border-white rounded-t-sm border-b-0"></span>
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold text-[13px]">Your Health. Our Priority.</h3>
            <p className="text-white/80 text-[10px] mt-0.5">Safe • Hygienic • Reliable</p>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-end pr-2">
          {/* Poba Express Logo placeholder */}
          <div className="flex flex-col items-center">
            <span className="text-white font-extrabold text-sm italic tracking-wide">POBA</span>
            <span className="text-[#f36b21] font-bold text-[9px] -mt-1 tracking-widest">
              EXPRESS
            </span>
          </div>
          {/* Delivery icon placeholder */}
          <div className="mt-1 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=150&auto=format&fit=crop"
              className="size-8 rounded-full border border-white/20 object-cover"
              alt="Delivery illustration"
            />
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-0 bottom-0 w-32 h-full opacity-20 pointer-events-none">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full fill-white"
            preserveAspectRatio="none"
          >
            <path d="M100,100 L0,100 C30,70 70,30 100,0 Z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
