import { Link } from "@tanstack/react-router";
import { ArrowRight, UtensilsCrossed } from "lucide-react";

import { useLaunched } from "@/lib/launch";
import { rupees } from "@/lib/menu";
import { CAKE_ITEMS, priceFrom, restaurantsIn } from "@/lib/restaurants";

/**
 * The banner rail at the top of the home screen.
 *
 * Every delivery app puts a promotion here. This one has no promotions, so it
 * carries the next best thing and the only honest one: a real dish, at the
 * real price, one tap from its menu. No invented discount, no code, no
 * "up to ₹120 off" — a customer who taps through to find no such offer has
 * been lied to by their own delivery app.
 */

type Spotlight = {
  key: string;
  headline: string;
  detail: string;
  from: number;
  image?: string;
  note?: string;
} & ({ kind: "shop"; slug: string } | { kind: "cake" });

/**
 * Copy per shop rather than a template, so a headline is never stretched over
 * something it does not describe. A shop that leaves the menu takes its banner
 * with it, because the list is built from what is actually there.
 *
 * The detail line spans the menu rather than naming one dish, because the
 * price under it is the shop's cheapest item. "Chicken biryani — from ₹49"
 * would be a lie about the biryani, which starts at ₹59; the ₹49 is a maggi.
 */
const COPY: Record<string, { headline: string; detail: string }> = {
  "biryani-bite": {
    headline: "Flavour that hits the spot",
    detail: "Biryani, maggi and pasta",
  },
  "dispy-bakery": {
    headline: "Homemade pizza, out of the oven",
    detail: "Veg, sweetcorn, paneer and chicken",
  },
  prarthona: {
    headline: "Momo, chow and everything after",
    detail: "Fried rice, rolls, chilli chicken and fries",
  },
};

function spotlights(): Spotlight[] {
  const shops = restaurantsIn("food");

  const banners: Spotlight[] = shops
    .filter((shop) => COPY[shop.slug])
    .map((shop) => ({
      kind: "shop" as const,
      key: shop.slug,
      slug: shop.slug,
      headline: COPY[shop.slug].headline,
      detail: COPY[shop.slug].detail,
      from: priceFrom(shop),
      image: shop.image,
      note: shop.hours,
    }));

  banners.push({
    kind: "cake",
    key: "cake",
    headline: "Baked to order, not off a shelf",
    detail: "Cheesecakes, loaves and the classics",
    from: CAKE_ITEMS.reduce((low, item) => Math.min(low, item.price), Infinity),
    image: CAKE_ITEMS.find((item) => item.image)?.image,
  });

  return banners;
}

function Banner({ banner }: { banner: Spotlight }) {
  const launched = useLaunched();

  const inner = (
    <>
      <div className="relative z-10 min-w-0 flex-1">
        <h3 className="text-lg font-extrabold leading-tight text-primary-foreground">
          {banner.headline}
        </h3>
        <p className="mt-1 text-xs text-primary-foreground/75">{banner.detail}</p>
        <p className="mt-2 text-sm font-bold text-accent-light">from {rupees(banner.from)}</p>
        {banner.note && (
          <p className="mt-1 text-[11px] font-semibold text-primary-foreground/70">{banner.note}</p>
        )}
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-light px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-primary">
          {launched ? "Order now" : "See the menu"}
          <ArrowRight className="size-3" />
        </span>
      </div>

      <div className="relative z-10 size-24 shrink-0 self-center overflow-hidden rounded-2xl bg-white/10 sm:size-28">
        {banner.image ? (
          <img src={banner.image} alt="" aria-hidden className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-primary-foreground/60">
            <UtensilsCrossed className="size-8" />
          </span>
        )}
      </div>
    </>
  );

  const className =
    "relative flex w-[85%] shrink-0 snap-start gap-3 overflow-hidden rounded-3xl bg-gradient-green p-4 shadow-soft sm:w-[60%]";

  return banner.kind === "cake" ? (
    <Link to="/app/cake" className={className}>
      {inner}
    </Link>
  ) : (
    <Link to="/app/r/$slug" params={{ slug: banner.slug }} className={className}>
      {inner}
    </Link>
  );
}

export function Spotlights() {
  const banners = spotlights();
  if (banners.length === 0) return null;

  return (
    // Swipeable rather than auto-rotating: this sits at the top of a screen
    // people are already scrolling, and a banner that changes under a thumb
    // mid-reach is the one that gets tapped by mistake.
    <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {banners.map((banner) => (
        <Banner key={banner.key} banner={banner} />
      ))}
    </div>
  );
}
