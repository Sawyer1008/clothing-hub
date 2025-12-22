import { NextResponse } from "next/server";
import type { SearchResult } from "@/types/search";
import { getAllProducts } from "@/lib/catalog/catalog.server";
import { getDealInfo } from "@/lib/deals/deals";
import { rankProductsByQuery, sortByPopularity } from "@/utils/searchScoring";
import { applySmartSearchFallback, interpretQueryToFilters } from "@/utils/aiSearch";

type SearchRequestBody = {
  query?: string;
  maxResults?: number;
  // Reserved for future personalization (Phase 2G)
  userPrefs?: Record<string, unknown>;
};

export async function POST(req: Request) {
  let body: SearchRequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const query = (body.query ?? "").trim();
  const allProducts = getAllProducts();

  const interpretedFilters = interpretQueryToFilters(query);
  const { products: filteredProducts, filters: appliedFilters, isFallback, originalFilters } =
    applySmartSearchFallback(allProducts, interpretedFilters);

  let matchedProducts: typeof allProducts = filteredProducts;
  if (appliedFilters.text && appliedFilters.text.trim().length > 0) {
    const ranked = rankProductsByQuery(filteredProducts, appliedFilters.text);
    matchedProducts =
      ranked.length > 0
        ? ranked
        : filteredProducts.length > 0
          ? sortByPopularity(filteredProducts)
          : ranked;
  } else if (appliedFilters.onSale) {
    matchedProducts = [...filteredProducts].sort((a, b) => {
      const dealA = getDealInfo(a);
      const dealB = getDealInfo(b);

      const percentDiff = dealB.percentOff - dealA.percentOff;
      if (percentDiff !== 0) return percentDiff;

      const amountDiff = dealB.amountOff - dealA.amountOff;
      if (amountDiff !== 0) return amountDiff;

      const popA = a.popularityScore ?? 0;
      const popB = b.popularityScore ?? 0;
      if (popB !== popA) return popB - popA;

      return a.price.amount - b.price.amount;
    });
  } else {
    matchedProducts = sortByPopularity(filteredProducts);
  }

  const maxResults = body.maxResults;
  if (typeof maxResults === "number" && maxResults > 0) {
    matchedProducts = matchedProducts.slice(0, maxResults);
  }

  const result: SearchResult = {
    filters: appliedFilters,
    products: matchedProducts,
    isFallback,
    originalFilters: isFallback ? interpretedFilters : undefined,
  };

  return NextResponse.json(result);
}
