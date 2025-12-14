// data/raw/pacsun.ts

import type { RawProduct } from "@/types/rawProduct";

export const pacsunRaw: RawProduct[] = [
  {
    id: "tee-701",
    name: "PacSun LA Graphic Tee",
    brand: "PacSun",
    description: "Soft cotton graphic tee with LA front print.",
    imageUrl: "https://example.com/pacsun-tee-701.jpg",
    productUrl: "https://www.pacsun.com/la-graphic-tee",
    price: 32.95,
    currency: "USD",
    gender: "Men",
    categoryPath: "Men > Graphic Tees",
    colors: ["White"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["graphic", "streetwear"],
    popularityScore: 90,
  },
  {
    id: "cargo-705",
    name: "Baggy Carpenter Pants",
    brand: "PacSun",
    description: "Baggy fit carpenter pants with utility pockets.",
    imageUrl: "https://example.com/pacsun-cargo-705.jpg",
    productUrl: "https://www.pacsun.com/baggy-carpenter-pants",
    price: 69.95,
    currency: "USD",
    gender: "Men",
    categoryPath: "Men > Pants",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["baggy", "streetwear"],
    popularityScore: 88,
  },
];
