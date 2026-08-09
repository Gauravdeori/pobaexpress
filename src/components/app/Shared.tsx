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
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-accent"
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
      className="group flex w-44 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-accent sm:w-52"
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

/** Menu row with a stepper. `quantity` of 0 collapses it to a single Add. */
export function ItemRow({
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
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3 transition-colors",
        quantity ? "border-accent bg-accent/5" : "border-border bg-card",
      )}
    >
      {item.image && (
        <img
          src={item.image}
          alt=""
          aria-hidden
          className="size-14 shrink-0 rounded-xl object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-primary">{item.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {item.variant ? `${item.variant} · ` : ""}
          {rupees(item.price)}
        </p>
      </div>

      {quantity > 0 ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onSetQuantity(quantity - 1)}
            aria-label={`Remove one ${itemLabel(item)}`}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-primary"
          >
            <Minus className="size-4" />
          </button>
          <span aria-live="polite" className="w-6 text-center text-sm font-semibold text-primary">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onSetQuantity(quantity + 1)}
            aria-label={`Add one more ${itemLabel(item)}`}
            className="flex size-9 items-center justify-center rounded-full bg-gradient-accent text-accent-foreground"
          >
            <Plus className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Add ${itemLabel(item)}`}
          className="shrink-0 rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Add
        </button>
      )}
    </li>
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
