import type { Product } from "@/types/product";

export type PriceRange = {
  min?: number;
  max?: number;
};

export type SearchFilters = {
  text?: string;

  categories?: string[];
  subcategories?: string[];

  colors?: string[];
  fits?: string[];
  styles?: string[];
  genders?: string[];

  tagsInclude?: string[];

  priceRange?: PriceRange;

  onSale?: boolean;
};

export type SearchResult = {
  // The filters actually applied for this result set
  filters: SearchFilters;
  products: Product[];

  // If true, we had to relax filters from the original interpreted query
  isFallback?: boolean;

  // Optional: the original interpreted filters before relaxation
  originalFilters?: SearchFilters;
};
