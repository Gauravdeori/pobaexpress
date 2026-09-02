import peguDrugsHouseImg from "@/assets/pegu_drugs_house.jpg";
import doleyPharmacyImg from "@/assets/doley_pharmacy.jpg";

export type Pharmacy = {
  slug: string;
  name: string;
  rating: number;
  categoryLine1: string;
  categoryLine2: string;
  image: string;
  eta: string;
  fulfillment: string;
};

export const PHARMACIES: Pharmacy[] = [
  {
    slug: "pegu-drugs-house",
    name: "Pegu Drugs House",
    rating: 4.6,
    categoryLine1: "Medicines · Wellness",
    categoryLine2: "Health Essentials",
    image: peguDrugsHouseImg,
    eta: "15–25 min",
    fulfillment: "Doorstep",
  },
  {
    slug: "doley-pharmacy",
    name: "Doley Pharmacy",
    rating: 4.4,
    categoryLine1: "Medicines · Healthcare",
    categoryLine2: "Daily Essentials",
    image: doleyPharmacyImg,
    eta: "15–25 min",
    fulfillment: "Doorstep",
  },
];
