import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

export function CallToAction() {
  return (
    <section id="get-started" className="relative overflow-hidden bg-gradient-green py-20 lg:py-28">
      <div className="absolute -left-24 -top-24 size-80 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-16 size-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <Reveal className="text-center lg:text-left">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
            Ready to Get Anything Delivered?
          </h2>
          <p className="mt-4 text-base text-primary-foreground/80 sm:text-lg">
            Experience Jonai&apos;s fastest and most reliable delivery service today.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Button variant="onGreen" size="xl" asChild>
              <a href="#order">Order Now</a>
            </Button>
            <Button variant="ghostOnGreen" size="xl" asChild>
              <a href="#partners">Partner With Us</a>
            </Button>
          </div>
        </Reveal>

        {/* On a white card, not straight onto the green: the artwork carries a
            baked-in white ground shadow and a pocket of white under the seat,
            and neither can be cut away without also removing the rider's white
            shoes. On white they read as intended. */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: "some" }}
          transition={{ type: "spring", stiffness: 80, damping: 16 }}
          className="mx-auto w-full max-w-sm rounded-4xl bg-card p-5 shadow-lift lg:max-w-md"
        >
          {/* Decorative: the heading already carries the message. */}
          <img aria-hidden src="/rider.png" alt="" loading="lazy" className="w-full" />
        </motion.div>
      </div>
    </section>
  );
}
