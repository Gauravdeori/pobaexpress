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
import msMaaHotelCoverImg from "@/assets/ms_maa_hotel_cover.jpg";
import thukpaImg from "@/assets/thukpa.jpg";

/**
 * Item ids are prefixed per kitchen because two partners sell the same dish at
 * different prices — an unprefixed `chicken-chowmein-half` would collide in the
 * cart and in saved orders.
 */
export const PRARTHONA_MENU: MenuItem[] = [
  // FRIED RICE
  {
    id: "pr-veg-fried-rice-half",
    name: "Veg Fried Rice",
    variant: "Half plate",
    price: 93,
    image: friedRiceImg,
  },
  {
    id: "pr-veg-fried-rice-full",
    name: "Veg Fried Rice",
    variant: "Full plate",
    price: 149,
    image: friedRiceImg,
  },
  {
    id: "pr-egg-fried-rice-half",
    name: "Egg Fried Rice",
    variant: "Half plate",
    price: 103,
    image: friedRiceImg,
  },
  {
    id: "pr-egg-fried-rice-full",
    name: "Egg Fried Rice",
    variant: "Full plate",
    price: 169,
    image: friedRiceImg,
  },
  {
    id: "pr-chicken-fried-rice-half",
    name: "Chicken Fried Rice",
    variant: "Half plate",
    price: 103,
    image: friedRiceImg,
  },
  {
    id: "pr-chicken-fried-rice-full",
    name: "Chicken Fried Rice",
    variant: "Full plate",
    price: 169,
    image: friedRiceImg,
  },
  {
    id: "pr-mix-fried-rice-half",
    name: "Mix Fried Rice",
    variant: "Half plate",
    price: 123,
    image: friedRiceImg,
  },
  {
    id: "pr-mix-fried-rice-full",
    name: "Mix Fried Rice",
    variant: "Full plate",
    price: 209,
    image: friedRiceImg,
  },

  // NOODLES
  {
    id: "pr-veg-chowmein-half",
    name: "Veg Chowmein",
    variant: "Half plate",
    price: 93,
    image: chowmeinImg,
  },
  {
    id: "pr-veg-chowmein-full",
    name: "Veg Chowmein",
    variant: "Full plate",
    price: 149,
    image: chowmeinImg,
  },
  {
    id: "pr-chicken-chow-half",
    name: "Chicken Chow",
    variant: "Half plate",
    price: 103,
    image: chowmeinImg,
  },
  {
    id: "pr-chicken-chow-full",
    name: "Chicken Chow",
    variant: "Full plate",
    price: 169,
    image: chowmeinImg,
  },
  {
    id: "pr-egg-chow-half",
    name: "Egg Chow",
    variant: "Half plate",
    price: 103,
    image: chowmeinImg,
  },
  {
    id: "pr-egg-chow-full",
    name: "Egg Chow",
    variant: "Full plate",
    price: 169,
    image: chowmeinImg,
  },
  {
    id: "pr-mix-chow-half",
    name: "Mix Chow",
    variant: "Half plate",
    price: 123,
    image: chowmeinImg,
  },
  {
    id: "pr-mix-chow-full",
    name: "Mix Chow",
    variant: "Full plate",
    price: 209,
    image: chowmeinImg,
  },

  // ROLL
  { id: "pr-veg-roll-half", name: "Veg Roll", variant: "Half plate", price: 93, image: rollImg },
  { id: "pr-veg-roll-full", name: "Veg Roll", variant: "Full plate", price: 149, image: rollImg },
  {
    id: "pr-chicken-roll-half",
    name: "Chicken Roll",
    variant: "Half plate",
    price: 113,
    image: rollImg,
  },
  {
    id: "pr-chicken-roll-full",
    name: "Chicken Roll",
    variant: "Full plate",
    price: 189,
    image: rollImg,
  },
  { id: "pr-egg-roll-half", name: "Egg Roll", variant: "Half plate", price: 103, image: rollImg },
  { id: "pr-egg-roll-full", name: "Egg Roll", variant: "Full plate", price: 174, image: rollImg },

  // EXTRAS
  {
    id: "pr-french-fries-half",
    name: "French Fries",
    variant: "Half plate",
    price: 83,
    image: frenchFriesImg,
  },
  {
    id: "pr-french-fries-full",
    name: "French Fries",
    variant: "Full plate",
    price: 129,
    image: frenchFriesImg,
  },
  { id: "pr-pasta-half", name: "Pasta", variant: "Half plate", price: 113, image: pastaImg },
  { id: "pr-pasta-full", name: "Pasta", variant: "Full plate", price: 189, image: pastaImg },
  { id: "pr-maggi-half", name: "Maggi", variant: "Half plate", price: 63, image: maggiImg },
  { id: "pr-maggi-full", name: "Maggi", variant: "Full plate", price: 129, image: maggiImg },

  // CHICKEN & MOMO
  {
    id: "pr-chicken-lollipop-half",
    name: "Chicken Lollipop",
    variant: "Half plate",
    price: 133,
    image: lollipopImg,
  },
  {
    id: "pr-chicken-lollipop-full",
    name: "Chicken Lollipop",
    variant: "Full plate",
    price: 237,
    image: lollipopImg,
  },
  {
    id: "pr-chilli-chicken-half",
    name: "Chilli Chicken",
    variant: "Half plate",
    price: 173,
    image: chilliChickenImg,
  },
  {
    id: "pr-chilli-chicken-full",
    name: "Chilli Chicken",
    variant: "Full plate",
    price: 317,
    image: chilliChickenImg,
  },
  {
    id: "pr-chicken-dry-fry-half",
    name: "Chicken Dry Fry",
    variant: "Half plate",
    price: 133,
    image: chilliChickenImg,
  },
  {
    id: "pr-chicken-dry-fry-full",
    name: "Chicken Dry Fry",
    variant: "Full plate",
    price: 237,
    image: chilliChickenImg,
  },
  {
    id: "pr-steam-momo-half",
    name: "Steam Momo",
    variant: "Half plate",
    price: 103,
    image: momosImg,
  },
  {
    id: "pr-steam-momo-full",
    name: "Steam Momo",
    variant: "Full plate",
    price: 177,
    image: momosImg,
  },
  { id: "pr-fry-momo-half", name: "Fry Momo", variant: "Half plate", price: 123, image: momosImg },
  { id: "pr-fry-momo-full", name: "Fry Momo", variant: "Full plate", price: 217, image: momosImg },

  // BIRYANI
  {
    id: "pr-biryani-chicken-half",
    name: "Biryani Chicken",
    variant: "Half plate",
    price: 156,
    image: biryaniImg,
  },
  {
    id: "pr-biryani-chicken-full",
    name: "Biryani Chicken",
    variant: "Full plate",
    price: 276,
    image: biryaniImg,
  },
];

export const GURUNG_FAST_FOOD_MENU: MenuItem[] = [
  {
    id: "gf-chicken-chowmein-half",
    name: "Chicken Chowmein",
    variant: "Half plate",
    price: 79,
    image: chowmeinImg,
  },
  {
    id: "gf-chicken-chowmein-full",
    name: "Chicken Chowmein",
    variant: "Full plate",
    price: 129,
    image: chowmeinImg,
  },
  {
    id: "gf-chicken-lollipop-1",
    name: "Chicken Lollipop",
    variant: "1 piece",
    price: 49,
    image: lollipopImg,
  },
  {
    id: "gf-chicken-lollipop-4",
    name: "Chicken Lollipop",
    variant: "4 pieces",
    price: 129,
    image: lollipopImg,
  },
  {
    id: "gf-veg-momo-half",
    name: "Veg Momo",
    variant: "Half plate · 8 pieces",
    price: 79,
    image: momosImg,
  },
  {
    id: "gf-veg-momo-full",
    name: "Veg Momo",
    variant: "Full plate · 16 pieces",
    price: 129,
    image: momosImg,
  },
  {
    id: "gf-fried-rice-half",
    name: "Fried Rice",
    variant: "Half plate",
    price: 79,
    image: friedRiceImg,
  },
  {
    id: "gf-fried-rice-full",
    name: "Fried Rice",
    variant: "Full plate",
    price: 129,
    image: friedRiceImg,
  },
  {
    id: "gf-chilli-chicken-half",
    name: "Chilli Chicken",
    variant: "Half plate",
    price: 79,
    image: chilliChickenImg,
  },
  {
    id: "gf-chilli-chicken-full",
    name: "Chilli Chicken",
    variant: "Full plate",
    price: 129,
    image: chilliChickenImg,
  },
  {
    id: "gf-biryani-chicken-full",
    name: "Biryani Chicken",
    variant: "Full plate",
    price: 149,
    image: biryaniImg,
  },
];

/** Alias for backward compatibility */
export const DAJU_BAHADUR_MENU = GURUNG_FAST_FOOD_MENU;

/** R / M / L on the shop's board, spelled out so a size is never guessed at. */
export const DISPY_BAKERY_MENU: MenuItem[] = [
  {
    id: "dp-veg-cheese-regular",
    name: "Veg Cheese Pizza",
    variant: "Regular",
    price: 209,
    image: pizzaImg,
  },
  {
    id: "dp-veg-cheese-medium",
    name: "Veg Cheese Pizza",
    variant: "Medium",
    price: 279,
    image: pizzaImg,
  },
  {
    id: "dp-veg-cheese-large",
    name: "Veg Cheese Pizza",
    variant: "Large",
    price: 389,
    image: pizzaImg,
  },
  {
    id: "dp-sweetcorn-regular",
    name: "Sweetcorn Pizza",
    variant: "Regular",
    price: 219,
    image: pizzaImg,
  },
  {
    id: "dp-sweetcorn-medium",
    name: "Sweetcorn Pizza",
    variant: "Medium",
    price: 299,
    image: pizzaImg,
  },
  {
    id: "dp-sweetcorn-large",
    name: "Sweetcorn Pizza",
    variant: "Large",
    price: 429,
    image: pizzaImg,
  },
  {
    id: "dp-paneer-regular",
    name: "Paneer Pizza",
    variant: "Regular",
    price: 229,
    image: pizzaImg,
  },
  { id: "dp-paneer-medium", name: "Paneer Pizza", variant: "Medium", price: 319, image: pizzaImg },
  { id: "dp-paneer-large", name: "Paneer Pizza", variant: "Large", price: 449, image: pizzaImg },
  {
    id: "dp-chicken-regular",
    name: "Chicken Pizza",
    variant: "Regular",
    price: 239,
    image: pizzaImg,
  },
  {
    id: "dp-chicken-medium",
    name: "Chicken Pizza",
    variant: "Medium",
    price: 349,
    image: pizzaImg,
  },
  { id: "dp-chicken-large", name: "Chicken Pizza", variant: "Large", price: 499, image: pizzaImg },
];

export const BIRIYANI_CORNER_MENU: MenuItem[] = [
  {
    id: "bc-biriyani-half",
    name: "Biryani (Chicken with egg)",
    variant: "Half plate",
    price: 129,
    image: bcBiriyaniImg,
  },
  {
    id: "bc-biriyani-full",
    name: "Biryani (Chicken with egg)",
    variant: "Full plate",
    price: 239,
    image: bcBiriyaniImg,
  },
  { id: "bc-anda-magaz", name: "Anda Magaz", price: 79, image: bcAndaMagazImg },
  { id: "bc-spa-roll", name: "Spa Roll", price: 79, image: bcSpaRollImg },
  {
    id: "bc-chowmin-half",
    name: "Chowmin",
    variant: "Half plate",
    price: 69,
    image: bcChowminImg,
  },
  {
    id: "bc-chowmin-full",
    name: "Chowmin",
    variant: "Full plate",
    price: 139,
    image: bcChowminImg,
  },
  { id: "bc-maggie", name: "Maggie", price: 49, image: bcMaggieImg },
];

export const DCAKERY_MENU: MenuItem[] = [
  { id: "dc-chocolate", name: "Chocolate Cake", price: 649, image: chocolateCakeImg },
  { id: "dc-black-forest", name: "Black Forest Cake", price: 549, image: chocolateCakeImg },
  { id: "dc-butterscotch", name: "Butterscotch Cake", price: 499, image: butterscotchCakeImg },
  { id: "dc-vanilla", name: "Vanilla Cake", price: 449, image: newYorkCheesecakeImg },
  {
    id: "dc-japanese-cheesecake",
    name: "Japanese Cheesecake",
    price: 749,
    image: japaneseCheesecakeImg,
  },
  {
    id: "dc-new-york-cheesecake",
    name: "New York Cheesecake",
    price: 749,
    image: newYorkCheesecakeImg,
  },
  {
    id: "dc-blueberry-cheesecake",
    name: "Blueberry Cheesecake",
    price: 849,
    image: blueberryCheesecakeImg,
  },
  {
    id: "dc-burnt-basque-cheesecake",
    name: "Burnt Basque Cheesecake",
    price: 749,
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

export const MS_MAA_HOTEL_MENU: MenuItem[] = [
  // RICE
  { id: "mm-veg-thali", name: "Veg Thali", price: 99, image: msMaaHotelCoverImg },
  { id: "mm-pork-thali", name: "Pork Thali", price: 149, image: msMaaHotelCoverImg },
  { id: "mm-chicken-thali", name: "Chicken Thali", price: 179, image: msMaaHotelCoverImg },
  { id: "mm-fish-thali", name: "Fish Thali", price: 179, image: msMaaHotelCoverImg },

  // ROTI / NUN
  { id: "mm-roti-thali", name: "Roti Thali", price: 79 },
  { id: "mm-puri-thali", name: "Puri Thali", price: 79 },

  // NON-VEG STARTERS
  { id: "mm-egg-omelette", name: "Egg Omelette", price: 39 },
  { id: "mm-egg-pouch", name: "Egg Pouch", price: 39 },

  // NON-VEG MAIN COURSE
  { id: "mm-handi-mutton-half", name: "Handi Mutton", variant: "Half plate", price: 229 },
  { id: "mm-handi-mutton-full", name: "Handi Mutton", variant: "Full plate", price: 429 },
  { id: "mm-handi-chicken-half", name: "Handi Chicken", variant: "Half plate", price: 179 },
  { id: "mm-handi-chicken-full", name: "Handi Chicken", variant: "Full plate", price: 329 },
  { id: "mm-boiled-local-chicken", name: "Boiled Local Chicken with Bamboo Shoots", price: 279 },
  { id: "mm-til-gahori-half", name: "Til Gahori", variant: "Half plate", price: 129 },
  { id: "mm-til-gahori-full", name: "Til Gahori", variant: "Full plate", price: 229 },
  { id: "mm-kochot-gahori-half", name: "Kochot Gahori", variant: "Half plate", price: 129 },
  { id: "mm-kochot-gahori-full", name: "Kochot Gahori", variant: "Full plate", price: 229 },
];

export const MONTU_FAST_FOOD_MENU: MenuItem[] = [
  // PIZZA
  { id: "mf-pizza-veg", name: "Pizza Veg", price: 214, image: pizzaImg },
  { id: "mf-chicken-pizza", name: "Chicken Pizza", price: 234, image: pizzaImg },

  // ROLL
  { id: "mf-chicken-roll", name: "Chicken Roll", price: 84, image: rollImg },

  // BURGER
  { id: "mf-burger-chicken", name: "Burger Chicken", price: 184, image: burgerImg },
  { id: "mf-burger-veg", name: "Burger Veg", price: 134, image: burgerImg },

  // BIRTHDAY CAKE
  {
    id: "mf-birthday-cake-half",
    name: "Birthday Cake",
    variant: "Half Kg",
    price: 534,
    image: chocolateCakeImg,
  },
  {
    id: "mf-birthday-cake-full",
    name: "Birthday Cake (Eggless)",
    variant: "Full Kg",
    price: 1034,
    image: chocolateCakeImg,
  },
  {
    id: "mf-birthday-cake-design",
    name: "Birthday Cake (With Design)",
    price: 1234,
    image: chocolateCakeImg,
  },

  // PATTIES
  { id: "mf-patties-chicken", name: "Patties Chicken", price: 54 },
  { id: "mf-patties-paneer", name: "Patties Paneer", price: 54 },
  { id: "mf-patties-egg", name: "Patties Egg", price: 54 },

  // LOCAL THALI
  { id: "mf-pork-thali", name: "Pork Thali", price: 239, image: msMaaHotelCoverImg },
  { id: "mf-broiler-thali", name: "Broiler Thali", price: 189, image: msMaaHotelCoverImg },
  { id: "mf-local-thali", name: "Local Thali", price: 339, image: msMaaHotelCoverImg },

  // TIBETAN (PORK)
  {
    id: "mf-tibetan-pork-momo-half",
    name: "Tibetan Pork Momo",
    variant: "Half plate",
    price: 114,
    image: momosImg,
  },
  {
    id: "mf-tibetan-pork-momo-full",
    name: "Tibetan Pork Momo",
    variant: "Full plate",
    price: 194,
    image: momosImg,
  },
  {
    id: "mf-tibetan-pork-thukpa-half",
    name: "Tibetan Pork Thukpa",
    variant: "Half plate",
    price: 124,
    image: thukpaImg,
  },
  {
    id: "mf-tibetan-pork-thukpa-full",
    name: "Tibetan Pork Thukpa",
    variant: "Full plate",
    price: 214,
    image: thukpaImg,
  },
  {
    id: "mf-tibetan-pork-chow-half",
    name: "Tibetan Pork Chow Mein",
    variant: "Half plate",
    price: 114,
    image: chowmeinImg,
  },
  {
    id: "mf-tibetan-pork-chow-full",
    name: "Tibetan Pork Chow Mein",
    variant: "Full plate",
    price: 194,
    image: chowmeinImg,
  },
  {
    id: "mf-tibetan-pork-fry-rice-half",
    name: "Tibetan Pork Fry Rice",
    variant: "Half plate",
    price: 124,
    image: friedRiceImg,
  },
  {
    id: "mf-tibetan-pork-fry-rice-full",
    name: "Tibetan Pork Fry Rice",
    variant: "Full plate",
    price: 214,
    image: friedRiceImg,
  },

  // TIBETAN (CHICKEN)
  {
    id: "mf-tibetan-chicken-momo-half",
    name: "Tibetan Chicken Momo",
    variant: "Half plate",
    price: 104,
    image: momosImg,
  },
  {
    id: "mf-tibetan-chicken-momo-full",
    name: "Tibetan Chicken Momo",
    variant: "Full plate",
    price: 174,
    image: momosImg,
  },
  {
    id: "mf-chicken-chow-mein-half",
    name: "Chicken Chow Mein",
    variant: "Half plate",
    price: 104,
    image: chowmeinImg,
  },
  {
    id: "mf-chicken-chow-mein-full",
    name: "Chicken Chow Mein",
    variant: "Full plate",
    price: 174,
    image: chowmeinImg,
  },
  {
    id: "mf-chicken-fry-rice-half",
    name: "Chicken Fry Rice",
    variant: "Half plate",
    price: 114,
    image: friedRiceImg,
  },
  {
    id: "mf-chicken-fry-rice-full",
    name: "Chicken Fry Rice",
    variant: "Full plate",
    price: 194,
    image: friedRiceImg,
  },
  {
    id: "mf-chicken-thukpa-half",
    name: "Chicken Thukpa",
    variant: "Half plate",
    price: 104,
    image: thukpaImg,
  },
  {
    id: "mf-chicken-thukpa-full",
    name: "Chicken Thukpa",
    variant: "Full plate",
    price: 174,
    image: thukpaImg,
  },
  {
    id: "mf-chilly-chicken-half",
    name: "Chilly Chicken",
    variant: "Half plate",
    price: 114,
    image: chilliChickenImg,
  },
  {
    id: "mf-chilly-chicken-full",
    name: "Chilly Chicken",
    variant: "Full plate",
    price: 194,
    image: chilliChickenImg,
  },

  // TIBETAN (MIXED / VEG STYLE)
  {
    id: "mf-tibetan-thukpa-half",
    name: "Tibetan Thukpa",
    variant: "Half plate",
    price: 114,
    image: thukpaImg,
  },
  {
    id: "mf-tibetan-thukpa-full",
    name: "Tibetan Thukpa",
    variant: "Full plate",
    price: 194,
    image: thukpaImg,
  },
  {
    id: "mf-tibetan-chow-mein-half",
    name: "Tibetan Chow Mein",
    variant: "Half plate",
    price: 104,
    image: chowmeinImg,
  },
  {
    id: "mf-tibetan-chow-mein-full",
    name: "Tibetan Chow Mein",
    variant: "Full plate",
    price: 174,
    image: chowmeinImg,
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
    { restaurant: "Gurung Fast Food", items: GURUNG_FAST_FOOD_MENU },
    { restaurant: "Dispy Bakery", items: DISPY_BAKERY_MENU },
    { restaurant: "M.S Maa Hotel", items: MS_MAA_HOTEL_MENU },
    { restaurant: "Montu Fast Food", items: MONTU_FAST_FOOD_MENU },
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
