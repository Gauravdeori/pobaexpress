import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";

import { RestaurantCard } from "@/components/app/Shared";
import { priceFrom, restaurantsIn, type Restaurant } from "@/lib/restaurants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/food")({
  // Only present when something is actually being searched, so an ordinary
  // link into the list stays at /app/food rather than trailing an empty ?q=.
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search.q === "string" && search.q.trim() ? { q: search.q } : {},
  component: FoodScreen,
});

/**
 * Only orderings the data can actually justify.
 *
 * No "fastest" — every kitchen quotes the same 15–25 minutes, so a sort on it
 * would just reshuffle the list and imply a difference that isn't there. No
 * "top rated" either, for want of a single real rating.
 */
const SORTS = {
  default: { label: "Recommended", compare: null },
  price: {
    label: "Price: low to high",
    compare: (a: Restaurant, b: Restaurant) => priceFrom(a) - priceFrom(b),
  },
  name: {
    label: "Name: A–Z",
    compare: (a: Restaurant, b: Restaurant) => a.name.localeCompare(b.name),
  },
} as const;

type SortKey = keyof typeof SORTS;

/**
 * Dishes Jonai spells more than one way.
 *
 * Biriyani Corner writes "Biriyani" and "Chowmin" on its board; the category
 * tiles on the home screen — and most customers typing — write "Biryani" and
 * "Chowmein". A plain substring match sends both to "Nothing matches that"
 * while the dish is sitting on the menu, so each group is tried in full.
 */
const SPELLINGS: string[][] = [
  ["biryani", "biriyani"],
  ["chowmein", "chowmin", "chow mein", "chow"],
  ["momo", "momos"],
  ["maggi", "maggie"],
];

/** Every spelling worth trying for what was typed. */
function variants(needle: string): string[] {
  const group = SPELLINGS.find((forms) => forms.includes(needle));
  return group ?? [needle];
}

/** Matches the shop, what it cooks, or anything on its menu. */
function matches(restaurant: Restaurant, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    restaurant.name,
    restaurant.cuisine,
    // Searching dishes is the point: nobody looks for "Prarthona", they look
    // for momos and expect to be told who makes them.
    ...restaurant.items.map((item) => item.name),
  ]
    .join(" ")
    .toLowerCase();

  return variants(needle).some((form) => haystack.includes(form));
}

function FoodScreen() {
  const all = restaurantsIn("food");
  // The category tiles on the home screen link in with a dish already typed,
  // so "Biryani" opens the kitchens that cook it rather than an empty list.
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");
  const [sort, setSort] = useState<SortKey>("default");

  // Following a second such link, or going back to one, has to move the box —
  // which the `useState` initialiser alone would not do.
  useEffect(() => {
    setQuery(q ?? "");
  }, [q]);

  const shown = useMemo(() => {
    const found = all.filter((r) => matches(r, query));
    const compare = SORTS[sort].compare;
    return compare ? [...found].sort(compare) : found;
  }, [all, query, sort]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <div className="flex items-center gap-3">
        <Link
          to="/app"
          aria-label="Back"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-primary">Restaurants</h1>
          <p className="truncate text-xs text-muted-foreground">Jonai, Assam</p>
        </div>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search restaurants or dishes…"
          aria-label="Search restaurants or dishes"
          className="h-12 w-full rounded-2xl border border-border bg-card pl-11 pr-11 text-sm text-primary outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-primary"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(Object.keys(SORTS) as SortKey[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={sort === key}
            onClick={() => setSort(key)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              sort === key
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-primary",
            )}
          >
            {SORTS[key].label}
          </button>
        ))}
      </div>

      <p className="mb-3 mt-4 text-xs font-medium text-muted-foreground">
        {shown.length} {shown.length === 1 ? "kitchen" : "kitchens"}
        {query.trim() ? ` matching “${query.trim()}”` : " delivering in Jonai"}
      </p>

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm font-medium text-primary">Nothing matches that</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a dish instead — momos, biryani, pizza.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {shown.map((r) => (
            <RestaurantCard key={r.slug} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  );
}
