// data/raw/uniqlo.ts

import type { RawProduct } from "@/types/rawProduct";

export const uniqloRaw: RawProduct[] = [
  {
    id: "sweat-501",
    name: "U Crew Neck Sweatshirt",
    brand: "Uniqlo U",
    description: "Premium heavyweight crew neck sweatshirt with a boxy fit.",
    imageUrl: "https://example.com/uniqlo-sweat-501.jpg",
    productUrl: "https://www.uniqlo.com/u-crew-neck-sweatshirt",
    price: 49.9,
    currency: "USD",
    gender: "Men",
    categoryPath: "Men > Sweatshirts",
    colors: ["Grey"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["minimal", "basic"],
    popularityScore: 65,
  },
  {
    id: "tee-505",
    name: "U Airism Cotton Oversized T-Shirt",
    brand: "Uniqlo",
    description: "Oversized Airism cotton tee with smooth feel.",
    imageUrl: "https://example.com/uniqlo-tee-505.jpg",
    productUrl: "https://www.uniqlo.com/u-airism-oversized-tee",
    price: 19.9,
    currency: "USD",
    gender: "Men",
    categoryPath: "Men > T-shirts",
    colors: ["Navy"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["oversized", "basic"],
    popularityScore: 78,
  },
];
