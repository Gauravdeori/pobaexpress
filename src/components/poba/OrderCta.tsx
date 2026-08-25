import { useCallback, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Bike, Check, Download, Smartphone } from "lucide-react";

import { useInstallPrompt } from "@/lib/install";
import { useLaunched } from "@/lib/launch";
import { LAUNCH_DATE_LABEL } from "@/lib/launch-config";
import { MIN_DELIVERY_FEE } from "@/lib/menu";
import { InstallHelpDialog } from "./InstallHelpDialog";
import { Reveal, SectionHeading } from "./Reveal";

/**
 * The app panel: install it, or open it in this browser.
 *
 * Sits directly above `OrderForm` rather than in place of it. The app is the
 * better experience and gets the headline, but ordering from the page itself
 * stays available for anyone who would rather not install anything, so the two
 * read as a choice instead of a detour.
 *
 * `#order` belongs to the form, which is what the navbar, the hero buttons,
 * the phone bar and the closing panel point at.
 */

const reasons = [
  "Every kitchen and bakery in Jonai, in one place",
  `Live order tracking, from the kitchen to your door`,
  `Delivery from ₹${MIN_DELIVERY_FEE}, with the total shown before you pay`,
];

export function OrderCta() {
  const launched = useLaunched();
  const { installed, ios, promptInstall } = useInstallPrompt();
  const [showHelp, setShowHelp] = useState(false);

  const install = useCallback(async () => {
    const outcome = await promptInstall();
    // Nothing to replay: iOS Safari never offers a prompt, and Chrome withholds
    // it on a repeat visit. Instructions beat a button that does nothing.
    if (outcome === "unavailable") setShowHelp(true);
  }, [promptInstall]);

  return (
    <section id="get-the-app" className="relative pt-24 lg:pt-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Order Now"
          title="Download the app now to order"
          subtitle="Food, cake and medicine from your favourite Jonai shops — a few taps, and it's on its way. Prefer not to install? The order form below works just as well."
        />

        <Reveal className="mt-14">
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative overflow-hidden rounded-[3rem] bg-primary p-8 shadow-xl md:p-12 lg:px-20"
          >
            <div className="absolute inset-0 bg-gradient-green opacity-50" />
            <div className="absolute right-0 top-0 size-64 -translate-y-1/2 translate-x-1/4 rounded-full bg-accent-light/10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center gap-10 text-center md:flex-row md:gap-14 md:text-left">
              <div className="flex size-28 shrink-0 items-center justify-center rounded-[2rem] bg-white/10 text-accent-light shadow-inner backdrop-blur-md md:size-32">
                <Smartphone className="size-14 md:size-16" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
                  {installed ? "You're all set" : "Download the app now to order"}
                </h3>
                <p className="mt-3 text-lg text-primary-foreground/90">
                  {installed
                    ? "Poba Express is installed on this device. Open it and your order is a few taps away."
                    : "Poba Express installs straight from this page — no app store, no wait."}
                </p>

                <ul className="mt-7 grid gap-3 text-left sm:grid-cols-3">
                  {reasons.map((reason) => (
                    <li
                      key={reason}
                      className="flex items-start gap-2.5 text-sm font-medium text-primary-foreground/85"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-light/20 text-accent-light">
                        <Check className="size-3" />
                      </span>
                      {reason}
                    </li>
                  ))}
                </ul>

                <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center md:justify-start">
                  {!installed && (
                    <button
                      type="button"
                      onClick={() => void install()}
                      className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-accent-light px-8 text-base font-semibold text-primary shadow-lift transition-transform duration-300 hover:scale-[1.03] active:scale-95"
                    >
                      <Download className="size-5" />
                      Download the app now
                    </button>
                  )}

                  <Link
                    to="/app"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/25 px-8 text-base font-semibold text-primary-foreground transition-colors duration-300 hover:bg-white/10"
                  >
                    {installed ? "Open the app" : "Browse the menu"}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>

                {!launched && (
                  <p className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-primary-foreground/70 md:justify-start">
                    <Bike className="size-4" />
                    Deliveries begin {LAUNCH_DATE_LABEL} — install now and be ready.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </Reveal>
      </div>

      <InstallHelpDialog open={showHelp} onOpenChange={setShowHelp} ios={ios} />
    </section>
  );
}
