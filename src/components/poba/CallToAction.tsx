import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLaunched } from "@/lib/launch";

export function CallToAction() {
  const launched = useLaunched();

  return (
    <section id="get-started" className="relative px-5 pb-24 lg:px-8 lg:pb-32">
      <div className="mx-auto max-w-[80rem]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: "some" }}
          transition={{ duration: 0.7, type: "spring", stiffness: 50 }}
          className="relative flex flex-col items-center justify-between overflow-hidden rounded-[3rem] bg-primary p-8 shadow-xl md:flex-row md:p-12 lg:px-20"
        >
          {/* Subtle background decoration */}
          <div className="absolute inset-0 bg-gradient-green opacity-50" />
          <div className="absolute right-0 top-0 size-64 -translate-y-1/2 translate-x-1/4 rounded-full bg-accent-light/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col items-center gap-8 text-center md:flex-row md:gap-12 md:text-left">
            {/* The card clips to its rounded corners so the blur above stays
                inside it, which means the artwork has to stay inside too. */}
            <div className="flex size-40 shrink-0 items-center justify-center md:size-48">
              <img
                aria-hidden
                src="/cta-bag.png"
                alt=""
                loading="lazy"
                className="size-full object-contain drop-shadow-2xl"
              />
            </div>

            <div className="flex-1">
              <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
                Craving something delicious?
              </h2>
              <p className="mt-3 text-lg text-primary-foreground/90">
                Food, cake and medicine from your favourite Jonai shops.
              </p>
            </div>

            <div className="shrink-0">
              <Button variant="onGreen" size="xl" className="font-semibold" asChild>
                <a href="#order">
                  {launched ? "Order Now" : "See the Menu"}
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
