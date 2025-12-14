// lib/semantic/tagRules.ts
import type { Product } from "@/types/product";
import {
  ALL_STYLES,
  STYLE_DEFINITIONS,
  type StyleId,
  type ColorMood,
} from "./styleDictionary";

function normalizeText(...parts: (string | undefined)[]): string {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Rough color → mood mapping using color names.
 */
export function inferColorMoodsFromProduct(product: Product): ColorMood[] {
  const colors = (product.colors || []).map((c) => c.toLowerCase());
  const moods = new Set<ColorMood>();

  for (const color of colors) {
    if (["black", "charcoal"].some((c) => color.includes(c))) {
      moods.add("dark");
    }
    if (
      ["white", "cream", "beige", "grey", "gray"].some((c) =>
        color.includes(c)
      )
    ) {
      moods.add("neutral");
    }
    if (["brown", "tan", "olive", "khaki"].some((c) => color.includes(c))) {
      moods.add("earthy");
    }
    if (
      ["red", "blue", "green", "yellow", "orange", "pink", "purple"].some(
        (c) => color.includes(c)
      )
    ) {
      moods.add("bright");
    }
    if (["pastel"].some((c) => color.includes(c))) {
      moods.add("pastel");
    }
  }

  if (moods.size === 0) {
    moods.add("neutral");
  }

  return Array.from(moods);
}

/**
 * Heuristic scoring: we check the product name, description, category,
 * subcategory, brand, and tags against each style's keywords.
 */
export function inferStylesForProduct(product: Product): StyleId[] {
  const text = normalizeText(
    product.name,
    product.description,
    product.category,
    product.subcategory,
    product.brand,
    ...(product.tags || [])
  );

  const moods = inferColorMoodsFromProduct(product);

  const scores: Record<StyleId, number> = Object.fromEntries(
    ALL_STYLES.map((id) => [id, 0])
  ) as Record<StyleId, number>;

  for (const styleId of ALL_STYLES) {
    const def = STYLE_DEFINITIONS[styleId];

    for (const kw of def.coreKeywords) {
      if (text.includes(kw.toLowerCase())) {
        scores[styleId] += 3;
      }
    }

    for (const kw of def.softKeywords) {
      if (text.includes(kw.toLowerCase())) {
        scores[styleId] += 1;
      }
    }

    if (def.avoidKeywords) {
      for (const kw of def.avoidKeywords) {
        if (text.includes(kw.toLowerCase())) {
          scores[styleId] -= 2;
        }
      }
    }

    if (def.typicalColorMoods.some((m) => moods.includes(m))) {
      scores[styleId] += 1;
    }
  }

  const selected: StyleId[] = [];
  for (const styleId of ALL_STYLES) {
    if (scores[styleId] >= 3) {
      selected.push(styleId);
    }
  }

  if (selected.length === 0) {
    let best: StyleId | null = null;
    let bestScore = -Infinity;
    for (const styleId of ALL_STYLES) {
      if (scores[styleId] > bestScore) {
        bestScore = scores[styleId];
        best = styleId;
      }
    }
    if (best && bestScore > 0) {
      return [best];
    }
    return ["casual"];
  }

  return selected;
}
