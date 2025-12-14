# Clothing Hub Semantic Rules

This document explains how Clothing Hub interprets products and user queries.
Agents should read this before building or modifying any AI features.

---

## 1. Product semantics

Each product in the catalog follows the `Product` type.

Key fields:

- `id`, `name`, `brand`, `description`
- `category`, `subcategory`
- `colors`, `sizes`, `tags`
- `price.amount`, `price.originalAmount?`

Agents should treat these fields as the **ground truth** and only infer on top.

### 1.1 Styles

We infer high-level style labels using `inferStylesForProduct(product)` from
`@/lib/semantic/tagRules`.

Example style IDs:

- `streetwear`
- `minimal`
- `preppy`
- `casual`
- `sporty`
- `workwear`
- `going-out` (night out / club / bar)

A product can map to **multiple** styles.

Agents should:

- Use these style labels when describing items:  
  e.g. "slim, minimal hoodie" or "streetwear cargo pants".
- Prefer filtering by style IDs instead of only searching in text.

### 1.2 Fit

We infer fit using `inferFitForProduct(product)` from
`@/lib/semantic/fitDictionary`.

Valid fits:

- `slim`
- `regular`
- `relaxed`
- `oversized`

Agents should:

- Respect user preferences like "I like oversized tops but slimmer pants"
  by filtering on `fit` per product.
- Mention fit clearly in recommendations when relevant.

### 1.3 Outfit role

We map a product to its role in an outfit using
`getOutfitRoleForProduct(product)` (currently implemented in
`/app/semantic-debug/page.tsx` and can be moved to `@/lib/semantic` later).

Valid roles:

- `top`
- `bottom`
- `outerwear`
- `footwear`
- `accessory`

Agents building outfits should:

- Ensure a complete outfit covers at least a **top + bottom**.
- Optionally add **outerwear** and **footwear**.
- Use **accessories** sparingly to avoid clutter.

### 1.4 Color moods

We infer color moods using `inferColorMoodsFromProduct(product)` from
`@/lib/semantic/tagRules`.

Examples of moods:

- `dark`
- `bright`
- `neutral`
- `earthy`
- `pastel`
- `high-contrast`

Agents should:

- Use color moods to match requests like "dark techwear", "earthy fall
  outfit", or "soft pastel vibe".
- Prefer color moods over raw color names when describing an overall vibe.

---

## 2. Query interpretation

We parse free-text user queries using `parseQueryToIntent(text)` from
`@/lib/semantic/queryParser`.

This returns an object like:

```ts
type ParsedQuery = {
  gender?: "mens" | "womens" | "unisex";
  minPrice?: number;
  maxPrice?: number;
  occasions: string[];        // e.g. ["school", "night-out"]
  stylePreferences: string[]; // style IDs like "streetwear", "minimal"
  colorMoods: string[];       // mood IDs like "dark", "neutral"
  wantsPieces: string[];      // e.g. ["hoodie", "cargo pants", "sneakers"]
  rawKeywords: string[];      // leftover important words
};
