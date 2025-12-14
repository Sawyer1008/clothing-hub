import type { Product } from "@/types/product";

export function getAffiliateUrl(product: Product): string {
  return product.url;
}

