import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

export function CallToAction() {
  return (
    <section id="get-started" className="relative overflow-hidden bg-gradient-green py-20 lg:py-28">
      <div className="absolute -left-24 -top-24 size-80 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-16 size-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-5 text-center lg:px-8">
        <Reveal>
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
            Ready to Get Anything Delivered?
          </h2>
          <p className="mt-4 text-base text-primary-foreground/80 sm:text-lg">
            Experience Jonai's fastest and most reliable delivery service today.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button variant="accent" size="xl" asChild>
              <a href="#order">Order Now</a>
            </Button>
            <Button variant="onGreen" size="xl" asChild>
              <a href="#partners">Partner With Us</a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
