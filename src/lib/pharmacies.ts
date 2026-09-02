import peguDrugsHouseImg from "@/assets/pegu_drugs_house.jpg";

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
    eta: "15–35 min",
    fulfillment: "Doorstep",
  },
];
