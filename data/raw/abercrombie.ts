// data/raw/abercrombie.ts

import type { RawProduct } from "@/types/rawProduct";

export const abercrombieRaw: RawProduct[] = [
  {
    id: "hoodie-101",
    name: "Essential Fleece Hoodie",
    brand: "ABERCROMBIE & FITCH",
    description: "Relaxed fit fleece hoodie with kangaroo pocket.",
    imageUrl: "https://example.com/abercrombie-raw-hoodie.jpg",
    productUrl: "https://www.abercrombie.com/shop/wd/p/essential-fleece-hoodie",
    price: 69.9,
    currency: "USD",
    gender: "Men",
    categoryPath: "Men > Hoodies & Sweatshirts",
    colors: ["Black", "Heather Grey"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["fleece", "hoodie"],
    popularityScore: 95,
  },
  {
    id: "jeans-305",
    name: "Athletic Slim Jeans",
    brand: "Abercrombie",
    description: "Athletic slim jeans with stretch denim.",
    imageUrl: "https://example.com/abercrombie-raw-jeans.jpg",
    productUrl: "https://www.abercrombie.com/shop/wd/p/athletic-slim-jeans",
    price: 89.9,
    currency: "USD",
    gender: "Men",
    categoryPath: "Men > Jeans",
    colors: ["Blue"],
    sizes: ["30x30", "32x30", "32x32", "34x32"],
    tags: ["denim"],
    popularityScore: 80,
  },
];
