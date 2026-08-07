import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Clock, Sparkles, Store, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { itemLabel, rupees, type MenuItem } from "@/lib/menu";
import { CAKE_ITEMS, CAKE_SOURCE, priceFrom, restaurantsIn } from "@/lib/restaurants";

/**
 * One shop, flattened out of whichever list it came from.
 *
 * The cake bakery has a menu screen but no restaurant card, so the two sources
 * are levelled here rather than special-cased inside the slide.
 */
export type Partner = {
  slug: string;
  name: string;
  cuisine: string;
  image?: string;
  eta: [number, number];
  hours?: string;
  from: number;
  items: MenuItem[];
  /** Cake has its own screen; every kitchen is under /app/r. */
  isCake?: boolean;
};

/**
 * Every partner, in menu order.
 *
 * Derived rather than hand-listed, so adding a kitchen to `RESTAURANTS` gives
 * it a hero slide with no edit here — which is the point of the slideshow.
 */
export function partners(): Partner[] {
  const shops: Partner[] = restaurantsIn("food").map((r) => ({
    slug: r.slug,
    name: r.name,
    cuisine: r.cuisine,
    image: r.image,
    eta: r.eta,
    hours: r.hours,
    from: priceFrom(r),
    items: r.items,
  }));

  shops.push({
    slug: "cake",
    name: CAKE_SOURCE,
    cuisine: "Cakes · Cheesecakes · Loaves",
    image: CAKE_ITEMS.find((item) => item.image)?.image,
    eta: [15, 25],
    from: CAKE_ITEMS.reduce((low, item) => Math.min(low, item.price), Infinity),
    items: CAKE_ITEMS,
    isCake: true,
  });

  return shops;
}

/** "See the menu", pointed at whichever screen this partner lives on. */
function MenuLink({ partner, children }: { partner: Partner; children: React.ReactNode }) {
  const className =
    "inline-flex h-12 items-center gap-2 rounded-full bg-gradient-accent px-7 text-base font-semibold text-accent-foreground shadow-lift transition-transform duration-300 hover:scale-[1.03]";

  return partner.isCake ? (
    <Link to="/app/cake" className={className}>
      {children}
    </Link>
  ) : (
    <Link to="/app/r/$slug" params={{ slug: partner.slug }} className={className}>
      {children}
    </Link>
  );
}

/**
 * The right-hand panel: the shop's photo, or its price list when there is no
 * photo yet.
 *
 * The prices are the honest fallback. Borrowing another shop's food picture
 * would show a customer something this kitchen does not sell, and an empty
 * frame would read as a broken image.
 */
function PartnerPanel({ partner }: { partner: Partner }) {
  if (partner.image) {
    return (
      <div className="rounded-[2rem] border border-border/70 bg-card p-2 shadow-lift sm:p-3">
        <img
          src={partner.image}
          alt={`Food from ${partner.name}`}
          className="aspect-[4/3] w-full rounded-[1.4rem] object-cover"
        />
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-lift sm:p-7">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        <Store className="size-4 text-accent" />
        On the menu
      </p>
      <ul className="mt-5 divide-y divide-border">
        {partner.items.slice(0, 5).map((item) => (
          <li key={item.id} className="flex items-baseline justify-between gap-4 py-2.5">
            <span className="min-w-0 truncate text-sm font-medium text-primary">
              {itemLabel(item)}
            </span>
            <span className="shrink-0 text-sm font-bold text-accent">{rupees(item.price)}</span>
          </li>
        ))}
      </ul>
      {partner.items.length > 5 && (
        <p className="mt-4 text-xs font-medium text-muted-foreground">
          + {partner.items.length - 5} more on the menu
        </p>
      )}
    </div>
  );
}

/**
 * A whole hero's worth of one shop.
 *
 * Deliberately the same two-column shape as the brand slide, so the slideshow
 * reads as one section changing its mind rather than a stack of unrelated
 * banners.
 */
export function PartnerSlide({ partner }: { partner: Partner }) {
  return (
    <div className="grid h-full items-center gap-12 lg:grid-cols-2 lg:gap-10">
      <div className="z-10 max-w-xl">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-accent">
          <Sparkles className="size-3.5" />
          Now on Poba Express
        </span>

        <h2 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-primary sm:text-5xl lg:text-6xl">
          {partner.name}
        </h2>

        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {partner.cuisine}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-primary">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 shadow-sm">
            <Clock className="size-3.5 text-muted-foreground" />
            {partner.eta[0]}–{partner.eta[1]} min
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 shadow-sm">
            <UtensilsCrossed className="size-3.5 text-muted-foreground" />
            from {rupees(partner.from)}
          </span>
          {/* Only the partners that keep short hours carry this. */}
          {partner.hours && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-accent-foreground shadow-sm">
              {partner.hours}
            </span>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <MenuLink partner={partner}>
            See the menu
            <ArrowRight className="size-4" />
          </MenuLink>
          <Button
            variant="outline"
            size="xl"
            className="border-border bg-card font-semibold text-foreground shadow-sm hover:bg-card/90 hover:text-foreground"
            asChild
          >
            <Link to="/app/food">All shops</Link>
          </Button>
        </div>
      </div>

      <motion.figure
        initial={{ opacity: 0, y: 32, rotate: -1.6 }}
        animate={{ opacity: 1, y: 0, rotate: -1.6 }}
        transition={{ duration: 0.9, delay: 0.2, type: "spring", stiffness: 50 }}
        className="relative mx-auto w-full max-w-[440px] sm:max-w-[500px] lg:max-w-[560px]"
      >
        <PartnerPanel partner={partner} />
      </motion.figure>
    </div>
  );
}
