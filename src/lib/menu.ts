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
 * Categories we don't source from a single named partner — cake, where the
 * order goes to whichever bakery is free — have one section with no
 * `restaurant`, and render without a heading.
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
import burgerImg from "@/assets/burger.png";

export const FOOD_MENU: MenuItem[] = [
  { id: "biryani-half", name: "Biryani", variant: "Half plate", price: 49, image: biryaniImg },
  { id: "biryani-full", name: "Biryani", variant: "Full plate", price: 99, image: biryaniImg },
  {
    id: "chicken-chowmein-half",
    name: "Chicken Chowmein",
    variant: "Half plate",
    price: 49,
    image: chowmeinImg,
  },
  {
    id: "chicken-chowmein-full",
    name: "Chicken Chowmein",
    variant: "Full plate",
    price: 99,
    image: chowmeinImg,
  },
  {
    id: "veg-chowmein-half",
    name: "Veg Chowmein",
    variant: "Half plate",
    price: 49,
    image: chowmeinImg,
  },
  {
    id: "veg-chowmein-full",
    name: "Veg Chowmein",
    variant: "Full plate",
    price: 95,
    image: chowmeinImg,
  },
  {
    id: "fried-rice-half",
    name: "Fried Rice",
    variant: "Half plate",
    price: 49,
    image: friedRiceImg,
  },
  {
    id: "fried-rice-full",
    name: "Fried Rice",
    variant: "Full plate",
    price: 99,
    image: friedRiceImg,
  },
  { id: "egg-chowmein", name: "Egg Chowmein", price: 49, image: chowmeinImg },
  { id: "veg-momos", name: "Veg Momos", price: 49, image: momosImg },
  {
    id: "chicken-lollipop",
    name: "Chicken Lollipop",
    variant: "2 pieces",
    price: 50,
    image: lollipopImg,
  },
  { id: "chilli-chicken", name: "Chilli Chicken", price: 49, image: chilliChickenImg },
  { id: "chicken-roll", name: "Chicken Roll", price: 29, image: rollImg },
  { id: "burger", name: "Burger", price: 49, image: burgerImg },
];

export const CAKE_MENU: MenuItem[] = [
  { id: "cake-vanilla", name: "Vanilla", variant: "Half kg", price: 450 },
  { id: "cake-chocolate", name: "Chocolate", variant: "Half kg", price: 550 },
  { id: "cake-butterscotch", name: "Butterscotch", variant: "Half kg", price: 500 },
  { id: "cake-pineapple", name: "Pineapple", variant: "Half kg", price: 500 },
  { id: "cake-black-forest", name: "Black Forest", variant: "Half kg", price: 600 },
  { id: "cake-bento", name: "Bento Cake", price: 250 },
];

/**
 * Categories without an entry here are free-text only.
 *
 * Sections are the source of truth and the flat list below is derived from
 * them, so a new partner is one entry here and nothing else — the cart, the
 * totals and the WhatsApp message all read the flat list.
 */
const MENU_SECTIONS: Record<string, MenuSection[]> = {
  // Every dish on the list currently comes out of this one kitchen. To add a
  // second, split the items into another section rather than a flat append.
  food: [{ restaurant: "Biryani Bite", items: FOOD_MENU }],
  cake: [{ items: CAKE_MENU }],
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
