import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  PartyPopper,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  X,
  Percent,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LAUNCH_DATE_LABEL, useAnnouncement, useLaunched } from "@/lib/launch";
import biryaniImg from "@/assets/biryani.png";
import momosImg from "@/assets/momos.png";
import cakeCategoryImg from "@/assets/cake_category.jpg";
import medicineCategoryImg from "@/assets/medicine_category.jpg";

export function LiveAnnouncementModal() {
  const [open, setOpen] = useState(false);
  const launched = useLaunched();
  // The launch and the first delivery are a night apart, so this announces
  // whichever has just happened. Two keys rather than one, so someone who saw
  // the launch notice in the morning is still told when ordering actually
  // opens — that is the more useful of the two messages.
  const { announced, today } = useAnnouncement();

  useEffect(() => {
    const key = launched ? "poba_live_modal_shown" : "poba_launch_modal_shown";
    const shown = sessionStorage.getItem(key);
    const isLiveHash = window.location.hash === "#live";
    const worthShowing = launched || announced;

    if (isLiveHash || (worthShowing && !shown)) {
      setOpen(true);
      if (worthShowing && !shown) {
        sessionStorage.setItem(key, "true");
      }
    }

    const handleHashChange = () => {
      if (window.location.hash === "#live") {
        setOpen(true);
      }
    };

    const handleCustomTrigger = () => {
      setOpen(true);
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("poba:trigger_live_modal", handleCustomTrigger);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("poba:trigger_live_modal", handleCustomTrigger);
    };
  }, [launched, announced]);

  const handleClose = () => {
    setOpen(false);
    if (window.location.hash === "#live") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-emerald-500/40 bg-gradient-to-b from-[#082817] via-[#0d3b22] to-[#082114] p-6 sm:p-8 text-white shadow-2xl"
          >
            {/* Background Glows & Particle SVGs */}
            <div className="pointer-events-none absolute -left-10 -top-10 size-60 rounded-full bg-emerald-500/25 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 -bottom-10 size-60 rounded-full bg-accent/20 blur-3xl" />

            {/* Floating Confetti Particle SVGs */}
            <svg
              className="pointer-events-none absolute inset-0 size-full text-emerald-300/20"
              viewBox="0 0 400 400"
              fill="currentColor"
            >
              <circle cx="50" cy="50" r="4" />
              <circle cx="350" cy="80" r="5" />
              <circle cx="120" cy="320" r="6" />
              <circle cx="280" cy="350" r="4" />
              <rect x="70" y="120" width="8" height="8" rx="2" transform="rotate(25 70 120)" />
              <rect x="300" y="200" width="10" height="6" rx="2" transform="rotate(-40 300 200)" />
              <path
                d="M40 220 Q60 240 80 220 T120 220"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="3 3"
                fill="none"
              />
              <path
                d="M260 80 Q280 100 300 80 T340 80"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="3 3"
                fill="none"
              />
            </svg>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              aria-label="Close Announcement"
            >
              <X className="size-5" />
            </button>

            {/* Top Icon / Celebration Badge */}
            <div className="relative z-10 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-emerald-300 backdrop-blur-md shadow-sm">
                <PartyPopper className="size-4 animate-bounce text-emerald-300" />
                {launched ? "WE'RE LIVE" : "OFFICIAL LAUNCH"}
              </span>
            </div>

            {/* Visual Collage Showcase */}
            <div className="relative z-10 mt-4 flex items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/15 bg-black/30 p-2 backdrop-blur-md">
              <div className="relative h-20 w-1/4 overflow-hidden rounded-xl">
                <img src={biryaniImg} alt="Biryani" className="size-full object-cover" />
                <span className="absolute bottom-1 left-1 text-[9px] font-extrabold text-white bg-black/60 px-1.5 py-0.5 rounded">
                  Biryani
                </span>
              </div>
              <div className="relative h-20 w-1/4 overflow-hidden rounded-xl">
                <img src={momosImg} alt="Momos" className="size-full object-cover" />
                <span className="absolute bottom-1 left-1 text-[9px] font-extrabold text-white bg-black/60 px-1.5 py-0.5 rounded">
                  Momos
                </span>
              </div>
              <div className="relative h-20 w-1/4 overflow-hidden rounded-xl">
                <img src={cakeCategoryImg} alt="Cakes" className="size-full object-cover" />
                <span className="absolute bottom-1 left-1 text-[9px] font-extrabold text-white bg-black/60 px-1.5 py-0.5 rounded">
                  Cakes
                </span>
              </div>
              <div className="relative h-20 w-1/4 overflow-hidden rounded-xl">
                <img src={medicineCategoryImg} alt="Medicines" className="size-full object-cover" />
                <span className="absolute bottom-1 left-1 text-[9px] font-extrabold text-white bg-black/60 px-1.5 py-0.5 rounded">
                  Medicines
                </span>
              </div>
            </div>

            {/* Modal Heading */}
            <div className="relative z-10 mt-4">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                {launched ? (
                  <>
                    Poba Express is <span className="text-emerald-400">Live Now</span> in Jonai! 🎉
                  </>
                ) : (
                  <>
                    Poba Express is <span className="text-emerald-400">Officially Launched</span>
                    {today ? " Today" : ""} in Jonai! 🎉
                  </>
                )}
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-white/85 leading-relaxed font-medium">
                {launched ? (
                  <>
                    Jonai&apos;s very own doorstep delivery service is now open! Order hot biryani,
                    sizzling momos, fresh birthday cakes, and urgent medicines delivered to your
                    door in 15–35 minutes.
                  </>
                ) : (
                  <>
                    Jonai&apos;s very own doorstep delivery service is here. Ordering begins{" "}
                    <span className="font-bold text-emerald-300">{LAUNCH_DATE_LABEL}</span> — have a
                    look at the kitchens, bakeries and prices now, and install the app so you can
                    order the moment we open.
                  </>
                )}
              </p>
            </div>

            {/* Key Features Pill Strip */}
            <div className="relative z-10 mt-6 grid grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Zap className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white">15–35 Min Delivery</div>
                  <div className="text-[10px] text-white/70">Superfast in Jonai</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Percent className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white">Delivery from ₹5</div>
                  <div className="text-[10px] text-white/70">Zero Commission</div>
                </div>
              </div>
            </div>

            {/* Perks List */}
            <ul className="relative z-10 mt-5 space-y-2 text-xs font-semibold text-white/90">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                <span>Verified local kitchens, bakeries & pharmacies</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                <span>Live doorstep order tracking with flat transparent fees</span>
              </li>
            </ul>

            {/* CTAs */}
            <div className="relative z-10 mt-7 flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/app/food"
                onClick={handleClose}
                className="inline-flex h-12 w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-bold text-emerald-950 shadow-lg transition-all hover:bg-emerald-400 active:scale-95"
              >
                <span>{launched ? "Order Now" : "Browse the Menu"}</span>
                <ArrowRight className="size-4" />
              </Link>

              <Link
                to="/app"
                onClick={handleClose}
                className="inline-flex h-12 w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-bold text-white shadow-sm backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
              >
                <Sparkles className="size-4 text-emerald-300" />
                <span>Open Poba App</span>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
