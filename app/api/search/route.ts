import { NextResponse } from "next/server";
import type { SearchResult } from "@/types/search";
import { getAllProducts } from "@/lib/catalog/catalog.server";
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
