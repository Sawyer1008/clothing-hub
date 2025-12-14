// data/products.ts

import type { Product } from "@/types/product";

// Temporary manual catalog for Phase 2A.
// Later the ingestion pipeline will overwrite/append to this.
export const products: Product[] = [
  {
    id: "abercrombie-hoodie-1",
    source: "manual",
    sourceName: "Abercrombie",
    sourceId: "abercrombie-hoodie-1",

    name: "Essential Fleece Hoodie",
    brand: "Abercrombie",
    description: "Midweight fleece pullover hoodie with a clean, minimal fit.",

    images: [
      {
        url: "https://example.com/abercrombie-hoodie-1.jpg",
        alt: "Abercrombie Essential Fleece Hoodie in black",
      },
    ],
    url: "https://www.abercrombie.com/shop/wd/p/essential-fleece-hoodie",

    price: {
      amount: 69.9,
      currency: "USD",
      originalAmount: 79.9,
    },

    gender: "mens",
    category: "hoodies",
    subcategory: "fleece",

    colors: ["black", "grey"],
    sizes: ["S", "M", "L", "XL"],

    tags: ["casual", "basic", "fleece", "minimal"],
    inStock: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "abercrombie-jeans-1",
    source: "manual",
    sourceName: "Abercrombie",

    name: "Athletic Slim Jeans",
    brand: "Abercrombie",
    description: "Stretch denim with an athletic slim fit through the leg.",

    images: [
      {
        url: "https://example.com/abercrombie-jeans-1.jpg",
        alt: "Abercrombie Athletic Slim Jeans in medium wash",
      },
    ],
    url: "https://www.abercrombie.com/shop/wd/p/athletic-slim-jeans",

    price: {
      amount: 89.9,
      currency: "USD",
    },

    gender: "mens",
    category: "pants",
    subcategory: "jeans",

    colors: ["blue"],
    sizes: ["30x30", "32x30", "32x32", "34x32"],

    tags: ["denim", "casual"],
    inStock: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "zara-cargo-1",
    source: "manual",
    sourceName: "Zara",

    name: "Relaxed Fit Cargo Pants",
    brand: "Zara",
    description: "Relaxed straight leg cargos with side pockets.",

    images: [
      {
        url: "https://example.com/zara-cargo-1.jpg",
        alt: "Zara relaxed fit cargos in olive",
      },
    ],
    url: "https://www.zara.com/relaxed-fit-cargo-pants",

    price: {
      amount: 59.9,
      currency: "USD",
    },

    gender: "mens",
    category: "pants",
    subcategory: "cargo pants",

    colors: ["olive"],
    sizes: ["S", "M", "L", "XL"],

    tags: ["cargo", "streetwear"],
    inStock: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "pacsun-tee-1",
    source: "manual",
    sourceName: "PacSun",

    name: "Graphic Skate Tee",
    brand: "PacSun",
    description: "Soft cotton tee with skate-inspired front graphic.",

    images: [
      {
        url: "https://example.com/pacsun-tee-1.jpg",
        alt: "PacSun graphic skate t-shirt",
      },
    ],
    url: "https://www.pacsun.com/graphic-skate-tee",

    price: {
      amount: 34.95,
      currency: "USD",
    },

    gender: "mens",
    category: "t-shirts",
    subcategory: "graphic tees",

    colors: ["white"],
    sizes: ["S", "M", "L", "XL"],

    tags: ["graphic", "streetwear", "skate"],
    inStock: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "nike-dunks-1",
    source: "manual",
    sourceName: "Nike",

    name: "Nike Dunk Low",
    brand: "Nike",
    description: "Low-top Dunk sneakers with classic two-tone color blocking.",

    images: [
      {
        url: "https://example.com/nike-dunks-1.jpg",
        alt: "Nike Dunk Low sneakers",
      },
    ],
    url: "https://www.nike.com/dunk-low",

    price: {
      amount: 119.99,
      currency: "USD",
    },

    gender: "mens",
    category: "shoes",
    subcategory: "sneakers",

    colors: ["white", "black"],
    sizes: ["8", "9", "10", "11"],

    tags: ["sneakers", "streetwear", "retro"],
    inStock: true,
    lastUpdated: new Date().toISOString(),
  },
];
