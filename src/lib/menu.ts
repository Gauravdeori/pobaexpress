/**
 * Poba Express price list. Item prices are in rupees and exclude delivery;
 * delivery is charged once per order, not per item.
 */

/** Delivery fee per order, by category. */
const DELIVERY_FEES: Record<string, number> = {
  food: 20,
  cake: 10,
  medicine: 30,
};

const DEFAULT_DELIVERY_FEE = 20;

export function deliveryFee(categoryId: string): number {
  return DELIVERY_FEES[categoryId] ?? DEFAULT_DELIVERY_FEE;
}

export type MenuItem = {
  id: string;
  name: string;
  /** Portion or size qualifier, shown under the name. */
  variant?: string;
  /** Item price in rupees, before delivery. */
  price: number;
  /** Optional image URL for the item. */
  image?: string;
};

/**
 * A run of items from one kitchen or shop.
 *
 * A section with no `restaurant` renders without a heading — for a category we
 * ever source from whoever is free rather than one named partner. Every
 * section currently names its shop.
 */
export type MenuSection = {
  restaurant?: string;
  items: MenuItem[];
};

import biryaniImg from "@/assets/biryani.png";
import chowmeinImg from "@/assets/chowmein.png";
import friedRiceImg from "@/assets/fried_rice.png";
import momosImg from "@/assets/momos.png";
import lollipopImg from "@/assets/lollipop.png";
import chilliChickenImg from "@/assets/chilli_chicken.png";
import rollImg from "@/assets/roll.png";
import japaneseCheesecakeImg from "@/assets/japanese-cheesecake.jpg";
import newYorkCheesecakeImg from "@/assets/new-york-cheesecake.jpg";
import blueberryCheesecakeImg from "@/assets/blueberry-cheesecake.jpg";
import burntBasqueCheesecakeImg from "@/assets/burnt-basque-cheesecake.jpg";
import milletCakeLoafImg from "@/assets/millet-cake-loaf.jpg";

/**
 * Item ids are prefixed per kitchen because two partners sell the same dish at
 * different prices — an unprefixed `chicken-chowmein-half` would collide in the
 * cart and in saved orders.
 */
export const BIRYANI_BITE_MENU: MenuItem[] = [
  {
    id: "bb-chicken-biryani-quarter",
    name: "Chicken Biryani",
    variant: "Quarter",
    price: 59,
    image: biryaniImg,
  },
  {
    id: "bb-chicken-biryani-half",
    name: "Chicken Biryani",
    variant: "Half",
    price: 109,
    image: biryaniImg,
  },
  {
    id: "bb-chicken-biryani-full",
    name: "Chicken Biryani",
    variant: "Full",
    price: 210,
    image: biryaniImg,
  },
  { id: "bb-chicken-maggi", name: "Chicken Maggi", price: 59 },
  { id: "bb-egg-maggi", name: "Egg Maggi", price: 49 },
  { id: "bb-veg-maggi", name: "Veg Maggi", price: 49 },
  { id: "bb-chicken-pasta", name: "Chicken Pasta", price: 59 },
  { id: "bb-veg-pasta", name: "Veg Pasta", price: 49 },
];

export const PRARTHONA_MENU: MenuItem[] = [
  { id: "pr-veg-fried-rice", name: "Veg Fried Rice", price: 67, image: friedRiceImg },
  { id: "pr-egg-fried-rice", name: "Egg Fried Rice", price: 78, image: friedRiceImg },
  { id: "pr-chicken-fried-rice", name: "Chicken Fried Rice", price: 78, image: friedRiceImg },
  { id: "pr-mix-fried-rice", name: "Mix Fried Rice", price: 98, image: friedRiceImg },
  { id: "pr-veg-chowmein", name: "Veg Chowmein", price: 68, image: chowmeinImg },
  { id: "pr-chicken-chow", name: "Chicken Chow", price: 78, image: chowmeinImg },
  { id: "pr-egg-chow", name: "Egg Chow", price: 78, image: chowmeinImg },
  { id: "pr-mix-chow", name: "Mix Chow", price: 88, image: chowmeinImg },
  { id: "pr-veg-roll", name: "Veg Roll", price: 68, image: rollImg },
  { id: "pr-chicken-roll", name: "Chicken Roll", price: 88, image: rollImg },
  { id: "pr-egg-roll", name: "Egg Roll", price: 78, image: rollImg },
  { id: "pr-french-fries", name: "French Fries", price: 58 },
  { id: "pr-pasta", name: "Pasta", price: 88 },
  { id: "pr-maggi", name: "Maggi", price: 88 },
  { id: "pr-chicken-lollipop", name: "Chicken Lollipop", price: 108, image: lollipopImg },
  { id: "pr-chilli-chicken", name: "Chilli Chicken", price: 145, image: chilliChickenImg },
  { id: "pr-chicken-dry-fry", name: "Chicken Dry Fry", price: 109, image: chilliChickenImg },
  { id: "pr-steam-momo", name: "Steam Momo", price: 78, image: momosImg },
  { id: "pr-fry-momo", name: "Fry Momo", price: 98, image: momosImg },
];

export const DAJU_BAHADUR_MENU: MenuItem[] = [
  {
    id: "db-chicken-chowmein-half",
    name: "Chicken Chowmein",
    variant: "Half plate",
    price: 59,
    image: chowmeinImg,
  },
  {
    id: "db-chicken-chowmein-full",
    name: "Chicken Chowmein",
    variant: "Full plate",
    price: 109,
    image: chowmeinImg,
  },
  {
    id: "db-chicken-lollipop-1",
    name: "Chicken Lollipop",
    variant: "1 piece",
    price: 39,
    image: lollipopImg,
  },
  {
    id: "db-chicken-lollipop-4",
    name: "Chicken Lollipop",
    variant: "4 pieces",
    price: 109,
    image: lollipopImg,
  },
  {
    id: "db-veg-momo-half",
    name: "Veg Momo",
    variant: "Half plate · 8 pieces",
    price: 59,
    image: momosImg,
  },
  {
    id: "db-veg-momo-full",
    name: "Veg Momo",
    variant: "Full plate · 16 pieces",
    price: 109,
    image: momosImg,
  },
  {
    id: "db-fried-rice-half",
    name: "Fried Rice",
    variant: "Half plate",
    price: 59,
    image: friedRiceImg,
  },
  {
    id: "db-fried-rice-full",
    name: "Fried Rice",
    variant: "Full plate",
    price: 109,
    image: friedRiceImg,
  },
  {
    id: "db-chilli-chicken-half",
    name: "Chilli Chicken",
    variant: "Half plate",
    price: 59,
    image: chilliChickenImg,
  },
  {
    id: "db-chilli-chicken-full",
    name: "Chilli Chicken",
    variant: "Full plate",
    price: 109,
    image: chilliChickenImg,
  },
];

/**
 * Cake now comes from one named bakery, so these are Dcakery's own prices.
 *
 * No `variant` on the round cakes: Dcakery quotes one price per cake rather
 * than per weight, and inventing a "Half kg" line here would be quoting a size
 * the bakery never gave.
 */
export const DCAKERY_MENU: MenuItem[] = [
  { id: "dc-chocolate", name: "Chocolate Cake", price: 630 },
  { id: "dc-black-forest", name: "Black Forest Cake", price: 540 },
  { id: "dc-butterscotch", name: "Butterscotch Cake", price: 500 },
  { id: "dc-vanilla", name: "Vanilla Cake", price: 440 },
  {
    id: "dc-japanese-cheesecake",
    name: "Japanese Cheesecake",
    price: 740,
    image: japaneseCheesecakeImg,
  },
  {
    id: "dc-new-york-cheesecake",
    name: "New York Cheesecake",
    price: 730,
    image: newYorkCheesecakeImg,
  },
  {
    id: "dc-blueberry-cheesecake",
    name: "Blueberry Cheesecake",
    price: 840,
    image: blueberryCheesecakeImg,
  },
  {
    id: "dc-burnt-basque-cheesecake",
    name: "Burnt Basque Cheesecake",
    price: 730,
    image: burntBasqueCheesecakeImg,
  },
  { id: "dc-rice-cake-loaf", name: "Rice Cake Loaf", price: 300 },
  { id: "dc-millet-cake-loaf", name: "Millet Cake Loaf", price: 330, image: milletCakeLoafImg },
  { id: "dc-tiramisu-mini-tub", name: "Tiramisu", variant: "Mini tub", price: 240 },
];

/**
 * Categories without an entry here are free-text only.
 *
 * Sections are the source of truth and the flat list below is derived from
 * them, so a new partner is one entry here and nothing else — the cart, the
 * totals and the WhatsApp message all read the flat list.
 */
const MENU_SECTIONS: Record<string, MenuSection[]> = {
  // One section per kitchen — never a flat append, or the WhatsApp order loses
  // track of who is cooking it. Names must match `RESTAURANTS` in
  // restaurants.ts, which is what the cart records as its source.
  food: [
    { restaurant: "Biryani Bite", items: BIRYANI_BITE_MENU },
    { restaurant: "Prarthona Restaurant", items: PRARTHONA_MENU },
    { restaurant: "Daju Bahadur", items: DAJU_BAHADUR_MENU },
  ],
  cake: [{ restaurant: "Dcakery", items: DCAKERY_MENU }],
};

export function getMenuSections(categoryId: string): MenuSection[] | undefined {
  return MENU_SECTIONS[categoryId];
}

/** Every item in a category, flattened across its sections. */
export function getMenu(categoryId: string): MenuItem[] | undefined {
  return MENU_SECTIONS[categoryId]?.flatMap((section) => section.items);
}

export function itemLabel(item: MenuItem): string {
  return item.variant ? `${item.name} (${item.variant})` : item.name;
}

export function rupees(amount: number): string {
  return `₹${amount}`;
}
