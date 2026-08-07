import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useReducedMotion } from "motion/react";

import { RestaurantThumb } from "@/components/app/Shared";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { rupees } from "@/lib/menu";
import { CAKE_ITEMS, CAKE_SOURCE, priceFrom, restaurantsIn } from "@/lib/restaurants";
import { cn } from "@/lib/utils";

/** How long each partner holds the frame before the rail advances. */
const AUTOPLAY_MS = 3800;

type Slide = {
  key: string;
  name: string;
  cuisine: string;
  image?: string;
  eta: [number, number];
  hours?: string;
  from: number;
};

/**
 * Every partner, food and cake, in the order a customer meets them.
 *
 * Derived rather than listed: adding a kitchen to `RESTAURANTS` puts it in the
 * rail with no edit here, which is the whole point of the rail.
 */
function buildSlides(): { slides: Slide[]; cakeIndex: number } {
  const restaurants = restaurantsIn("food");
  const slides: Slide[] = restaurants.map((r) => ({
    key: r.slug,
    name: r.name,
    cuisine: r.cuisine,
    image: r.image,
    eta: r.eta,
    hours: r.hours,
    from: priceFrom(r),
  }));

  // The bakery has a screen but no restaurant card, so it is appended by hand.
  // Its thumbnail is whichever cake has a photo, so it follows the menu.
  slides.push({
    key: "cake",
    name: CAKE_SOURCE,
    cuisine: "Cakes · Cheesecakes · Loaves",
    image: CAKE_ITEMS.find((item) => item.image)?.image,
    eta: [15, 25],
    from: CAKE_ITEMS.reduce((low, item) => Math.min(low, item.price), Infinity),
  });

  return { slides, cakeIndex: slides.length - 1 };
}

function PartnerCard({ slide }: { slide: Slide }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card/80 p-3 shadow-soft backdrop-blur-xl transition-colors duration-300 group-hover:border-accent">
      <div className="flex items-center gap-3">
        <RestaurantThumb image={slide.image} className="size-14" />
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-primary">{slide.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{slide.cuisine}</p>
        </div>
      </div>
      <p className="mt-3 text-xs font-medium text-muted-foreground">
        {slide.eta[0]}–{slide.eta[1]} min · from {rupees(slide.from)}
      </p>
      {/* Only the partners that keep short hours carry this line. */}
      {slide.hours && <p className="mt-0.5 text-xs font-semibold text-accent">{slide.hours}</p>}
    </article>
  );
}

/**
 * The partner rail under the hero copy.
 *
 * It advances on its own so a visitor who never scrolls still sees more than
 * the first shop, but the timer is off under `prefers-reduced-motion` and
 * pauses whenever a pointer or the keyboard is inside the rail — an auto-
 * advancing carousel that moves while you are reading a card is the thing
 * people hate about carousels.
 */
export function PartnerSlider() {
  const { slides, cakeIndex } = buildSlides();
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!api) return;

    const sync = () => {
      setSelected(api.selectedScrollSnap());
      setSnapCount(api.scrollSnapList().length);
    };

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
    <div
      className="mt-16"
      onMouseEnter={hold}
      onMouseLeave={release}
      onFocus={hold}
      onBlur={release}
    >
      <Carousel
        opts={{ loop: true, align: "start" }}
        setApi={setApi}
        aria-label="Shops delivering with Poba Express"
      >
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Now delivering from
            </h2>
            {/* Just the count. The delivery fee differs by category, so a
                headline promising "one flat fee" across all five would not be
                true of a cake order. */}
            <p className="mt-1 text-lg font-bold text-primary">
              {slides.length} shops on Poba Express
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <CarouselPrevious className="static size-9 translate-y-0 border-border bg-card shadow-sm" />
            <CarouselNext className="static size-9 translate-y-0 border-border bg-card shadow-sm" />
          </div>
        </div>

        <CarouselContent className="-ml-3">
          {slides.map((slide, index) => (
            <CarouselItem
              key={slide.key}
              className="basis-[82%] pl-3 sm:basis-1/2 lg:basis-1/3 2xl:basis-1/4"
            >
              {/* The bakery lives on its own screen; every kitchen has a card. */}
              {index === cakeIndex ? (
                <Link to="/app/cake" className="group block h-full">
                  <PartnerCard slide={slide} />
                </Link>
              ) : (
                <Link to="/app/r/$slug" params={{ slug: slide.key }} className="group block h-full">
                  <PartnerCard slide={slide} />
                </Link>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Dots double as the progress read-out; the buttons above do the work,
            so these stay decorative rather than a second set of controls. */}
        <div aria-hidden className="mt-4 flex justify-center gap-1.5">
          {Array.from({ length: snapCount }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === selected ? "w-5 bg-accent" : "w-1.5 bg-primary/25",
              )}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
