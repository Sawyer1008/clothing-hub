// lib/semantic/fitDictionary.ts
import type { Product } from "@/types/product";

export type FitId = "slim" | "regular" | "relaxed" | "oversized";

export type FitDefinition = {
  id: FitId;
  label: string;
  description: string;
  coreKeywords: string[];
  softKeywords: string[];
};

export const FIT_DEFINITIONS: Record<FitId, FitDefinition> = {
  slim: {
    id: "slim",
    label: "Slim",
    description: "Closer to the body with a narrower silhouette.",
    coreKeywords: ["slim", "skinny", "tapered", "fitted"],
    softKeywords: ["tailored", "smart", "trim"],
  },
  regular: {
    id: "regular",
    label: "Regular",
    description: "Standard fit designed to follow the body without being tight.",
    coreKeywords: ["regular fit", "classic fit", "standard fit"],
    softKeywords: ["regular", "classic"],
  },
  relaxed: {
    id: "relaxed",
    label: "Relaxed",
    description: "Looser through the body or leg without being huge.",
    coreKeywords: ["relaxed", "baggy", "loose"],
    softKeywords: ["wide leg", "straight leg"],
  },
  oversized: {
    id: "oversized",
    label: "Oversized",
    description:
      "Intentionally big silhouette with dropped shoulders or extra volume.",
    coreKeywords: ["oversized", "boxy", "extra roomy"],
    softKeywords: ["drop shoulder", "dropped shoulder", "super loose"],
  },
};

const FIT_ORDER: FitId[] = ["slim", "regular", "relaxed", "oversized"];

function normalizeText(...parts: (string | undefined)[]): string {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Infer a single dominant fit for a product based on its name, description, and tags.
 */
export function inferFitForProduct(product: Product): FitId {
  const text = normalizeText(
    product.name,
    product.description,
    product.category,
    product.subcategory,
    ...(product.tags || [])
  );

  const scores: Record<FitId, number> = {
    slim: 0,
    regular: 0,
    relaxed: 0,
    oversized: 0,
  };

  for (const fitId of FIT_ORDER) {
    const def = FIT_DEFINITIONS[fitId];

    for (const kw of def.coreKeywords) {
      if (text.includes(kw.toLowerCase())) {
        scores[fitId] += 3;
      }
    }

    for (const kw of def.softKeywords) {
      if (text.includes(kw.toLowerCase())) {
        scores[fitId] += 1;
      }
    }
  }

  let bestFit: FitId = "regular";
  let bestScore = -Infinity;

  for (const fitId of FIT_ORDER) {
    if (scores[fitId] > bestScore) {
      bestScore = scores[fitId];
      bestFit = fitId;
    }
  }

  if (bestScore <= 0) {
    return "regular";
  }

  return bestFit;
}
