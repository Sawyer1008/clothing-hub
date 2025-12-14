// types/rawProduct.ts

// Very loose "raw" product from a site/API/scraper.
// This is what our ingestion pipeline will clean up
// and turn into a proper Product object.
export type RawProduct = {
  id: string;                    // their id
  name: string;
  brand?: string;
  description?: string;

  imageUrl: string;
  productUrl: string;

  price: number;                 // simple number for now
  currency?: string;             // e.g. "USD"

  gender?: string;               // e.g. "Men", "WOMENS", etc.
  categoryPath?: string;         // e.g. "Men > Hoodies & Sweatshirts"

  colors?: string[];             // free text: ["Blk", "Heather Grey"]
  sizes?: string[];              // ["S","M","L","XL"]

  tags?: string[];               // optional starting tags from source

  popularityScore?: number;     // optional placeholder popularity


};
