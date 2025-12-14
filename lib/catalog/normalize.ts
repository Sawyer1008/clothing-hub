// lib/catalog/normalize.ts
import type { RawProduct } from "@/types/rawProduct";

export function normalizeBrand(rawBrand: string | undefined, sourceName: string): string {
  if (!rawBrand || rawBrand.trim().length === 0) return sourceName;

  const b = rawBrand.trim().toLowerCase();

  const map: Record<string, string> = {
    nike: "Nike",
    "nike, inc.": "Nike",
    abercrombie: "Abercrombie",
    "abercrombie & fitch": "Abercrombie",
    zara: "Zara",
    pacsun: "PacSun",
    "h&m": "H&M",
    "h & m": "H&M",
    uniqlo: "Uniqlo",
    "uniqlo u": "Uniqlo",
  };

  if (map[b]) return map[b];

  return b
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export function normalizeGender(gender: string | undefined): "mens" | "womens" | "unisex" | "kids" | undefined {
  if (!gender) return undefined;
  const g = gender.toLowerCase();

  if (g.includes("men")) return "mens";
  if (g.includes("women") || g.includes("ladies")) return "womens";
  if (g.includes("kid") || g.includes("boys") || g.includes("girls")) return "kids";
  if (g.includes("unisex")) return "unisex";

  return undefined;
}

export function mapCategory(
  rawCategoryPath: string | undefined,
  name: string
): { category: string; subcategory?: string } {
  const src = (rawCategoryPath || name).toLowerCase();

  // Hoodies & sweatshirts
  if (src.includes("hoodie") || src.includes("sweatshirt")) {
    const sub =
      src.includes("zip") || src.includes("zip-up") ? "zip hoodies" : "fleece";
    return { category: "hoodies", subcategory: sub };
  }

  // T-shirts
  if (
    src.includes("t-shirt") ||
    src.includes("t shirt") ||
    src.includes("tee")
  ) {
    if (src.includes("graphic")) {
      return { category: "t-shirts", subcategory: "graphic tees" };
    }
    if (src.includes("oversized")) {
      return { category: "t-shirts", subcategory: "oversized tees" };
    }
    return { category: "t-shirts", subcategory: "basic tees" };
  }

  // Sweatshirts (crewnecks)
  if (src.includes("sweatshirt") && !src.includes("hoodie")) {
    return { category: "sweatshirts", subcategory: "crewnecks" };
  }

  // Jeans
  if (src.includes("jean")) {
    if (src.includes("wide") || src.includes("loose") || src.includes("baggy")) {
      return { category: "pants", subcategory: "baggy jeans" };
    }
    if (src.includes("slim") || src.includes("skinny")) {
      return { category: "pants", subcategory: "slim jeans" };
    }
    return { category: "pants", subcategory: "jeans" };
  }

  // Cargo / carpenter / utility pants
  if (src.includes("cargo") || src.includes("carpenter") || src.includes("utility")) {
    return { category: "pants", subcategory: "cargo pants" };
  }

  // Generic pants
  if (src.includes("trouser") || src.includes("pants")) {
    return { category: "pants", subcategory: "casual pants" };
  }

  // Sneakers / shoes
  if (src.includes("sneaker") || src.includes("dunk") || src.includes("shoe")) {
    return { category: "shoes", subcategory: "sneakers" };
  }

  // Fallback if we can't recognize anything
  return { category: "other" };
}

export function normalizeColors(colors: string[] | undefined): string[] {
  if (!colors || colors.length === 0) return [];

  const map: Record<string, string> = {
    blk: "black",
    black: "black",
    "heather grey": "grey",
    grey: "grey",
    gray: "grey",
    white: "white",
    navy: "navy",
    blue: "blue",
    olive: "olive",
    green: "green",
    red: "red",
  };

  return colors
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean)
    .map((c) => map[c] || c);
}

export function autoTagsFromRaw(raw: RawProduct, category: string, subcategory?: string): string[] {
  const tags = new Set<string>();

  for (const t of raw.tags ?? []) {
    const clean = t.trim().toLowerCase();
    if (clean) tags.add(clean);
  }

  const text = `${raw.name} ${raw.description ?? ""}`.toLowerCase();

  if (text.includes("oversized") || text.includes("relaxed")) tags.add("oversized");
  if (text.includes("slim")) tags.add("slim");
  if (text.includes("baggy") || text.includes("loose")) tags.add("baggy");
  if (text.includes("graphic")) tags.add("graphic");
  if (text.includes("essential") || text.includes("basic")) tags.add("basic");
  if (text.includes("minimal")) tags.add("minimal");

  if (text.includes("skate")) tags.add("skate");
  if (text.includes("street")) tags.add("streetwear");
  if (text.includes("retro")) tags.add("retro");

  tags.add(category);
  if (subcategory) tags.add(subcategory);

  return Array.from(tags);
}
