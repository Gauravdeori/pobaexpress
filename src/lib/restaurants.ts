import chowmeinImg from "@/assets/chowmein.png";
import friedRiceImg from "@/assets/fried_rice.png";
import momosImg from "@/assets/momos.png";

import {
  DAJU_BAHADUR_MENU,
  DCAKERY_MENU,
  DIPJOY_BITE_HOUSE_MENU,
  DISPY_BAKERY_MENU,
  PRARTHONA_MENU,
  type MenuItem,
} from "./menu";

export type Restaurant = {
  slug: string;
  name: string;
  category: "food" | "cake";
  /** One line under the name — what they actually cook. */
  cuisine: string;
  /** Optional: a partner with no photo yet gets a plain tile, not a stand-in
   *  picture of food they don't sell. */
  image?: string;
  /** Typical door-to-door range in minutes. */
  eta: [number, number];
  /**
   * When the shop is actually open, for partners that don't run all day.
   * Omitted where the hours are the usual ones, so it never states a schedule
   * nobody gave us.
   */
  hours?: string;
  items: MenuItem[];
  /**
   * Out of 5, and only ever a real figure.
   *
   * Deliberately optional and deliberately unset: Poba Express has not started
   * delivering, so no one has rated anything. A placeholder here would be a
   * fabricated review shown to real customers, so partners with no ratings yet
   * are labelled "New" instead. Fill this in once there are genuine ratings to
   * average, together with `ratingCount`.
   */
  rating?: number;
  ratingCount?: number;
};

/**
 * `name` is what the cart stores as its source and what the WhatsApp order
 * quotes, so it has to match the section headings in menu.ts exactly.
 */
export const RESTAURANTS: Restaurant[] = [
  {
    slug: "prarthona",
    name: "Prarthona Restaurant",
    category: "food",
    cuisine: "Fried rice · Chowmein · Rolls · Momo",
    image: friedRiceImg,
    eta: [15, 25],
    items: PRARTHONA_MENU,
  },
  {
    slug: "daju-bahadur",
    name: "Daju Bahadur",
    category: "food",
    cuisine: "Nepali fast food · Momo · Chowmein",
    image: momosImg,
    eta: [15, 25],
    items: DAJU_BAHADUR_MENU,
  },
  {
    slug: "dipjoys-bite-house",
    name: "Dipjoy's Bite House",
    category: "food",
    cuisine: "Chowmein · Momo · Burger · Wraps",
    eta: [15, 25],
    items: DIPJOY_BITE_HOUSE_MENU,
  },
  {
    slug: "dispy-bakery",
    name: "Dispy Bakery",
    category: "food",
    cuisine: "Homemade pizza · Regular, medium, large",
    eta: [15, 25],
    hours: "Daily 1 PM – 6 PM",
    items: DISPY_BAKERY_MENU,
  },
];

/**
 * Cake is its own screen rather than a card in the restaurant list, so Dcakery
 * is not in `RESTAURANTS`. Re-exported here so the cake screen and the
 * restaurant screens still read their items from one place.
 */
export const CAKE_ITEMS = DCAKERY_MENU;

/** The bakery every cake order goes to. Must match the cart's stored source. */
export const CAKE_SOURCE = "Dcakery";

export function restaurantsIn(category: Restaurant["category"]): Restaurant[] {
  return RESTAURANTS.filter((r) => r.category === category);
}

export function getRestaurant(slug: string): Restaurant | undefined {
  return RESTAURANTS.find((r) => r.slug === slug);
}

/** Cheapest item on the menu, for the "from ₹x" line on a card. */
export function priceFrom(restaurant: Restaurant): number {
  return restaurant.items.reduce((low, item) => Math.min(low, item.price), Infinity);
}
