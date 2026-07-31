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
};

export const FOOD_MENU: MenuItem[] = [
  { id: "biryani-half", name: "Biryani Bite", variant: "Half plate", price: 49 },
  { id: "biryani-full", name: "Biryani Bite", variant: "Full plate", price: 99 },
  { id: "chicken-chowmein-half", name: "Chicken Chowmein", variant: "Half plate", price: 49 },
  { id: "chicken-chowmein-full", name: "Chicken Chowmein", variant: "Full plate", price: 99 },
  { id: "veg-chowmein-half", name: "Veg Chowmein", variant: "Half plate", price: 49 },
  { id: "veg-chowmein-full", name: "Veg Chowmein", variant: "Full plate", price: 95 },
  { id: "fried-rice-half", name: "Fried Rice", variant: "Half plate", price: 49 },
  { id: "fried-rice-full", name: "Fried Rice", variant: "Full plate", price: 99 },
  { id: "egg-chowmein", name: "Egg Chowmein", price: 49 },
  { id: "veg-momos", name: "Veg Momos", price: 49 },
  { id: "chicken-lollipop", name: "Chicken Lollipop", variant: "2 pieces", price: 50 },
  { id: "chilli-chicken", name: "Chilli Chicken", price: 49 },
  { id: "chicken-roll", name: "Chicken Roll", price: 29 },
  { id: "burger", name: "Burger", price: 49 },
];

export const CAKE_MENU: MenuItem[] = [
  { id: "cake-vanilla", name: "Vanilla", variant: "Half kg", price: 450 },
  { id: "cake-chocolate", name: "Chocolate", variant: "Half kg", price: 550 },
  { id: "cake-butterscotch", name: "Butterscotch", variant: "Half kg", price: 500 },
  { id: "cake-pineapple", name: "Pineapple", variant: "Half kg", price: 500 },
  { id: "cake-black-forest", name: "Black Forest", variant: "Half kg", price: 600 },
  { id: "cake-bento", name: "Bento Cake", price: 250 },
];

/** Categories without an entry here are free-text only. */
const MENUS: Record<string, MenuItem[]> = {
  food: FOOD_MENU,
  cake: CAKE_MENU,
};

export function getMenu(categoryId: string): MenuItem[] | undefined {
  return MENUS[categoryId];
}

export function itemLabel(item: MenuItem): string {
  return item.variant ? `${item.name} (${item.variant})` : item.name;
}

export function rupees(amount: number): string {
  return `₹${amount}`;
}
