// lib/semantic/categoryRules.ts
import type { Product } from "@/types/product";

export type OutfitRole =
  | "top"
  | "bottom"
  | "outerwear"
  | "footwear"
  | "accessory";

type CategoryRule = {
  role: OutfitRole;
  match: (category: string, subcategory?: string) => boolean;
};

const LOWER = (s: string | undefined) => (s ? s.toLowerCase() : "");

// Basic heuristic rules for mapping categories → outfit roles
const CATEGORY_RULES: CategoryRule[] = [
  {
    role: "top",
    match: (cat, sub) => {
      const c = LOWER(cat);
      const s = LOWER(sub);
      return (
        c.includes("top") ||
        c.includes("tee") ||
        c.includes("t-shirt") ||
        c.includes("shirt") ||
        c.includes("polo") ||
        c.includes("sweater") ||
        c.includes("crewneck") ||
        c.includes("tank") ||
        s.includes("tee") ||
        s.includes("top")
      );
    },
  },
  {
    role: "bottom",
    match: (cat, sub) => {
      const c = LOWER(cat);
      const s = LOWER(sub);
      return (
        c.includes("pant") ||
        c.includes("jean") ||
        c.includes("cargo") ||
        c.includes("short") ||
        c.includes("jogger") ||
        s.includes("pant") ||
        s.includes("cargo") ||
        s.includes("jogger")
      );
    },
  },
  {
    role: "outerwear",
    match: (cat, sub) => {
      const c = LOWER(cat);
      const s = LOWER(sub);
      return (
        c.includes("jacket") ||
        c.includes("coat") ||
        c.includes("puffer") ||
        c.includes("parka") ||
        c.includes("outerwear") ||
        s.includes("jacket") ||
        s.includes("coat") ||
        s.includes("puffer")
      );
    },
  },
  {
    role: "footwear",
    match: (cat, sub) => {
      const c = LOWER(cat);
      const s = LOWER(sub);
      return (
        c.includes("shoe") ||
        c.includes("sneaker") ||
        c.includes("boot") ||
        s.includes("shoe") ||
        s.includes("sneaker") ||
        s.includes("boot")
      );
    },
  },
  {
    role: "accessory",
    match: (cat, sub) => {
      const c = LOWER(cat);
      const s = LOWER(sub);
      return (
        c.includes("hat") ||
        c.includes("cap") ||
        c.includes("beanie") ||
        c.includes("belt") ||
        c.includes("bag") ||
        c.includes("backpack") ||
        c.includes("scarf") ||
        s.includes("belt") ||
        s.includes("beanie") ||
        s.includes("bag")
      );
    },
  },
];

export function getOutfitRoleForProduct(product: Product): OutfitRole {
  const category = product.category;
  const subcategory = product.subcategory;

  for (const rule of CATEGORY_RULES) {
    if (rule.match(category, subcategory)) {
      return rule.role;
    }
  }

  return "top";
}
