// data/raw/zara.ts

import type { RawProduct } from "@/types/rawProduct";

export const zaraRaw: RawProduct[] = [
  {
    id: "cargo-201",
    name: "Relaxed Fit Cargo Pants",
    brand: "ZARA",
    description: "Relaxed fit straight-leg cargo pants with side flap pockets.",
    imageUrl: "https://example.com/zara-cargo-201.jpg",
    productUrl: "https://www.zara.com/relaxed-fit-cargo-pants",
    price: 59.9,
    currency: "USD",
    gender: "Men",
    categoryPath: "Man > Trousers > Cargo",
    colors: ["Olive"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["cargo", "streetwear"],
    popularityScore: 85,
  },
  {
    id: "denim-204",
    name: "Loose Fit Wide Leg Jeans",
    brand: "Zara",
    description: "Wide-leg jeans with a relaxed fit through the thigh.",
    imageUrl: "https://example.com/zara-jeans-204.jpg",
    productUrl: "https://www.zara.com/loose-fit-jeans",
    price: 69.9,
    currency: "USD",
    gender: "Men",
    categoryPath: "Man > Jeans",
    colors: ["Blue"],
    sizes: ["30x30", "32x30", "32x32", "34x32"],
    tags: ["denim", "loose"],
    popularityScore: 70,
  },
];
