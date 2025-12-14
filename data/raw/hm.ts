// data/raw/hm.ts

import type { RawProduct } from "@/types/rawProduct";

export const hmRaw: RawProduct[] = [
  {
    id: "hoodie-401",
    name: "Relaxed Fit Printed Hoodie",
    brand: "H&M",
    description: "Soft fleece hoodie with a relaxed fit and chest print.",
    imageUrl: "https://example.com/hm-hoodie-401.jpg",
    productUrl: "https://www2.hm.com/en_us/productpage.hoodie-401.html",
    price: 39.99,
    currency: "USD",
    gender: "Men",
    categoryPath: "Men > Hoodies & Sweatshirts",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["graphic", "hoodie"],
  },
  {
    id: "tee-405",
    name: "Oversized T-shirt",
    brand: "H & M",
    description: "Oversized cotton t-shirt with dropped shoulders.",
    imageUrl: "https://example.com/hm-tee-405.jpg",
    productUrl: "https://www2.hm.com/en_us/productpage.tee-405.html",
    price: 17.99,
    currency: "USD",
    gender: "Men",
    categoryPath: "Men > T-shirts",
    colors: ["White"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["oversized", "basic"],
  },
];
