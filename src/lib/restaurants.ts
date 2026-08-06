import biryaniImg from "@/assets/biryani.png";

import { CAKE_MENU, FOOD_MENU, type MenuItem } from "./menu";

export type Restaurant = {
  slug: string;
  name: string;
  category: "food" | "cake";
  /** One line under the name — what they actually cook. */
  cuisine: string;
  image: string;
  /** Typical door-to-door range in minutes. */
  eta: [number, number];
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

export const RESTAURANTS: Restaurant[] = [
  {
    slug: "biryani-bite",
    name: "Biryani Bite",
    category: "food",
    cuisine: "Biryani · Chinese · Rolls",
    image: biryaniImg,
    eta: [15, 25],
    items: FOOD_MENU,
  },
];

/**
 * Cakes come from whichever bakery is free rather than one named partner, so
 * they are listed as a category rather than a shop. Kept here so the cake
 * screen and the restaurant screens read from one place.
 */
export const CAKE_ITEMS = CAKE_MENU;

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
