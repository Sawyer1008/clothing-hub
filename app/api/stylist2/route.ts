import { NextResponse } from "next/server";
import { interpretQueryToFilters, applySmartSearchFallback } from "@/utils/aiSearch";
import type { Product } from "@/types/product";
import type { StylistRequest, StylistResponse } from "@/types/stylist";
import { getAllProducts } from "@/lib/catalog/catalog.server";

const TOP_CATEGORIES = [
  "hoodies",
  "tops",
  "t-shirt",
  "t-shirts",
  "tee",
  "tees",
  "shirt",
  "shirts",
  "sweater",
  "sweatshirt",
  "outerwear",
  "jacket",
  "coat",
  "hoodie",
];

const BOTTOM_CATEGORIES = [
  "pants",
  "jeans",
  "shorts",
  "cargo",
  "cargo pants",
  "cargos",
  "chinos",
];

const SHOE_CATEGORIES = ["shoes", "sneakers", "boots", "trainers"];

function getPriceAmount(product: Product): number {
  return typeof (product as any).price === "number"
    ? (product as any).price
    : product.price.amount;
}

function matchesCategory(product: Product, keywords: string[]): boolean {
  const cat = product.category?.toLowerCase() ?? "";
  const sub = product.subcategory?.toLowerCase() ?? "";
  return keywords.some(
    (k) =>
      cat === k ||
      sub === k ||
      cat.includes(k) ||
      (sub && sub.includes(k))
  );
}

function pickOutfit(pool: Product[]): { primary: Product[]; alternates: Product[] } {
  const chosen: Product[] = [];

  const top = pool.find((p) => matchesCategory(p, TOP_CATEGORIES));
  if (top) chosen.push(top);

  const bottom = pool.find(
    (p) => matchesCategory(p, BOTTOM_CATEGORIES) && !chosen.includes(p)
  );
  if (bottom) chosen.push(bottom);

  const shoe = pool.find(
    (p) => matchesCategory(p, SHOE_CATEGORIES) && !chosen.includes(p)
  );
  if (shoe) chosen.push(shoe);

  for (const item of pool) {
    if (chosen.length >= 3) break;
    if (!chosen.includes(item)) {
      chosen.push(item);
    }
  }

  const alternates = pool.filter((p) => !chosen.includes(p)).slice(0, 3);

  return { primary: chosen.slice(0, 3), alternates };
}

function buildExplanation(
  filtersApplied: ReturnType<typeof interpretQueryToFilters>,
  isFallback: boolean,
  maxBudget?: number
): string {
  const parts: string[] = [];

  if (filtersApplied.styles?.length) {
    parts.push(`Leaned into ${filtersApplied.styles.join(", ")} vibes`);
  }
  if (filtersApplied.colors?.length) {
    parts.push(`Kept to ${filtersApplied.colors.join(", ")} tones`);
  }
  if (filtersApplied.tagsInclude?.length) {
    parts.push(`Included tags: ${filtersApplied.tagsInclude.join(", ")}`);
  }
  if (maxBudget !== undefined) {
    parts.push(`Aimed to stay at or below $${maxBudget}`);
  }
  if (isFallback) {
    parts.push("Relaxed some filters to find solid matches");
  }

  if (!parts.length) {
    return "Built a versatile outfit from the catalog based on your prompt.";
  }

  return parts.join(". ") + ".";
}

export async function POST(req: Request) {
  let body: StylistRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const prompt = (body.prompt ?? "").trim();
  if (!prompt) {
    return NextResponse.json(
      { error: "Missing prompt" },
      { status: 400 }
    );
  }

  const maxBudget =
    typeof body.maxBudget === "number" && isFinite(body.maxBudget)
      ? body.maxBudget
      : undefined;

  const catalog = getAllProducts();
  const interpretedFilters = interpretQueryToFilters(prompt);

  const {
    products: matchedProducts,
    filters: appliedFilters,
    isFallback,
  } = applySmartSearchFallback(catalog, interpretedFilters);

  let pool = matchedProducts;

  if (maxBudget !== undefined) {
    const budgetPool = pool.filter((p) => getPriceAmount(p) <= maxBudget);
    if (budgetPool.length > 0) {
      pool = budgetPool;
    }
  }

  if (pool.length === 0) {
    pool = catalog.slice(0, 6);
  }

  const { primary, alternates } = pickOutfit(pool);

  const response: StylistResponse = {
    explanation: buildExplanation(appliedFilters, isFallback, maxBudget),
    primaryOutfit: primary.map((p) => p.id),
    alternates: alternates.length ? alternates.map((p) => p.id) : undefined,
  };

  return NextResponse.json(response);
}
