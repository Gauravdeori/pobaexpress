import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, Zap, ShieldCheck, Handshake, ArrowRight, Download } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { InstallButton } from "./InstallButton";
import { partners, PartnerSlide } from "./HeroSlides";
import { useLaunched } from "@/lib/launch";
import { cn } from "@/lib/utils";

/** Three promises, each with a supporting line, as a row under the buttons. */
const promises = [
  { icon: Zap, title: "Fast Delivery", detail: "On-time, every time" },
  { icon: ShieldCheck, title: "Affordable", detail: "Best prices in Jonai" },
  { icon: Handshake, title: "Reliable Service", detail: "You can count on us" },
];

/** Long enough to read a headline and a price without feeling hurried. */
const AUTOPLAY_MS = 7000;

/** The opening slide: who Poba Express is, and where it delivers. */
function BrandSlide() {
  const launched = useLaunched();

  return (
    <div className="grid h-full items-center gap-12 lg:grid-cols-2 lg:gap-10">
      {/* Left Column: Text and Actions */}
      <div className="z-10 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground"
        >
          Poba Express
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16 }}
          className="text-5xl font-extrabold leading-[1.1] tracking-tight text-primary sm:text-6xl lg:text-7xl"
        >
          Jonai&apos;s Own
          <br />
          Delivery Service
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24 }}
          className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          Fast, affordable and reliable delivery of food, cake and medicine — from your favourite
          local shops right to your doorstep.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          {/* Ordering does not open until launch day, so the label has to
              agree with the header, the sticky bar and the form itself —
              all of which offer the menu until then. */}
          <Button variant="hero" size="xl" className="font-semibold" asChild>
            <a href="#order">
              {launched ? "Order Now" : "See the Menu"}
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <InstallButton
            className={buttonVariants({
              variant: "outline",
              size: "xl",
              className:
                "border-border bg-card font-semibold text-foreground shadow-sm hover:bg-card/90 hover:text-foreground",
            })}
          >
            Download the app now
            <Download className="size-4 text-muted-foreground" />
          </InstallButton>
          <Button
            variant="outline"
            size="xl"
            className="border-border bg-card font-semibold text-foreground shadow-sm hover:bg-card/90 hover:text-foreground"
            asChild
          >
            <a href="#partners">
              Become a Partner
              <Handshake className="size-4 text-muted-foreground" />
            </a>
          </Button>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42 }}
          className="mt-16 flex flex-wrap gap-x-8 gap-y-6"
        >
          {promises.map((p) => (
            <li key={p.title} className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card text-primary shadow-sm">
                <p.icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-bold text-primary">{p.title}</span>
                <span className="block text-xs font-medium text-muted-foreground">{p.detail}</span>
              </span>
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Right column: the coverage map.

          Framed as a card rather than floated as a cut-out. The artwork is
          a self-contained graphic with its own background, so it has no
          silhouette to blend and nothing to stand on — a mount and a shadow
          make it read as an object deliberately placed on the page, which
          is also why the aerial photo behind it no longer fights it. */}
      <motion.figure
        initial={{ opacity: 0, y: 32, rotate: -1.6 }}
        animate={{ opacity: 1, y: 0, rotate: -1.6 }}
        transition={{ duration: 0.9, delay: 0.2, type: "spring", stiffness: 50 }}
        className="relative mx-auto w-full max-w-[440px] sm:max-w-[500px] lg:max-w-[560px]"
      >
        <div className="rounded-[2rem] border border-border/70 bg-card p-2 shadow-lift sm:p-3">
          {/* Not decorative: this is the only place the delivery boundary is
              stated, and the landmarks are baked into the image where a
              screen reader cannot reach them. */}
          <img
            src="/coverage-map.jpg"
            alt="Poba Express delivery area for Jonai town — north to Ruskin Gate, south to Jonai P.H.C, east to the Torajan side and west to Rotkey playground."
            className="w-full rounded-[1.4rem]"
          />
        </div>
      </motion.figure>
    </div>
  );
}

/**
 * The hero, as a slideshow: the pitch first, then every shop in turn.
 *
 * The background photograph and the scrim sit outside the rail on purpose —
 * only the copy and the panel change, so the section reads as one place
 * updating itself rather than a stack of separate banners.
 *
 * It advances on its own so a visitor who never touches it still meets the
 * partners, but the timer stops under `prefers-reduced-motion` and whenever a
 * pointer or the keyboard is inside the section. A hero that slides away
 * mid-sentence is the reason carousels have the reputation they do.
 */
export function Hero() {
  // Looping motion is the kind that triggers motion sickness, so honour the
  // system setting rather than animating regardless.
  const reduceMotion = useReducedMotion();
  const shops = partners();
  const labels = ["Poba Express", ...shops.map((p) => p.name)];

  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!api) return;
    const sync = () => setSelected(api.selectedScrollSnap());
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  useEffect(() => {
    if (!api || paused || reduceMotion) return;
    const timer = window.setInterval(() => api.scrollNext(), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [api, paused, reduceMotion]);

  const hold = useCallback(() => setPaused(true), []);
  const release = useCallback(() => setPaused(false), []);

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-background"
      onMouseEnter={hold}
      onMouseLeave={release}
      onFocus={hold}
      onBlur={release}
    >
      {/* Photograph of Jonai behind the whole section. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <img src="/hero-bg.jpg" alt="" className="h-full w-full object-cover object-center" />
        {/* Legibility comes from one scrim shaped around the copy, not from a
            flat wash over the whole frame — a wash dulls the parts of the photo
            nothing is sitting on, which is most of it. Body copy in
            muted-foreground needs the cream at close to full strength to clear
            4.5:1, so the scrim holds solid across the copy column and only then
            falls away: down the page on phones, across from the rider on
            desktop. */}
        <div className="absolute inset-0 bg-gradient-to-b from-background from-30% via-background/70 via-62% to-transparent to-88% lg:bg-gradient-to-r lg:from-28% lg:via-background/55 lg:via-52% lg:to-78%" />
      </div>

      <Carousel
        opts={{ loop: true }}
        setApi={setApi}
        aria-label="Poba Express and the shops delivering with it"
        className="relative"
      >
        {/* `items-stretch` is what keeps the section from jumping height as it
            turns: every slide is as tall as the tallest one. */}
        <CarouselContent className="ml-0 items-stretch">
          {[
            <BrandSlide key="brand" />,
            ...shops.map((p) => <PartnerSlide key={p.slug} partner={p} />),
          ].map((slide, index) => (
            <CarouselItem
              key={labels[index]}
              className="pl-0"
              aria-label={`${index + 1} of ${labels.length}: ${labels[index]}`}
            >
              <div className="mx-auto h-full max-w-[120rem] px-6 pb-20 pt-32 lg:px-12 lg:pb-32 lg:pt-40 2xl:px-20">
                {slide}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-4 hidden size-11 border-border bg-card/90 shadow-lift backdrop-blur lg:flex" />
        <CarouselNext className="right-4 hidden size-11 border-border bg-card/90 shadow-lift backdrop-blur lg:flex" />
      </Carousel>

      {/* Named dots rather than anonymous ones: on a hero that changes shop,
          "Dcakery" is the only thing that tells you where you are going. */}
      <div className="relative z-10 mx-auto flex max-w-full flex-wrap justify-center gap-2 px-6">
        {labels.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => api?.scrollTo(index)}
            aria-current={index === selected}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-300",
              index === selected
                ? "bg-accent text-accent-foreground shadow-sm"
                : "bg-card/80 text-muted-foreground hover:text-primary",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <motion.a
        href="#services"
        aria-label="Scroll down"
        animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative z-10 mx-auto mb-8 mt-6 hidden w-max flex-col items-center gap-1 text-primary sm:flex"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">Scroll</span>
        <ChevronDown className="size-5" />
      </motion.a>
    </section>
  );
}
