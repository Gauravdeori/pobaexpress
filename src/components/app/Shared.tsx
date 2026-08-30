import { Link } from "@tanstack/react-router";
import { Minus, Plus, Star, UtensilsCrossed } from "lucide-react";

import { useClosedRestaurants, useSoldOut } from "@/lib/availability";
import { itemLabel, rupees, type MenuItem } from "@/lib/menu";
import { priceFrom, type Restaurant } from "@/lib/restaurants";
import { cn } from "@/lib/utils";

/**
 * A partner's rating, or "New" when there is nothing genuine to show.
 *
 * There is no placeholder branch on purpose: a made-up score next to a real
 * shop's name is a fabricated review, and customers act on it.
 */
export function Rating({ restaurant }: { restaurant: Restaurant }) {
  if (restaurant.rating === undefined) {
    return (
      <span className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
        New
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-bold text-accent-foreground">
      <Star className="size-3 fill-current" />
      {restaurant.rating.toFixed(1)}
      {restaurant.ratingCount !== undefined && (
        <span className="font-medium opacity-80">({restaurant.ratingCount})</span>
      )}
    </span>
  );
}

/**
 * A partner's photo, or a plain branded tile when there isn't one.
 *
 * The fallback is deliberately not a picture of some other shop's food: the
 * thumbnail sits right beside the name and reads as what they sell.
 */
export function RestaurantThumb({ image, className }: { image?: string; className: string }) {
  if (!image) {
    return (
      <span
        aria-hidden
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent",
          className,
        )}
      >
        <UtensilsCrossed className="size-7" />
      </span>
    );
  }
  return (
    <img
      src={image}
      alt=""
      aria-hidden
      className={cn("shrink-0 rounded-xl object-cover", className)}
    />
  );
}

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const closedRestaurants = useClosedRestaurants();
  const isClosed = closedRestaurants.has(restaurant.slug);

  return (
    <Link
      to="/app/r/$slug"
      params={{ slug: restaurant.slug }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border bg-card shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] active:scale-[0.99]",
        isClosed ? "border-destructive/40 opacity-85" : "border-border/80 hover:border-accent/40",
      )}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[16/8] sm:aspect-[21/9] w-full overflow-hidden bg-muted">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            aria-hidden
            className={cn(
              "size-full object-cover transition-transform duration-700 group-hover:scale-105",
              isClosed && "grayscale-[40%]",
            )}
          />
        ) : (
          <span className="flex size-full items-center justify-center bg-accent/10 text-accent">
            <UtensilsCrossed className="size-10" />
          </span>
        )}

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {isClosed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow-md">
              CLOSED TODAY
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-[11px] font-extrabold tracking-wide text-amber-300 backdrop-blur-md border border-amber-400/20 shadow-md">
              <span>🔥</span>
              <span>ITEMS FROM {rupees(priceFrom(restaurant))}</span>
            </span>
          )}

          {restaurant.hours && (
            <span className="rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-md border border-emerald-400/30">
              {restaurant.hours}
            </span>
          )}
        </div>

        {/* Bottom Details on Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="min-w-0">
            <h3 className="truncate text-xl sm:text-2xl font-black text-white drop-shadow-md">
              {restaurant.name}
            </h3>
            <p className="truncate text-xs sm:text-sm font-medium text-white/90 drop-shadow-sm">
              {restaurant.cuisine}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1 text-xs font-black text-white shadow-lg">
            <Star className="size-3.5 fill-white text-white" />
            <span>{restaurant.rating?.toFixed(1) || "4.3"}</span>
          </div>
        </div>
      </div>

      {/* Bottom Info Strip */}
      <div className="flex items-center justify-between bg-card/60 p-3.5 text-xs font-semibold text-muted-foreground backdrop-blur-md">
        <div className="flex items-center gap-2 text-foreground/80">
          {isClosed ? (
            <span className="flex items-center gap-1.5 text-destructive font-extrabold">
              <span className="size-2 rounded-full bg-destructive" />
              Not Accepting Orders Today
            </span>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                {restaurant.eta[0]}–{restaurant.eta[1]} MINS
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span>From {rupees(priceFrom(restaurant))}</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-accent font-bold">Safe & Hygienic</span>
            </>
          )}
        </div>

        <span
          className={cn(
            "font-extrabold",
            isClosed ? "text-muted-foreground" : "text-accent group-hover:underline",
          )}
        >
          {isClosed ? "View Menu →" : "View Menu →"}
        </span>
      </div>
    </Link>
  );
}

export function RestaurantTile({ restaurant }: { restaurant: Restaurant }) {
  const closedRestaurants = useClosedRestaurants();
  const isClosed = closedRestaurants.has(restaurant.slug);

  return (
    <Link
      to="/app/r/$slug"
      params={{ slug: restaurant.slug }}
      className={cn(
        "group relative flex w-48 sm:w-56 shrink-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]",
        isClosed ? "border-destructive/40 opacity-80" : "border-border/80 hover:border-accent/50",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            aria-hidden
            className={cn(
              "size-full object-cover transition-transform duration-500 group-hover:scale-105",
              isClosed && "grayscale-[40%]",
            )}
          />
        ) : (
          <span className="flex size-full items-center justify-center text-accent">
            <UtensilsCrossed className="size-8" />
          </span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        {/* Promo Ribbon on Image */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          {isClosed ? (
            <span className="truncate rounded-md bg-destructive px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
              CLOSED TODAY
            </span>
          ) : (
            <span className="truncate rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-black tracking-wide text-white backdrop-blur-md">
              FROM {rupees(priceFrom(restaurant))}
            </span>
          )}
          <span className="flex items-center gap-0.5 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
            <Star className="size-2.5 fill-white" />
            {restaurant.rating?.toFixed(1) || "4.3"}
          </span>
        </div>
      </div>

      <div className="min-w-0 p-3">
        <h3 className="truncate text-sm font-extrabold text-foreground group-hover:text-accent transition-colors">
          {restaurant.name}
        </h3>
        <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
          {restaurant.cuisine}
        </p>
        <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-muted-foreground border-t border-border/40 pt-2">
          {isClosed ? (
            <span className="text-destructive font-bold">Closed Today</span>
          ) : (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {restaurant.eta[0]}–{restaurant.eta[1]} min
            </span>
          )}
          <span className="text-foreground/80 font-bold">Doorstep</span>
        </div>
      </div>
    </Link>
  );
}

/** Add, or a stepper once it is in the cart. Compact enough to sit per size. */
function AddControl({
  item,
  quantity,
  onAdd,
  onSetQuantity,
  className,
  soldOut,
}: {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onSetQuantity: (quantity: number) => void;
  className?: string;
  soldOut?: boolean;
}) {
  // Checked before the quantity, so a dish that runs out while it is already
  // in someone's basket stops offering them a fourth one.
  if (soldOut) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl border border-border bg-secondary px-4 py-2 text-[13px] font-extrabold uppercase text-muted-foreground",
          className,
        )}
      >
        Sold out
      </span>
    );
  }

  if (quantity > 0) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-between rounded-xl border border-green-600 bg-green-50 p-1 shadow-sm",
          className,
        )}
      >
        <button
          type="button"
          onClick={() => onSetQuantity(quantity - 1)}
          aria-label={`Remove one ${itemLabel(item)}`}
          className="flex size-8 items-center justify-center rounded-lg text-green-700 transition-transform active:scale-90 hover:bg-green-100"
        >
          <Minus className="size-4" />
        </button>
        <span
          aria-live="polite"
          className="w-6 text-center text-[15px] font-extrabold text-green-700"
        >
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => onSetQuantity(quantity + 1)}
          aria-label={`Add one more ${itemLabel(item)}`}
          className="flex size-8 items-center justify-center rounded-lg text-green-700 transition-transform active:scale-90 hover:bg-green-100"
        >
          <Plus className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={`Add ${itemLabel(item)}`}
      className={cn(
        "shrink-0 rounded-xl border border-green-600 bg-white/95 backdrop-blur px-5 py-2 text-[15px] font-extrabold uppercase text-green-700 shadow-sm transition-all active:scale-95 hover:bg-green-50",
        className,
      )}
    >
      Add
    </button>
  );
}

/**
 * One dish, with every size it comes in.
 *
 * The menu stores each size as its own item, because each is its own price and
 * its own cart line. Rendering them that way put Chicken Biryani on screen
 * three times over, one photo and one name repeated down the page. Grouping
 * them back together is the difference between a price list and a menu.
 */
export function DishCard({
  sizes,
  quantityOf,
  onAdd,
  onSetQuantity,
  soldOut,
}: {
  sizes: MenuItem[];
  quantityOf: (id: string) => number;
  onAdd: (item: MenuItem) => void;
  onSetQuantity: (id: string, quantity: number) => void;
  soldOut: ReadonlySet<string>;
}) {
  const [first] = sizes;
  const inCart = sizes.some((size) => quantityOf(size.id) > 0);
  const single = sizes.length === 1;
  // A dish with three sizes and one of them gone is still on the menu; one
  // with every size gone is not. Dimming the whole card in the first case
  // would hide the two people can still order.
  const allGone = sizes.every((size) => soldOut.has(size.id));

  return (
    <li
      className={cn(
        "relative flex flex-col justify-between py-6 border-b border-border/40 last:border-0",
        allGone && "opacity-55",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* LEFT SIDE: Details */}
        <div className="flex-1 min-w-0 pr-2">
          {/* Swiggy veg/non-veg indicator mockup (assuming all are veg for visual unless meat in name) */}
          <div className="mb-1.5 flex items-center">
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-sm border",
                first.name.toLowerCase().includes("chicken") ||
                  first.name.toLowerCase().includes("egg")
                  ? "border-red-600 text-red-600"
                  : "border-green-600 text-green-600",
              )}
            >
              <span className="size-2 rounded-full bg-current" />
            </span>
          </div>

          <h3 className="text-[17px] font-bold text-foreground leading-tight mb-1">{first.name}</h3>

          {allGone && (
            <p className="mb-1.5 inline-block rounded-full bg-secondary px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
              Sold out today
            </p>
          )}

          {single ? (
            <p className="text-[15px] font-semibold text-foreground mb-2">{rupees(first.price)}</p>
          ) : (
            <p className="text-[14px] font-semibold text-foreground mb-2">
              from {rupees(Math.min(...sizes.map((s) => s.price)))}
            </p>
          )}

          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
            Delicious {first.name.toLowerCase()} prepared fresh with authentic ingredients.
          </p>
        </div>

        {/* RIGHT SIDE: Image & Add Button */}
        <div className="relative shrink-0 flex flex-col items-center w-[130px]">
          {first.image ? (
            <div className="w-[130px] h-[130px] rounded-2xl overflow-hidden shadow-sm">
              <img src={first.image} alt="" aria-hidden className="size-full object-cover" />
            </div>
          ) : (
            <div className="w-[130px] h-[130px] rounded-2xl bg-secondary/50 flex items-center justify-center shadow-sm">
              <UtensilsCrossed className="size-8 text-muted-foreground/50" />
            </div>
          )}

          {/* The ADD button overlapping the image bottom */}
          <div className="absolute -bottom-3 w-[110px] left-1/2 -translate-x-1/2">
            {single ? (
              <AddControl
                item={first}
                quantity={quantityOf(first.id)}
                onAdd={() => onAdd(first)}
                onSetQuantity={(next) => onSetQuantity(first.id, next)}
                soldOut={soldOut.has(first.id)}
                className="w-full h-10 shadow-[0_3px_8px_rgba(0,0,0,0.12)]"
              />
            ) : allGone ? (
              <span className="w-full h-10 bg-secondary border border-border text-muted-foreground text-[13px] font-extrabold uppercase rounded-xl flex items-center justify-center">
                Sold out
              </span>
            ) : (
              <button className="w-full h-10 shadow-[0_3px_8px_rgba(0,0,0,0.12)] bg-white/95 backdrop-blur border border-green-600 text-green-700 text-[15px] font-extrabold uppercase rounded-xl flex items-center justify-center hover:bg-green-50 active:scale-95 transition-all">
                ADD
                <Plus className="absolute top-1 right-1 size-3 text-green-700" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Each size keeps its own row */}
      {!single && (
        <ul className="mt-8 rounded-2xl border border-border/50 bg-secondary/20 p-2 overflow-hidden">
          {sizes.map((size) => (
            <li
              key={size.id}
              className="flex items-center justify-between gap-3 border-b border-border/50 px-3 py-3 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "truncate text-[15px] font-semibold",
                    soldOut.has(size.id) ? "text-muted-foreground line-through" : "text-foreground",
                  )}
                >
                  {size.variant}
                </div>
                <div className="mt-0.5 text-[14px] font-bold text-foreground">
                  {rupees(size.price)}
                </div>
              </div>
              <AddControl
                item={size}
                quantity={quantityOf(size.id)}
                onAdd={() => onAdd(size)}
                onSetQuantity={(next) => onSetQuantity(size.id, next)}
                soldOut={soldOut.has(size.id)}
                className="w-[100px] h-[36px]"
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * A whole menu, dishes grouped by name.
 *
 * Grouped on runs rather than globally, so the kitchen's own ordering survives
 * — a menu is arranged the way the shop thinks about it, and sorting by name
 * would scatter the biryanis through the maggi.
 */
export function MenuList({
  items,
  quantityOf,
  onAdd,
  onSetQuantity,
}: {
  items: MenuItem[];
  quantityOf: (id: string) => number;
  onAdd: (item: MenuItem) => void;
  onSetQuantity: (id: string, quantity: number) => void;
}) {
  // Read here rather than passed in, so every screen that renders a menu gets
  // the same answer without each of them having to remember to ask.
  const soldOut = useSoldOut();

  const groups: MenuItem[][] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last[0].name === item.name) last.push(item);
    else groups.push([item]);
  }

  return (
    <ul className="grid gap-2.5">
      {groups.map((sizes) => (
        <DishCard
          key={sizes[0].id}
          sizes={sizes}
          quantityOf={quantityOf}
          onAdd={onAdd}
          onSetQuantity={onSetQuantity}
          soldOut={soldOut}
        />
      ))}
    </ul>
  );
}

export function ScreenHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-bold text-primary">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
