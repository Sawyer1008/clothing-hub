import type { Product } from "@/types/product";
import type { SearchFilters } from "@/types/search";
import { getDealInfo } from "@/lib/deals/deals";

// ------------------------------
// Keyword dictionaries
// ------------------------------

const COLOR_MAP: Record<string, string> = {
  black: "black",
  white: "white",
  brown: "brown",
  beige: "beige",
  tan: "tan",
  cream: "cream",
  navy: "navy",
  blue: "blue",
  green: "green",
  red: "red",
  grey: "grey",
  gray: "grey",
  olive: "olive",
};

const CATEGORY_KEYWORDS: Array<{ keywords: string[]; category: string; subcategory?: string }> = [
  { keywords: ["hoodie", "hoodies"], category: "hoodies" },
  { keywords: ["sweatshirt", "sweatshirts", "crewneck", "crewnecks"], category: "sweatshirts", subcategory: "crewnecks" },
  { keywords: ["t-shirt", "tshirts", "t shirt", "tee", "tees"], category: "t-shirts", subcategory: "basic tees" },
  { keywords: ["graphic tee", "graphic tees", "graphic t-shirt"], category: "t-shirts", subcategory: "graphic tees" },
  { keywords: ["pants"], category: "pants" },
  { keywords: ["jeans"], category: "pants", subcategory: "jeans" },
  { keywords: ["cargo pant", "cargo pants", "cargos"], category: "pants", subcategory: "cargo pants" },
  { keywords: ["sneaker", "sneakers", "shoes"], category: "shoes", subcategory: "sneakers" },
  { keywords: ["jacket", "jackets"], category: "outerwear", subcategory: "jacket" },
  { keywords: ["coat", "coats"], category: "outerwear", subcategory: "coat" },
];

const FIT_KEYWORDS: Record<string, string> = {
  oversized: "oversized",
  baggy: "oversized",
  relaxed: "relaxed",
  slim: "slim",
  skinny: "slim",
  regular: "regular",
};

const STYLE_KEYWORDS: Record<string, string> = {
  streetwear: "streetwear",
  techwear: "techwear",
  minimalist: "minimalist",
  y2k: "y2k",
  vintage: "vintage",
  preppy: "preppy",
};

const GENDER_KEYWORDS: Record<string, string> = {
  men: "mens",
  mens: "mens",
  "men's": "mens",
  women: "womens",
  womens: "womens",
  "women's": "womens",
  unisex: "unisex",
};

const TAG_KEYWORDS: Record<string, string> = {
  fall: "fall",
  winter: "winter",
  summer: "summer",
  spring: "spring",
  cozy: "cozy",
  warm: "warm",
  breathable: "breathable",
  party: "party",
  casual: "casual",
  work: "work",
};

// ------------------------------
// Price extraction and helpers
// ------------------------------

function findPhraseIndices(tokens: string[], phraseWords: string[]): number[] | null {
  for (let i = 0; i <= tokens.length - phraseWords.length; i++) {
    let match = true;
    for (let j = 0; j < phraseWords.length; j++) {
      if (tokens[i + j] !== phraseWords[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      return Array.from({ length: phraseWords.length }, (_, k) => i + k);
    }
  }
  return null;
}

function markTokens(tokens: string[], consumed: Set<number>, predicate: (token: string) => boolean) {
  tokens.forEach((token, idx) => {
    if (predicate(token)) consumed.add(idx);
  });
}

function extractPriceRange(tokens: string[]): { priceRange?: { min?: number; max?: number }; consumed: Set<number> } {
  const joined = tokens.join(" ");
  const consumed = new Set<number>();

  const underMatch = joined.match(/(?:under|below|less than|<)\s*\$?(\d+)/i);
  if (underMatch) {
    const value = Number(underMatch[1]);
    markTokens(tokens, consumed, (t) => /under|below|less|<|than/.test(t));
    markTokens(tokens, consumed, (t) => t.replace(/[^0-9]/g, "") === String(value));
    return { priceRange: { max: value }, consumed };
  }

  const overMatch = joined.match(/(?:over|above|more than|>|at least)\s*\$?(\d+)/i);
  if (overMatch) {
    const value = Number(overMatch[1]);
    markTokens(tokens, consumed, (t) => /over|above|more|>|least/.test(t));
    markTokens(tokens, consumed, (t) => t.replace(/[^0-9]/g, "") === String(value));
    return { priceRange: { min: value }, consumed };
  }

  const rangeMatch = joined.match(/(\d+)\s*(?:-|to)\s*(\d+)/i);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    markTokens(tokens, consumed, (t) => /to|-/.test(t));
    markTokens(tokens, consumed, (t) => {
      const numeric = t.replace(/[^0-9]/g, "");
      return numeric === String(min) || numeric === String(max);
    });
    return { priceRange: { min, max }, consumed };
  }

  return { consumed, priceRange: undefined };
}

// ------------------------------
// Main parser: interpretQueryToFilters
// ------------------------------

export function interpretQueryToFilters(query: string): SearchFilters {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);

  const colors = new Set<string>();
  const categories = new Set<string>();
  const subcategories = new Set<string>();
  const fits = new Set<string>();
  const styles = new Set<string>();
  const genders = new Set<string>();
  const tagsInclude = new Set<string>();
  let onSale: boolean | undefined;
  const consumed = new Set<number>();

  tokens.forEach((token, idx) => {
    if (COLOR_MAP[token]) {
      colors.add(COLOR_MAP[token]);
      consumed.add(idx);
    }
    const next = tokens[idx + 1];
    if (token === "on" && next === "sale") {
      onSale = true;
      consumed.add(idx);
      consumed.add(idx + 1);
    } else if (/(^sale$|^deals?$|^deal$|discount|markdown)/.test(token)) {
      onSale = true;
      consumed.add(idx);
    }
  });

  for (const { keywords, category, subcategory } of CATEGORY_KEYWORDS) {
    for (const kw of keywords) {
      const words = kw.split(" ");
      const indices = findPhraseIndices(tokens, words);
      if (indices) {
        categories.add(category);
        if (subcategory) subcategories.add(subcategory);
        break;
      }
    }
  }

  for (const token of tokens) {
    if (FIT_KEYWORDS[token]) fits.add(FIT_KEYWORDS[token]);
    if (STYLE_KEYWORDS[token]) styles.add(STYLE_KEYWORDS[token]);
    if (GENDER_KEYWORDS[token]) genders.add(GENDER_KEYWORDS[token]);
    if (TAG_KEYWORDS[token]) tagsInclude.add(TAG_KEYWORDS[token]);
  }

  const { priceRange, consumed: priceConsumed } = extractPriceRange(tokens);
  priceConsumed.forEach((idx) => consumed.add(idx));

  const textTokens = tokens.filter((_, idx) => !consumed.has(idx));
  const text = textTokens.join(" ").trim() || undefined;

  return {
    text,
    categories: categories.size ? [...categories] : undefined,
    subcategories: subcategories.size ? [...subcategories] : undefined,
    colors: colors.size ? [...colors] : undefined,
    fits: fits.size ? [...fits] : undefined,
    styles: styles.size ? [...styles] : undefined,
    genders: genders.size ? [...genders] : undefined,
    tagsInclude: tagsInclude.size ? [...tagsInclude] : undefined,
    priceRange,
    onSale,
  };
}

// ------------------------------
// Keyword matching
// ------------------------------

function matchesKeyword(product: Product, text?: string): boolean {
  if (!text) return true;
  const qTokens = text.toLowerCase().split(/\s+/).filter(Boolean);

  const haystack = [
    product.name,
    product.brand,
    product.description,
    product.category,
    product.subcategory,
    ...(product.tags || []),
    ...(Array.isArray((product as any).styleTags) ? (product as any).styleTags : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return qTokens.every((token) => haystack.includes(token));
}

// ------------------------------
// Main filtering engine
// ------------------------------

export function filterProductsByFilters(
  products: Product[],
  filters: SearchFilters
): Product[] {
  return products.filter((p) => {
    if (filters.text && !matchesKeyword(p, filters.text)) return false;

    if (filters.categories?.length) {
      if (!filters.categories.includes(p.category.toLowerCase())) return false;
    }

    if (filters.subcategories?.length) {
      const sub = p.subcategory?.toLowerCase();
      if (!sub || !filters.subcategories.includes(sub)) return false;
    }

    if (filters.colors?.length) {
      const productColors = (p.colors || []).map((c) => c.toLowerCase());
      if (!filters.colors.some((c) => productColors.includes(c))) return false;
    }

    if (filters.fits?.length) {
      const fit = typeof (p as any).fit === "string" ? (p as any).fit.toLowerCase() : undefined;
      const tagFits = Array.isArray(p.tags) ? p.tags.map((t) => t.toLowerCase()) : [];
      const fitsMatched =
        (fit && filters.fits.includes(fit)) ||
        filters.fits.some((f) => tagFits.includes(f));
      if (!fitsMatched) return false;
    }

    if (filters.styles?.length) {
      const styles = Array.isArray((p as any).styleTags)
        ? (p as any).styleTags.map((s: string) => s.toLowerCase())
        : [];
      const tagStyles = Array.isArray(p.tags) ? p.tags.map((t) => t.toLowerCase()) : [];
      const allStyles = [...styles, ...tagStyles];
      if (!filters.styles.some((s) => allStyles.includes(s))) return false;
    }

    if (filters.genders?.length) {
      const gender = p.gender?.toLowerCase();
      if (!gender || !filters.genders.includes(gender)) return false;
    }

    if (filters.tagsInclude?.length) {
      const tags = (p.tags || []).map((t) => t.toLowerCase());
      if (!filters.tagsInclude.every((tag) => tags.includes(tag))) return false;
    }

    if (filters.priceRange) {
      const price = typeof (p as any).price === "number" ? (p as any).price : p.price.amount;
      const { min, max } = filters.priceRange;
      if (min !== undefined && price < min) return false;
      if (max !== undefined && price > max) return false;
    }

    if (filters.onSale) {
      if (!getDealInfo(p).isOnSale) return false;
    }

    return true;
  });
}

export function applySmartSearchFallback(
  products: Product[],
  baseFilters: SearchFilters
): {
  products: Product[];
  filters: SearchFilters;
  isFallback: boolean;
  originalFilters?: SearchFilters;
} {
  // 1) Try the original filters first
  let currentFilters = baseFilters;
  let matches = filterProductsByFilters(products, currentFilters);
  if (matches.length > 0) {
    return {
      products: matches,
      filters: currentFilters,
      isFallback: false,
    };
  }

  // 2) Define a small sequence of relaxations
  const relaxOrder: (keyof SearchFilters)[] = [
    "text",
    "onSale",
    "priceRange",
    "colors",
    "tagsInclude",
    "fits",
    "styles",
    "genders",
    "subcategories",
    "categories",
  ];

  // 3) Try relaxing one dimension at a time until we find matches
  for (const key of relaxOrder) {
    // If this filter is not set, skip
    if (!currentFilters[key] || (Array.isArray(currentFilters[key]) && (currentFilters[key] as string[]).length === 0)) {
      continue;
    }

    // Shallow clone and remove this key
    const nextFilters: SearchFilters = { ...currentFilters };
    delete (nextFilters as any)[key];

    const nextMatches = filterProductsByFilters(products, nextFilters);
    if (nextMatches.length > 0) {
      return {
        products: nextMatches,
        filters: nextFilters,
        isFallback: true,
        originalFilters: baseFilters,
      };
    }

    currentFilters = nextFilters;
  }

  // 4) If still no matches, return empty with original filters
  return {
    products: [],
    filters: baseFilters,
    isFallback: false,
  };
}
