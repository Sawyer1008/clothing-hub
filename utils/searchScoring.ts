import type { Product } from "@/types/product";

// Rule-based search scoring, ready to be swapped for embeddings later.

const SYNONYM_GROUPS: string[][] = [
  ["hoodie", "sweatshirt"],
  ["tee", "t-shirt", "tshirt"],
  ["joggers", "sweatpants"],
  ["jeans", "denim"],
  ["jacket", "coat"],
];

const SYNONYM_MAP: Record<string, Set<string>> = SYNONYM_GROUPS.reduce(
  (acc, group) => {
    group.forEach((term) => {
      const lowerTerm = term.toLowerCase();
      if (!acc[lowerTerm]) acc[lowerTerm] = new Set<string>();
      group.forEach((other) => {
        const lowerOther = other.toLowerCase();
        if (lowerOther !== lowerTerm) {
          acc[lowerTerm].add(lowerOther);
        }
      });
    });
    return acc;
  },
  {} as Record<string, Set<string>>
);

const tokenize = (query: string): string[] =>
  query.toLowerCase().split(/\s+/).filter(Boolean);

const expandTokens = (tokens: string[]): string[] => {
  const expanded = new Set<string>();
  tokens.forEach((token) => {
    expanded.add(token);
    const synonyms = SYNONYM_MAP[token];
    if (synonyms) {
      synonyms.forEach((syn) => expanded.add(syn));
    }
  });
  return Array.from(expanded);
};

const priceAmount = (product: Product): number => product.price?.amount ?? 0;

const fieldIncludes = (field: string | undefined, token: string): boolean =>
  field?.toLowerCase().includes(token) ?? false;

const tagsInclude = (tags: string[] | undefined, token: string): boolean =>
  !!tags?.some((tag) => tag.toLowerCase().includes(token));

const scoreProduct = (product: Product, tokens: string[]): number => {
  let score = 0;
  const strongMatch = tokens.some(
    (token) =>
      fieldIncludes(product.name, token) ||
      fieldIncludes(product.category, token) ||
      fieldIncludes(product.subcategory, token) ||
      tagsInclude(product.tags, token)
  );

  if (!strongMatch) return 0;

  for (const token of tokens) {
    if (fieldIncludes(product.brand, token)) score += 5;
    if (fieldIncludes(product.name, token)) score += 4;
    if (fieldIncludes(product.category, token) || fieldIncludes(product.subcategory, token)) {
      score += 3;
    }
    if (tagsInclude(product.tags, token)) score += 2;
  }

  const popularityBoost = (product.popularityScore ?? 0) / 50;
  return score + popularityBoost;
};

export const rankProductsByQuery = (products: Product[], query: string): Product[] => {
  const tokens = expandTokens(tokenize(query));
  if (tokens.length === 0) return [];

  const scored = products
    .map((product) => ({
      product,
      relevanceScore: scoreProduct(product, tokens),
    }))
    .filter(({ relevanceScore }) => relevanceScore > 0);

  return scored
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      const popA = a.product.popularityScore ?? 0;
      const popB = b.product.popularityScore ?? 0;
      if (popB !== popA) return popB - popA;
      return priceAmount(a.product) - priceAmount(b.product);
    })
    .map(({ product }) => product);
};

export const sortByPopularity = (products: Product[]): Product[] =>
  [...products].sort((a, b) => {
    const popA = a.popularityScore ?? 0;
    const popB = b.popularityScore ?? 0;
    if (popB !== popA) return popB - popA;
    return priceAmount(a) - priceAmount(b);
  });
