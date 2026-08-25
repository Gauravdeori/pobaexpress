import { Link } from "@tanstack/react-router";
import { Minus, Plus, Star, UtensilsCrossed } from "lucide-react";

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
  return (
    <Link
      to="/app/r/$slug"
      params={{ slug: restaurant.slug }}
      className="flex flex-col gap-3 rounded-3xl border border-border/40 bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md active:scale-[0.98]"
    >
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-secondary">
        {restaurant.image ? (
          <img src={restaurant.image} alt="" aria-hidden className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center bg-accent/10 text-accent">
            <UtensilsCrossed className="size-8" />
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-extrabold text-white drop-shadow-md">
              {restaurant.name}
            </h3>
            <p className="truncate text-sm font-medium text-white/90 drop-shadow-sm">
              {restaurant.cuisine}
            </p>
          </div>
          <Rating restaurant={restaurant} />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-1 text-foreground">
            <Star className="size-3 fill-accent text-accent" />
            {restaurant.rating?.toFixed(1) || "New"}
          </span>
          <span>•</span>
          <span>
            {restaurant.eta[0]}–{restaurant.eta[1]} mins
          </span>
          <span>•</span>
          <span>₹{priceFrom(restaurant)} for one</span>
        </div>
      </div>
    </Link>
  );
}

/**
 * The card shape used in a horizontal rail: photo on top, details under.
 *
 * A different shape from `RestaurantCard` rather than the same one turned
 * sideways — a rail card is scanned in passing and wants the photo doing the
 * work, while the list row is read.
 */
export function RestaurantTile({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link
      to="/app/r/$slug"
      params={{ slug: restaurant.slug }}
      className="group flex w-44 shrink-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-200 hover:border-accent active:scale-[0.98] sm:w-52"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt=""
            aria-hidden
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-accent">
            <UtensilsCrossed className="size-8" />
          </span>
        )}
        {restaurant.hours && (
          <span className="absolute bottom-2 left-2 rounded-full bg-primary/90 px-2 py-1 text-[10px] font-bold text-primary-foreground backdrop-blur-sm">
            {restaurant.hours}
          </span>
        )}
      </div>
      <div className="min-w-0 p-3">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-primary">{restaurant.name}</h3>
          <Rating restaurant={restaurant} />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{restaurant.cuisine}</p>
        <p className="mt-1.5 text-xs font-medium text-muted-foreground">
          {restaurant.eta[0]}–{restaurant.eta[1]} min · from {rupees(priceFrom(restaurant))}
        </p>
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
}: {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onSetQuantity: (quantity: number) => void;
  className?: string;
}) {
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
}: {
  sizes: MenuItem[];
  quantityOf: (id: string) => number;
  onAdd: (item: MenuItem) => void;
  onSetQuantity: (id: string, quantity: number) => void;
}) {
  const [first] = sizes;
  const inCart = sizes.some((size) => quantityOf(size.id) > 0);
  const single = sizes.length === 1;

  return (
    <li className="relative flex flex-col justify-between py-6 border-b border-border/40 last:border-0">
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
                className="w-full h-10 shadow-[0_3px_8px_rgba(0,0,0,0.12)]"
              />
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
                <div className="truncate text-[15px] font-semibold text-foreground">
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
