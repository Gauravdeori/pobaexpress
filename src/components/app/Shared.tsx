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
      className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 transition-all duration-200 hover:border-accent active:scale-[0.99]"
    >
      <RestaurantThumb image={restaurant.image} className="size-20" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold text-primary">{restaurant.name}</h3>
          <Rating restaurant={restaurant} />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{restaurant.cuisine}</p>
        <p className="mt-1.5 text-xs font-medium text-muted-foreground">
          {restaurant.eta[0]}–{restaurant.eta[1]} min · from {rupees(priceFrom(restaurant))}
        </p>
        {restaurant.hours && (
          <p className="mt-0.5 truncate text-xs font-medium text-accent">{restaurant.hours}</p>
        )}
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
}: {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onSetQuantity: (quantity: number) => void;
}) {
  if (quantity > 0) {
    return (
      <div className="flex shrink-0 items-center gap-1 rounded-full border border-accent bg-accent/5 p-0.5">
        <button
          type="button"
          onClick={() => onSetQuantity(quantity - 1)}
          aria-label={`Remove one ${itemLabel(item)}`}
          className="flex size-8 items-center justify-center rounded-full text-accent transition-transform active:scale-90"
        >
          <Minus className="size-4" />
        </button>
        <span aria-live="polite" className="w-5 text-center text-sm font-bold text-accent">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => onSetQuantity(quantity + 1)}
          aria-label={`Add one more ${itemLabel(item)}`}
          className="flex size-8 items-center justify-center rounded-full bg-gradient-accent text-accent-foreground transition-transform active:scale-90"
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
      className="shrink-0 rounded-full border border-accent bg-card px-5 py-1.5 text-sm font-bold text-accent shadow-sm transition-all active:scale-95 hover:bg-accent hover:text-accent-foreground"
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
    <li
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-colors",
        inCart ? "border-accent/60" : "border-border/70",
      )}
    >
      <div className="flex items-center gap-3 p-3">
        {first.image && (
          <img
            src={first.image}
            alt=""
            aria-hidden
            className="size-16 shrink-0 rounded-xl object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight text-primary">
            {first.name}
          </p>
          {single ? (
            <p className="mt-1 text-sm font-bold text-primary">{rupees(first.price)}</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              {sizes.length} sizes · from {rupees(Math.min(...sizes.map((s) => s.price)))}
            </p>
          )}
        </div>

        {single && (
          <AddControl
            item={first}
            quantity={quantityOf(first.id)}
            onAdd={() => onAdd(first)}
            onSetQuantity={(next) => onSetQuantity(first.id, next)}
          />
        )}
      </div>

      {/* Each size keeps its own row, because each is a separate line in the
          cart — collapsing them into one control would make "two biryanis"
          ambiguous about which two. */}
      {!single && (
        <ul className="border-t border-border/70">
          {sizes.map((size) => (
            <li
              key={size.id}
              className="flex items-center gap-3 border-b border-border/50 px-3 py-2.5 last:border-b-0"
            >
              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {size.variant}
              </span>
              <span className="shrink-0 text-sm font-bold text-primary">{rupees(size.price)}</span>
              <AddControl
                item={size}
                quantity={quantityOf(size.id)}
                onAdd={() => onAdd(size)}
                onSetQuantity={(next) => onSetQuantity(size.id, next)}
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
