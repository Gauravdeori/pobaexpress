/**
 * Poba Express price list. Item prices are in rupees and exclude delivery;
 * delivery is charged once per order, not per item.
 */

/** Delivery fee per order, by category. */
const DELIVERY_FEES: Record<string, number> = {
  food: 20,
  cake: 5,
  medicine: 30,
};

const DEFAULT_DELIVERY_FEE = 20;

/**
 * Flat, per order, on top of delivery — what it costs to run the thing rather
 * than what it costs to ride it. Shown as its own line so it is never mistaken
 * for the rider's fee, and never quietly folded into the food.
 */
export const PLATFORM_FEE = 3;

/**
 * The cheapest delivery on offer, derived rather than written down: the home
 * screen advertises a "from ₹x" fee, and a hand-typed figure there drifted
 * into claiming a flat ₹5 on categories that actually charge ₹20 and ₹30.
 */
export const MIN_DELIVERY_FEE = Math.min(...Object.values(DELIVERY_FEES));

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
import pizzaImg from "@/assets/pizza.jpg";
import burgerImg from "@/assets/burger2.jpg";
import pastaImg from "@/assets/pasta.jpg";
import maggiImg from "@/assets/maggi.jpg";
import frenchFriesImg from "@/assets/french-fries.jpg";
import chilliMushroomImg from "@/assets/chilli-mushroom.jpg";
import chocolateCakeImg from "@/assets/chocolate-cake.jpg";
import tiramisuImg from "@/assets/tiramisu.jpg";
import japaneseCheesecakeImg from "@/assets/japanese-cheesecake.jpg";
import newYorkCheesecakeImg from "@/assets/new-york-cheesecake.jpg";
import blueberryCheesecakeImg from "@/assets/blueberry-cheesecake.jpg";
import burntBasqueCheesecakeImg from "@/assets/burnt-basque-cheesecake.jpg";
import milletCakeLoafImg from "@/assets/millet-cake-loaf.jpg";
import butterscotchCakeImg from "@/assets/butterscotch-cake.jpg";
import carrotCakeImg from "@/assets/carrot-cake.jpg";
import bcBiriyaniImg from "@/assets/bc_biriyani.jpg";
import bcAndaMagazImg from "@/assets/bc_anda_magaz.jpg";
import bcSpaRollImg from "@/assets/bc_spa_roll.jpg";
import bcChowminImg from "@/assets/bc_chowmin.jpg";
import bcMaggieImg from "@/assets/bc_maggie.jpg";

/**
 * Item ids are prefixed per kitchen because two partners sell the same dish at
 * different prices — an unprefixed `chicken-chowmein-half` would collide in the
 * cart and in saved orders.
 */
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
  { id: "pr-french-fries", name: "French Fries", price: 58, image: frenchFriesImg },
  { id: "pr-pasta", name: "Pasta", price: 88, image: pastaImg },
  { id: "pr-maggi", name: "Maggi", price: 88, image: maggiImg },
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

/** R / M / L on the shop's board, spelled out so a size is never guessed at. */
export const DISPY_BAKERY_MENU: MenuItem[] = [
  {
    id: "dp-veg-cheese-regular",
    name: "Veg Cheese Pizza",
    variant: "Regular",
    price: 179,
    image: pizzaImg,
  },
  {
    id: "dp-veg-cheese-medium",
    name: "Veg Cheese Pizza",
    variant: "Medium",
    price: 249,
    image: pizzaImg,
  },
  {
    id: "dp-veg-cheese-large",
    name: "Veg Cheese Pizza",
    variant: "Large",
    price: 360,
    image: pizzaImg,
  },
  {
    id: "dp-sweetcorn-regular",
    name: "Sweetcorn Pizza",
    variant: "Regular",
    price: 199,
    image: pizzaImg,
  },
  {
    id: "dp-sweetcorn-medium",
    name: "Sweetcorn Pizza",
    variant: "Medium",
    price: 269,
    image: pizzaImg,
  },
  {
    id: "dp-sweetcorn-large",
    name: "Sweetcorn Pizza",
    variant: "Large",
    price: 389,
    image: pizzaImg,
  },
  {
    id: "dp-paneer-regular",
    name: "Paneer Pizza",
    variant: "Regular",
    price: 205,
    image: pizzaImg,
  },
  { id: "dp-paneer-medium", name: "Paneer Pizza", variant: "Medium", price: 279, image: pizzaImg },
  { id: "dp-paneer-large", name: "Paneer Pizza", variant: "Large", price: 405, image: pizzaImg },
  {
    id: "dp-chicken-regular",
    name: "Chicken Pizza",
    variant: "Regular",
    price: 208,
    image: pizzaImg,
  },
  {
    id: "dp-chicken-medium",
    name: "Chicken Pizza",
    variant: "Medium",
    price: 310,
    image: pizzaImg,
  },
  { id: "dp-chicken-large", name: "Chicken Pizza", variant: "Large", price: 469, image: pizzaImg },
];

/**
 * Half and full plates carry no piece count: the shop's board gives sizes but
 * not how many pieces are in each, and a count here would be invented.
 *
 * Chilli Mushroom, Chilli Paneer and French Fries have no photo — the only
 * chilli picture in the repo is of chicken, and putting it on the two
 * vegetarian dishes would misdescribe them to the customers who care most.
 */
export const BIRIYANI_CORNER_MENU: MenuItem[] = [
  { id: "bc-biriyani", name: "Biriyani", price: 116, image: bcBiriyaniImg },
  { id: "bc-anda-magaz", name: "Anda Magaz", price: 76, image: bcAndaMagazImg },
  { id: "bc-spa-roll", name: "Spa Roll", price: 66, image: bcSpaRollImg },
  { id: "bc-chowmin", name: "Chowmin", price: 66, image: bcChowminImg },
  { id: "bc-maggie", name: "Maggie", price: 56, image: bcMaggieImg },
];

/**
 * Cake now comes from one named bakery, so these are Dcakery's own prices.
 *
 * No `variant` on the round cakes: Dcakery quotes one price per cake rather
 * than per weight, and inventing a "Half kg" line here would be quoting a size
 * the bakery never gave.
 */
export const DCAKERY_MENU: MenuItem[] = [
  { id: "dc-chocolate", name: "Chocolate Cake", price: 630, image: chocolateCakeImg },
  { id: "dc-black-forest", name: "Black Forest Cake", price: 540, image: chocolateCakeImg },
  { id: "dc-butterscotch", name: "Butterscotch Cake", price: 500, image: butterscotchCakeImg },
  { id: "dc-vanilla", name: "Vanilla Cake", price: 440, image: newYorkCheesecakeImg },
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
  { id: "dc-rice-cake-loaf", name: "Rice Cake Loaf", price: 300, image: carrotCakeImg },
  { id: "dc-millet-cake-loaf", name: "Millet Cake Loaf", price: 330, image: milletCakeLoafImg },
  {
    id: "dc-tiramisu-mini-tub",
    name: "Tiramisu",
    variant: "Mini tub",
    price: 240,
    image: tiramisuImg,
  },
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
    { restaurant: "Biriyani Corner", items: BIRIYANI_CORNER_MENU },
    { restaurant: "Prarthona Restaurant", items: PRARTHONA_MENU },
    { restaurant: "Daju Bahadur", items: DAJU_BAHADUR_MENU },
    { restaurant: "Dispy Bakery", items: DISPY_BAKERY_MENU },
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
