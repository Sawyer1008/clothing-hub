// types/product.ts

export type Price = {
  amount: number;          // current price, e.g. 69.90
  currency: string;        // "USD"
  originalAmount?: number; // old price if it's on sale
};

export type ProductImage = {
  url: string;
  alt?: string;
};

export type ProductSource = "manual" | "api" | "scrape";

// This is the master shape every product in Clothing Hub will follow.
export type Product = {
  id: string;              // our internal id
  source: ProductSource;   // how we got it (for later ingestion)
  sourceName: string;      // brand/store site like "Abercrombie", "PacSun"
  sourceId?: string;       // their internal id if we have it

  name: string;            // e.g. "Essential Fleece Hoodie"
  brand: string;           // e.g. "Abercrombie"
  description?: string;

  images: ProductImage[];  // one or more images
  url: string;             // link to buy the item

  price: Price;

  gender?: "mens" | "womens" | "unisex" | "kids";

  category: string;        // "hoodies", "pants", "shoes"
  subcategory?: string;    // "cargo pants", "graphic tees", etc.

  colors: string[];        // ["black", "grey"]
  sizes: string[];         // ["S","M","L","XL"]

  tags: string[];          // ["oversized","streetwear","neutral"]

  inStock: boolean;
  popularityScore?: number; // higher = more popular (placeholder)
  lastUpdated?: string;     // ISO date string from new Date().toISOString()
};
