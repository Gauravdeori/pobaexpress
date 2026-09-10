/**
 * Poba Express price list. Item prices are in rupees and exclude delivery;
 * delivery is charged once per order, not per item.
 */

/** Delivery fee per order, by category. */
const DELIVERY_FEES: Record<string, number> = {
  food: 30,
  cake: 30,
  medicine: 30,
};

const DEFAULT_DELIVERY_FEE = 30;

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
import urbanCafeCoverImg from "@/assets/urban_cafe_cover.jpg";

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
    price: 103,
    image: friedRiceImg,
  },
  {
    id: "pr-veg-fried-rice-full",
    name: "Veg Fried Rice",
    variant: "Full plate",
    price: 159,
    image: friedRiceImg,
  },
  {
    id: "pr-egg-fried-rice-half",
    name: "Egg Fried Rice",
    variant: "Half plate",
    price: 113,
    image: friedRiceImg,
  },
  {
    id: "pr-egg-fried-rice-full",
    name: "Egg Fried Rice",
    variant: "Full plate",
    price: 179,
    image: friedRiceImg,
  },
  {
    id: "pr-chicken-fried-rice-half",
    name: "Chicken Fried Rice",
    variant: "Half plate",
    price: 113,
    image: friedRiceImg,
  },
  {
    id: "pr-chicken-fried-rice-full",
    name: "Chicken Fried Rice",
    variant: "Full plate",
    price: 179,
    image: friedRiceImg,
  },
  {
    id: "pr-mix-fried-rice-half",
    name: "Mix Fried Rice",
    variant: "Half plate",
    price: 133,
    image: friedRiceImg,
  },
  {
    id: "pr-mix-fried-rice-full",
    name: "Mix Fried Rice",
    variant: "Full plate",
    price: 219,
    image: friedRiceImg,
  },

  // NOODLES
  {
    id: "pr-veg-chowmein-half",
    name: "Veg Chowmein",
    variant: "Half plate",
    price: 103,
    image: chowmeinImg,
  },
  {
    id: "pr-veg-chowmein-full",
    name: "Veg Chowmein",
    variant: "Full plate",
    price: 159,
    image: chowmeinImg,
  },
  {
    id: "pr-chicken-chow-half",
    name: "Chicken Chow",
    variant: "Half plate",
    price: 113,
    image: chowmeinImg,
  },
  {
    id: "pr-chicken-chow-full",
    name: "Chicken Chow",
    variant: "Full plate",
    price: 179,
    image: chowmeinImg,
  },
  {
    id: "pr-egg-chow-half",
    name: "Egg Chow",
    variant: "Half plate",
    price: 113,
    image: chowmeinImg,
  },
  {
    id: "pr-egg-chow-full",
    name: "Egg Chow",
    variant: "Full plate",
    price: 179,
    image: chowmeinImg,
  },
  {
    id: "pr-mix-chow-half",
    name: "Mix Chow",
    variant: "Half plate",
    price: 133,
    image: chowmeinImg,
  },
  {
    id: "pr-mix-chow-full",
    name: "Mix Chow",
    variant: "Full plate",
    price: 219,
    image: chowmeinImg,
  },

  // ROLL
  { id: "pr-veg-roll-half", name: "Veg Roll", variant: "Half plate", price: 103, image: rollImg },
  { id: "pr-veg-roll-full", name: "Veg Roll", variant: "Full plate", price: 159, image: rollImg },
  {
    id: "pr-chicken-roll-half",
    name: "Chicken Roll",
    variant: "Half plate",
    price: 123,
    image: rollImg,
  },
  {
    id: "pr-chicken-roll-full",
    name: "Chicken Roll",
    variant: "Full plate",
    price: 199,
    image: rollImg,
  },
  { id: "pr-egg-roll-half", name: "Egg Roll", variant: "Half plate", price: 113, image: rollImg },
  { id: "pr-egg-roll-full", name: "Egg Roll", variant: "Full plate", price: 184, image: rollImg },

  // EXTRAS
  {
    id: "pr-french-fries-half",
    name: "French Fries",
    variant: "Half plate",
    price: 93,
    image: frenchFriesImg,
  },
  {
    id: "pr-french-fries-full",
    name: "French Fries",
    variant: "Full plate",
    price: 139,
    image: frenchFriesImg,
  },
  { id: "pr-pasta-half", name: "Pasta", variant: "Half plate", price: 123, image: pastaImg },
  { id: "pr-pasta-full", name: "Pasta", variant: "Full plate", price: 199, image: pastaImg },
  { id: "pr-maggi-half", name: "Maggi", variant: "Half plate", price: 73, image: maggiImg },
  { id: "pr-maggi-full", name: "Maggi", variant: "Full plate", price: 139, image: maggiImg },

  // CHICKEN & MOMO
  {
    id: "pr-chicken-lollipop-half",
    name: "Chicken Lollipop",
    variant: "Half plate",
    price: 143,
    image: lollipopImg,
  },
  {
    id: "pr-chicken-lollipop-full",
    name: "Chicken Lollipop",
    variant: "Full plate",
    price: 247,
    image: lollipopImg,
  },
  {
    id: "pr-chilli-chicken-half",
    name: "Chilli Chicken",
    variant: "Half plate",
    price: 183,
    image: chilliChickenImg,
  },
  {
    id: "pr-chilli-chicken-full",
    name: "Chilli Chicken",
    variant: "Full plate",
    price: 327,
    image: chilliChickenImg,
  },
  {
    id: "pr-chicken-dry-fry-half",
    name: "Chicken Dry Fry",
    variant: "Half plate",
    price: 143,
    image: chilliChickenImg,
  },
  {
    id: "pr-chicken-dry-fry-full",
    name: "Chicken Dry Fry",
    variant: "Full plate",
    price: 247,
    image: chilliChickenImg,
  },
  {
    id: "pr-steam-momo-half",
    name: "Steam Momo",
    variant: "Half plate",
    price: 113,
    image: momosImg,
  },
  {
    id: "pr-steam-momo-full",
    name: "Steam Momo",
    variant: "Full plate",
    price: 187,
    image: momosImg,
  },
  { id: "pr-fry-momo-half", name: "Fry Momo", variant: "Half plate", price: 133, image: momosImg },
  { id: "pr-fry-momo-full", name: "Fry Momo", variant: "Full plate", price: 227, image: momosImg },

  // BIRYANI
  {
    id: "pr-biryani-chicken-half",
    name: "Biryani Chicken",
    variant: "Half plate",
    price: 166,
    image: biryaniImg,
  },
  {
    id: "pr-biryani-chicken-full",
    name: "Biryani Chicken",
    variant: "Full plate",
    price: 286,
    image: biryaniImg,
  },
];

export const GURUNG_FAST_FOOD_MENU: MenuItem[] = [
  {
    id: "gf-chicken-chowmein-half",
    name: "Chicken Chowmein",
    variant: "Half plate",
    price: 89,
    image: chowmeinImg,
  },
  {
    id: "gf-chicken-chowmein-full",
    name: "Chicken Chowmein",
    variant: "Full plate",
    price: 139,
    image: chowmeinImg,
  },
  {
    id: "gf-chicken-lollipop-1",
    name: "Chicken Lollipop",
    variant: "1 piece",
    price: 59,
    image: lollipopImg,
  },
  {
    id: "gf-chicken-lollipop-4",
    name: "Chicken Lollipop",
    variant: "4 pieces",
    price: 139,
    image: lollipopImg,
  },
  {
    id: "gf-veg-momo-half",
    name: "Veg Momo",
    variant: "Half plate · 8 pieces",
    price: 89,
    image: momosImg,
  },
  {
    id: "gf-veg-momo-full",
    name: "Veg Momo",
    variant: "Full plate · 16 pieces",
    price: 139,
    image: momosImg,
  },
  {
    id: "gf-fried-rice-half",
    name: "Fried Rice",
    variant: "Half plate",
    price: 89,
    image: friedRiceImg,
  },
  {
    id: "gf-fried-rice-full",
    name: "Fried Rice",
    variant: "Full plate",
    price: 139,
    image: friedRiceImg,
  },
  {
    id: "gf-chilli-chicken-half",
    name: "Chilli Chicken",
    variant: "Half plate",
    price: 89,
    image: chilliChickenImg,
  },
  {
    id: "gf-chilli-chicken-full",
    name: "Chilli Chicken",
    variant: "Full plate",
    price: 139,
    image: chilliChickenImg,
  },
  {
    id: "gf-biryani-chicken-full",
    name: "Biryani Chicken",
    variant: "Full plate",
    price: 159,
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
    price: 219,
    image: pizzaImg,
  },
  {
    id: "dp-veg-cheese-medium",
    name: "Veg Cheese Pizza",
    variant: "Medium",
    price: 289,
    image: pizzaImg,
  },
  {
    id: "dp-veg-cheese-large",
    name: "Veg Cheese Pizza",
    variant: "Large",
    price: 399,
    image: pizzaImg,
  },
  {
    id: "dp-sweetcorn-regular",
    name: "Sweetcorn Pizza",
    variant: "Regular",
    price: 229,
    image: pizzaImg,
  },
  {
    id: "dp-sweetcorn-medium",
    name: "Sweetcorn Pizza",
    variant: "Medium",
    price: 309,
    image: pizzaImg,
  },
  {
    id: "dp-sweetcorn-large",
    name: "Sweetcorn Pizza",
    variant: "Large",
    price: 439,
    image: pizzaImg,
  },
  {
    id: "dp-paneer-regular",
    name: "Paneer Pizza",
    variant: "Regular",
    price: 239,
    image: pizzaImg,
  },
  { id: "dp-paneer-medium", name: "Paneer Pizza", variant: "Medium", price: 329, image: pizzaImg },
  { id: "dp-paneer-large", name: "Paneer Pizza", variant: "Large", price: 459, image: pizzaImg },
  {
    id: "dp-chicken-regular",
    name: "Chicken Pizza",
    variant: "Regular",
    price: 249,
    image: pizzaImg,
  },
  {
    id: "dp-chicken-medium",
    name: "Chicken Pizza",
    variant: "Medium",
    price: 359,
    image: pizzaImg,
  },
  { id: "dp-chicken-large", name: "Chicken Pizza", variant: "Large", price: 509, image: pizzaImg },
];

export const BIRIYANI_CORNER_MENU: MenuItem[] = [
  {
    id: "bc-biriyani-half",
    name: "Biryani (Chicken with egg)",
    variant: "Half plate",
    price: 139,
    image: bcBiriyaniImg,
  },
  {
    id: "bc-biriyani-full",
    name: "Biryani (Chicken with egg)",
    variant: "Full plate",
    price: 249,
    image: bcBiriyaniImg,
  },
  { id: "bc-anda-magaz", name: "Anda Magaz", price: 89, image: bcAndaMagazImg },
  { id: "bc-spa-roll", name: "Spa Roll", price: 89, image: bcSpaRollImg },
  {
    id: "bc-chowmin-half",
    name: "Chowmin",
    variant: "Half plate",
    price: 79,
    image: bcChowminImg,
  },
  {
    id: "bc-chowmin-full",
    name: "Chowmin",
    variant: "Full plate",
    price: 149,
    image: bcChowminImg,
  },
  { id: "bc-maggie", name: "Maggie", price: 59, image: bcMaggieImg },
];

export const DCAKERY_MENU: MenuItem[] = [
  { id: "dc-chocolate", name: "Chocolate Cake", price: 659, image: chocolateCakeImg },
  { id: "dc-black-forest", name: "Black Forest Cake", price: 559, image: chocolateCakeImg },
  { id: "dc-butterscotch", name: "Butterscotch Cake", price: 509, image: butterscotchCakeImg },
  { id: "dc-vanilla", name: "Vanilla Cake", price: 459, image: newYorkCheesecakeImg },
  {
    id: "dc-japanese-cheesecake",
    name: "Japanese Cheesecake",
    price: 759,
    image: japaneseCheesecakeImg,
  },
  {
    id: "dc-new-york-cheesecake",
    name: "New York Cheesecake",
    price: 759,
    image: newYorkCheesecakeImg,
  },
  {
    id: "dc-blueberry-cheesecake",
    name: "Blueberry Cheesecake",
    price: 859,
    image: blueberryCheesecakeImg,
  },
  {
    id: "dc-burnt-basque-cheesecake",
    name: "Burnt Basque Cheesecake",
    price: 759,
    image: burntBasqueCheesecakeImg,
  },
  { id: "dc-rice-cake-loaf", name: "Rice Cake Loaf", price: 310, image: carrotCakeImg },
  { id: "dc-millet-cake-loaf", name: "Millet Cake Loaf", price: 340, image: milletCakeLoafImg },
  {
    id: "dc-tiramisu-mini-tub",
    name: "Tiramisu",
    variant: "Mini tub",
    price: 250,
    image: tiramisuImg,
  },
];

export const MS_MAA_HOTEL_MENU: MenuItem[] = [
  // RICE
  { id: "mm-veg-thali", name: "Veg Thali", price: 109, image: msMaaHotelCoverImg },
  { id: "mm-pork-thali", name: "Pork Thali", price: 159, image: msMaaHotelCoverImg },
  { id: "mm-chicken-thali", name: "Chicken Thali", price: 189, image: msMaaHotelCoverImg },
  { id: "mm-fish-thali", name: "Fish Thali", price: 189, image: msMaaHotelCoverImg },

  // ROTI / NUN
  { id: "mm-roti-thali", name: "Roti Thali", price: 89 },
  { id: "mm-puri-thali", name: "Puri Thali", price: 89 },

  // NON-VEG STARTERS
  { id: "mm-egg-omelette", name: "Egg Omelette", price: 49 },
  { id: "mm-egg-pouch", name: "Egg Pouch", price: 49 },

  // NON-VEG MAIN COURSE
  { id: "mm-handi-mutton-half", name: "Handi Mutton", variant: "Half plate", price: 239 },
  { id: "mm-handi-mutton-full", name: "Handi Mutton", variant: "Full plate", price: 439 },
  { id: "mm-handi-chicken-half", name: "Handi Chicken", variant: "Half plate", price: 189 },
  { id: "mm-handi-chicken-full", name: "Handi Chicken", variant: "Full plate", price: 339 },
  { id: "mm-boiled-local-chicken", name: "Boiled Local Chicken with Bamboo Shoots", price: 289 },
  { id: "mm-til-gahori-half", name: "Til Gahori", variant: "Half plate", price: 139 },
  { id: "mm-til-gahori-full", name: "Til Gahori", variant: "Full plate", price: 239 },
  { id: "mm-kochot-gahori-half", name: "Kochot Gahori", variant: "Half plate", price: 139 },
  { id: "mm-kochot-gahori-full", name: "Kochot Gahori", variant: "Full plate", price: 239 },
];

export const MONTU_FAST_FOOD_MENU: MenuItem[] = [
  // PIZZA
  { id: "mf-pizza-veg", name: "Pizza Veg", price: 224, image: pizzaImg },
  { id: "mf-chicken-pizza", name: "Chicken Pizza", price: 244, image: pizzaImg },

  // ROLL
  { id: "mf-chicken-roll", name: "Chicken Roll", price: 94, image: rollImg },

  // BURGER
  { id: "mf-burger-chicken", name: "Burger Chicken", price: 194, image: burgerImg },
  { id: "mf-burger-veg", name: "Burger Veg", price: 144, image: burgerImg },

  // READYMADE CAKE
  {
    id: "mf-readymade-cake-half",
    name: "Black forest cake",
    variant: "Readymade cake, half kg",
    price: 466,
    image: chocolateCakeImg,
  },
  {
    id: "mf-readymade-cake-full",
    name: "Black forest cake",
    variant: "Readymade cake, 1kg",
    price: 966,
    image: chocolateCakeImg,
  },

  // BIRTHDAY CAKE
  {
    id: "mf-birthday-cake-half",
    name: "Birthday Cake",
    variant: "Half Kg",
    price: 544,
    image: chocolateCakeImg,
  },
  {
    id: "mf-birthday-cake-full",
    name: "Birthday Cake (Eggless)",
    variant: "Full Kg",
    price: 1044,
    image: chocolateCakeImg,
  },
  {
    id: "mf-birthday-cake-design",
    name: "Birthday Cake (With Design)",
    price: 1244,
    image: chocolateCakeImg,
  },

  // PATTIES
  { id: "mf-patties-chicken", name: "Patties Chicken", price: 64 },
  { id: "mf-patties-paneer", name: "Patties Paneer", price: 64 },
  { id: "mf-patties-egg", name: "Patties Egg", price: 64 },

  // LOCAL THALI
  { id: "mf-pork-thali", name: "Pork Thali", price: 249, image: msMaaHotelCoverImg },
  { id: "mf-broiler-thali", name: "Broiler Thali", price: 199, image: msMaaHotelCoverImg },
  { id: "mf-local-thali", name: "Local Thali", price: 349, image: msMaaHotelCoverImg },

  // TIBETAN (PORK)
  {
    id: "mf-tibetan-pork-momo-half",
    name: "Tibetan Pork Momo",
    variant: "Half plate",
    price: 124,
    image: momosImg,
  },
  {
    id: "mf-tibetan-pork-momo-full",
    name: "Tibetan Pork Momo",
    variant: "Full plate",
    price: 204,
    image: momosImg,
  },
  {
    id: "mf-tibetan-pork-thukpa-half",
    name: "Tibetan Pork Thukpa",
    variant: "Half plate",
    price: 134,
    image: thukpaImg,
  },
  {
    id: "mf-tibetan-pork-thukpa-full",
    name: "Tibetan Pork Thukpa",
    variant: "Full plate",
    price: 224,
    image: thukpaImg,
  },
  {
    id: "mf-tibetan-pork-chow-half",
    name: "Tibetan Pork Chow Mein",
    variant: "Half plate",
    price: 124,
    image: chowmeinImg,
  },
  {
    id: "mf-tibetan-pork-chow-full",
    name: "Tibetan Pork Chow Mein",
    variant: "Full plate",
    price: 204,
    image: chowmeinImg,
  },
  {
    id: "mf-tibetan-pork-fry-rice-half",
    name: "Tibetan Pork Fry Rice",
    variant: "Half plate",
    price: 134,
    image: friedRiceImg,
  },
  {
    id: "mf-tibetan-pork-fry-rice-full",
    name: "Tibetan Pork Fry Rice",
    variant: "Full plate",
    price: 224,
    image: friedRiceImg,
  },

  // TIBETAN (CHICKEN)
  {
    id: "mf-tibetan-chicken-momo-half",
    name: "Tibetan Chicken Momo",
    variant: "Half plate",
    price: 114,
    image: momosImg,
  },
  {
    id: "mf-tibetan-chicken-momo-full",
    name: "Tibetan Chicken Momo",
    variant: "Full plate",
    price: 184,
    image: momosImg,
  },
  {
    id: "mf-chicken-chow-mein-half",
    name: "Chicken Chow Mein",
    variant: "Half plate",
    price: 114,
    image: chowmeinImg,
  },
  {
    id: "mf-chicken-chow-mein-full",
    name: "Chicken Chow Mein",
    variant: "Full plate",
    price: 184,
    image: chowmeinImg,
  },
  {
    id: "mf-chicken-fry-rice-half",
    name: "Chicken Fry Rice",
    variant: "Half plate",
    price: 124,
    image: friedRiceImg,
  },
  {
    id: "mf-chicken-fry-rice-full",
    name: "Chicken Fry Rice",
    variant: "Full plate",
    price: 204,
    image: friedRiceImg,
  },
  {
    id: "mf-chicken-thukpa-half",
    name: "Chicken Thukpa",
    variant: "Half plate",
    price: 114,
    image: thukpaImg,
  },
  {
    id: "mf-chicken-thukpa-full",
    name: "Chicken Thukpa",
    variant: "Full plate",
    price: 184,
    image: thukpaImg,
  },
  {
    id: "mf-chilly-chicken-half",
    name: "Chilly Chicken",
    variant: "Half plate",
    price: 124,
    image: chilliChickenImg,
  },
  {
    id: "mf-chilly-chicken-full",
    name: "Chilly Chicken",
    variant: "Full plate",
    price: 204,
    image: chilliChickenImg,
  },

  // TIBETAN (MIXED / VEG STYLE)
  {
    id: "mf-tibetan-thukpa-half",
    name: "Tibetan Thukpa",
    variant: "Half plate",
    price: 124,
    image: thukpaImg,
  },
  {
    id: "mf-tibetan-thukpa-full",
    name: "Tibetan Thukpa",
    variant: "Full plate",
    price: 204,
    image: thukpaImg,
  },
  {
    id: "mf-tibetan-chow-mein-half",
    name: "Tibetan Chow Mein",
    variant: "Half plate",
    price: 114,
    image: chowmeinImg,
  },
  {
    id: "mf-tibetan-chow-mein-full",
    name: "Tibetan Chow Mein",
    variant: "Full plate",
    price: 184,
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

export const URBAN_CAFE_MENU: MenuItem[] = [
  // Sea Exotics
  {
    id: "uc-lava-glazed-octopus",
    name: "Lava Glazed Octopus",
    price: 379,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-sizzling-hot-garlic-octopus",
    name: "Sizzling Hot Garlic Octopus",
    price: 409,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-schezwan-fire-prawn",
    name: "Schezwan Fire Prawn",
    price: 359,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-spiced-hot-garlic-prawn",
    name: "Spiced Hot Garlic Prawn",
    price: 369,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-wok-tossed-spicy-squid",
    name: "Wok-Tossed Spicy Squid",
    price: 359,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-wok-tossed-hot-garlic-squid",
    name: "Wok-Tossed Hot Garlic Squid",
    price: 379,
    image: urbanCafeCoverImg,
  },

  // Biryani
  { id: "uc-chicken-dum-biryani", name: "Chicken Dum Biryani", price: 249, image: biryaniImg },
  { id: "uc-chicken-shahi-biryani", name: "Chicken Shahi Biryani", price: 259, image: biryaniImg },

  // Rich Indian Gravies
  {
    id: "uc-butter-chicken-masala-gravy",
    name: "Butter Chicken Masala Gravy",
    price: 260,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-karahi-chicken-gravy",
    name: "Karahi Chicken Gravy",
    price: 260,
    image: urbanCafeCoverImg,
  },
  { id: "uc-chicken-do-pyaza", name: "Chicken Do Pyaza", price: 260, image: urbanCafeCoverImg },
  {
    id: "uc-paneer-butter-masala",
    name: "Paneer Butter Masala",
    price: 260,
    image: urbanCafeCoverImg,
  },

  // Starter Veg
  {
    id: "uc-classic-french-fries",
    name: "Classic French Fries",
    price: 150,
    image: frenchFriesImg,
  },
  {
    id: "uc-peri-peri-french-fries",
    name: "Peri Peri French Fries",
    price: 170,
    image: frenchFriesImg,
  },
  {
    id: "uc-honey-chilli-potato",
    name: "Honey Chilli Potato",
    price: 170,
    image: urbanCafeCoverImg,
  },
  { id: "uc-veg-manchurian", name: "Veg Manchurian", price: 190, image: urbanCafeCoverImg },
  {
    id: "uc-honey-chilli-baby-corn",
    name: "Honey Chilli Baby Corn",
    price: 190,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-crispy-chilli-baby-corn",
    name: "Crispy Chilli Baby Corn",
    price: 190,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-crackling-corn",
    name: "Crackling Corn",
    variant: "New",
    price: 190,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-american-corn-salt-pepper",
    name: "American (Corn Salt & Pepper)",
    variant: "New",
    price: 200,
    image: urbanCafeCoverImg,
  },
  { id: "uc-paneer-65", name: "Paneer 65", price: 200, image: urbanCafeCoverImg },
  { id: "uc-chilli-paneer", name: "Chilli Paneer", price: 200, image: urbanCafeCoverImg },
  {
    id: "uc-schezwan-panner",
    name: "Schezwan Panner",
    variant: "New",
    price: 210,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-panner-pakoda",
    name: "Panner Pakoda",
    variant: "New",
    price: 210,
    image: urbanCafeCoverImg,
  },
  { id: "uc-chili-mushroom", name: "Chili Mushroom", price: 200, image: chilliMushroomImg },
  {
    id: "uc-mushroom-manchurian",
    name: "Mushroom Manchurian",
    price: 200,
    image: chilliMushroomImg,
  },
  {
    id: "uc-crispy-chilli-mushroom",
    name: "Crispy Chilli Mushroom",
    price: 210,
    image: chilliMushroomImg,
  },
  { id: "uc-shanghai-mushroom", name: "Shanghai Mushroom", price: 230, image: chilliMushroomImg },

  // Starter Chicken
  {
    id: "uc-honey-chilli-chicken",
    name: "Honey Chilli Chicken",
    price: 190,
    image: chilliChickenImg,
  },
  { id: "uc-chicken-manchurian", name: "Chicken Manchurian", price: 190, image: chilliChickenImg },
  { id: "uc-chicken-65", name: "Chicken 65", price: 200, image: chilliChickenImg },
  {
    id: "uc-chicken-popcorn",
    name: "Chicken Popcorn",
    variant: "New",
    price: 200,
    image: urbanCafeCoverImg,
  },
  { id: "uc-chilli-chicken", name: "Chilli Chicken", price: 200, image: chilliChickenImg },
  {
    id: "uc-dragon-chicken",
    name: "Dragon Chicken",
    variant: "New",
    price: 230,
    image: chilliChickenImg,
  },
  { id: "uc-chicken-nuggets", name: "Chicken Nuggets", price: 230, image: urbanCafeCoverImg },
  {
    id: "uc-chicken-lime-winglet",
    name: "Chicken Lime Winglet",
    variant: "New",
    price: 240,
    image: urbanCafeCoverImg,
  },
  { id: "uc-thai-hot-wings", name: "Thai Hot Wings", price: 230, image: urbanCafeCoverImg },
  { id: "uc-drums-of-heaven", name: "Drums of Heaven", price: 250, image: urbanCafeCoverImg },
  {
    id: "uc-crispy-chicken-honey-toast",
    name: "Crispy Chicken Honey Toast",
    variant: "New",
    price: 260,
    image: urbanCafeCoverImg,
  },
  { id: "uc-chicken-lollipop", name: "Chicken Lollipop", price: 270, image: lollipopImg },
  {
    id: "uc-barbeque-chicken-wings",
    name: "Barbeque Chicken Wings",
    variant: "New",
    price: 300,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-crispy-chicken-wings",
    name: "Crispy Chicken Wings",
    variant: "New",
    price: 300,
    image: urbanCafeCoverImg,
  },

  // Super Bowl
  {
    id: "uc-hot-garlic-chicken-bowl",
    name: "Hot Garlic Chicken Bowl",
    variant: "Rice/Noodles",
    price: 230,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-chili-chicken-bowl",
    name: "Chili Chicken Bowl",
    variant: "Rice/Noodles",
    price: 250,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-veg-manchurian-bowl",
    name: "Veg Manchurian Bowl",
    variant: "Rice/Noodles",
    price: 230,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-paneer-gravy-bowl",
    name: "Paneer Gravy Bowl",
    variant: "Rice/Noodles",
    price: 250,
    image: urbanCafeCoverImg,
  },

  // Soup
  {
    id: "uc-hot-sour-soup-chicken",
    name: "Hot & Sour Soup",
    variant: "Chicken",
    price: 110,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-manchow-soup-chicken",
    name: "Manchow Soup",
    variant: "Chicken",
    price: 130,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-lemon-coriander-soup-chicken",
    name: "Lemon Coriander Soup",
    variant: "Chicken",
    price: 140,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-hot-sour-soup-veg",
    name: "Hot & Sour Soup",
    variant: "Veg",
    price: 100,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-manchow-soup-veg",
    name: "Manchow Soup",
    variant: "Veg",
    price: 120,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-lemon-coriander-soup-veg",
    name: "Lemon Coriander Soup",
    variant: "Veg",
    price: 130,
    image: urbanCafeCoverImg,
  },

  // Momo
  {
    id: "uc-darjeeling-steamed-momo-chicken",
    name: "Darjeeling Steamed Momo Chicken",
    variant: "6 Pieces",
    price: 110,
    image: momosImg,
  },
  {
    id: "uc-chicken-fried-momo",
    name: "Chicken Fried Momo",
    variant: "6 Pieces",
    price: 130,
    image: momosImg,
  },
  {
    id: "uc-chicken-schezwan-momo",
    name: "Chicken Schezwan Momo",
    variant: "New · 6 Pieces",
    price: 140,
    image: momosImg,
  },
  {
    id: "uc-chicken-pan-fried-momo",
    name: "Chicken Pan Fried Momo",
    variant: "New · 6 Pieces",
    price: 160,
    image: momosImg,
  },

  // Noodles
  { id: "uc-veg-noodles", name: "Veg Noodles", price: 100, image: chowmeinImg },
  { id: "uc-egg-noodles", name: "Egg Noodles", price: 100, image: chowmeinImg },
  {
    id: "uc-chicken-egg-mix-noodles",
    name: "Chicken and Egg Mix Noodles",
    price: 110,
    image: chowmeinImg,
  },
  { id: "uc-hakka-noodles", name: "Hakka Noodles", price: 140, image: chowmeinImg },
  { id: "uc-chicken-thukpa", name: "Chicken Thukpa", price: 150, image: thukpaImg },
  { id: "uc-pan-fried-noodles", name: "Pan Fried Noodles", price: 190, image: chowmeinImg },

  // Rice
  { id: "uc-veg-fried-rice", name: "Veg Fried rice", price: 100, image: friedRiceImg },
  {
    id: "uc-chicken-egg-fried-rice",
    name: "Chicken and Egg Fried Rice",
    price: 110,
    image: friedRiceImg,
  },
  { id: "uc-paneer-fried-rice", name: "Paneer Fried Rice", price: 140, image: friedRiceImg },
  {
    id: "uc-chili-garlic-chicken-fried-rice",
    name: "Chili Garlic Chicken Fried Rice",
    price: 140,
    image: friedRiceImg,
  },
  {
    id: "uc-chicken-schezwan-fried-rice",
    name: "Chicken Schezwan Fried Rice",
    price: 150,
    image: friedRiceImg,
  },
  {
    id: "uc-mix-wonton-fried-rice",
    name: "Mix Wonton Fried Rice",
    variant: "New",
    price: 160,
    image: friedRiceImg,
  },
  {
    id: "uc-chicken-boxer-fried-rice",
    name: "Chicken boxer Fried Rice",
    variant: "New",
    price: 200,
    image: friedRiceImg,
  },
  {
    id: "uc-chicken-triple-fried-rice",
    name: "Chicken triple Fried Rice",
    variant: "New",
    price: 240,
    image: friedRiceImg,
  },

  // Gravy
  {
    id: "uc-veg-manchurian-gravy",
    name: "Veg Manchurian Gravy",
    price: 160,
    image: urbanCafeCoverImg,
  },
  { id: "uc-chili-paneer-gravy", name: "Chili Paneer Gravy", price: 160, image: urbanCafeCoverImg },
  {
    id: "uc-chili-chicken-gravy",
    name: "Chili Chicken Gravy",
    price: 180,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-chicken-manchurian-gravy",
    name: "Chicken Manchurian Gravy",
    price: 190,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-shanghai-chicken-gravy",
    name: "Shanghai Chicken Gravy",
    variant: "New",
    price: 200,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-kung-pao-chicken-gravy",
    name: "Kung Pao Chicken Gravy",
    variant: "New",
    price: 210,
    image: urbanCafeCoverImg,
  },

  // Pizza
  { id: "uc-juicy-veg-pizza", name: "Juicy Veg Pizza", price: 270, image: pizzaImg },
  {
    id: "uc-grilled-pizza",
    name: "Grilled Pizza",
    variant: "Chicken/Paneer",
    price: 300,
    image: pizzaImg,
  },
  {
    id: "uc-classic-pizza",
    name: "Classic Pizza",
    variant: "Chicken/Paneer",
    price: 310,
    image: pizzaImg,
  },
  {
    id: "uc-tawa-mix-chicken-pizza",
    name: "Tawa Mix Chicken Pizza",
    variant: "Chicken/Paneer",
    price: 330,
    image: pizzaImg,
  },
  {
    id: "uc-farm-house-pizza",
    name: "Farm House Pizza",
    variant: "Chicken/Paneer",
    price: 330,
    image: pizzaImg,
  },
  {
    id: "uc-urban-cafe-special-pizza",
    name: "Urban Cafe Special Pizza",
    variant: "Chicken/Paneer",
    price: 360,
    image: pizzaImg,
  },

  // Wrap
  {
    id: "uc-tortilla-veg-paneer-wrap",
    name: "Tortilla Veg Paneer Wrap",
    price: 140,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-grilled-chicken-wrap",
    name: "Grilled Chicken Wrap",
    price: 160,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-crispy-chicken-wrap",
    name: "Crispy Chicken Wrap",
    price: 170,
    image: urbanCafeCoverImg,
  },
  {
    id: "uc-cheesy-double-chicken-wrap",
    name: "Cheesy Double Chicken Wrap",
    variant: "New",
    price: 190,
    image: urbanCafeCoverImg,
  },

  // Burger
  { id: "uc-veg-burger", name: "Veg Burger", price: 160, image: burgerImg },
  {
    id: "uc-mexican-burger",
    name: "Mexican Burger",
    variant: "Chicken/Paneer",
    price: 180,
    image: burgerImg,
  },
  {
    id: "uc-bbq-grilled-burger",
    name: "BBQ Grilled Burger",
    variant: "Chicken/Paneer",
    price: 200,
    image: burgerImg,
  },
  {
    id: "uc-double-cheese-burger",
    name: "Double Cheese Burger",
    variant: "New · Chicken/Paneer",
    price: 210,
    image: burgerImg,
  },
];
