// lib/ingestion/finalize/finalizeCatalogProduct.ts
// Map normalized drafts into catalog-ready products with stable IDs.

import type {
  CatalogProduct,
  FinalizeResult,
  IngestedCatalogProduct,
  IngestionIssue,
  NormalizeContext,
  NormalizedProductDraft,
  RetailerId,
  SourceId,
} from "../types";
import { deriveProductId } from "../identity/deriveProductId";
import { deriveVariantId } from "../identity/deriveVariantId";

type VariantKeyParts = {
  sku?: string;
  size?: string;
  color?: string;
};

function variantKey(parts: VariantKeyParts): string {
  const { sku, size, color } = parts;
  if (sku && sku.trim().length > 0) {
    return sku;
  }
  const components = [size, color].filter((value) => Boolean(value?.trim())) as string[];
  return components.join("_") || "variant";
}

function mapImages(imageUrls: string[], title: string): CatalogProduct["images"] {
  return imageUrls.map((url) => ({
    url,
    alt: title,
  }));
}

function mapPrice(draft: NormalizedProductDraft): CatalogProduct["price"] {
  return {
    amount: draft.price.amount,
    currency: draft.price.currency,
    originalAmount: draft.originalPrice?.amount,
  };
}

function defaultArray(value: string[] | undefined): string[] {
  return value ?? [];
}

function defaultCategory(categoryPath?: string): { category: string; subcategory?: string } {
  if (!categoryPath) {
    return { category: "uncategorized" };
  }
  const parts = categoryPath.split(">").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { category: "uncategorized" };
  }
  return {
    category: parts[parts.length - 1].toLowerCase(),
    subcategory: parts.length > 1 ? parts.slice(0, parts.length - 1).join(" > ") : undefined,
  };
}

function buildIngestionMeta(
  retailerId: RetailerId,
  sourceId: SourceId,
  sourceProductId: string,
  productUrl: string
): IngestedCatalogProduct["ingestion"] {
  return {
    retailerId,
    sourceId,
    sourceProductId,
    productUrl,
  };
}

export function finalizeCatalogProduct(
  draft: NormalizedProductDraft,
  ctx: NormalizeContext
): FinalizeResult {
  const issues: IngestionIssue[] = [];

  const productId = deriveProductId(ctx, { sourceProductId: draft.sourceProductId });
  const title = draft.title;
  const brand = draft.brand ?? ctx.retailerId;
  const images = mapImages(draft.imageUrls, title);
  const price = mapPrice(draft);
  const { category, subcategory } = defaultCategory(draft.categoryPath);

  const ingestionMeta = buildIngestionMeta(
    ctx.retailerId,
    ctx.sourceId,
    draft.sourceProductId,
    draft.productUrl
  );

  const baseProduct: IngestedCatalogProduct = {
    id: productId,
    source: "api",
    sourceName: ctx.retailerId,
    sourceId: draft.sourceProductId,
    name: title,
    brand,
    description: draft.description,
    images,
    url: draft.productUrl,
    price,
    gender: draft.gender as CatalogProduct["gender"],
    category,
    subcategory,
    colors: defaultArray(draft.colors),
    sizes: defaultArray(draft.sizes),
    tags: defaultArray(draft.tags),
    inStock: draft.inStock ?? true,
    ingestion: ingestionMeta,
  };

  if (Array.isArray(draft.variants) && draft.variants.length > 0) {
    // Currently the catalog Product type does not model variants directly; this retains
    // variant-derived sizes/colors if present and keeps the base product consistent.
    const variantSizes: string[] = [];
    const variantColors: string[] = [];

    draft.variants.forEach((variant) => {
      const key = variantKey({
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
      });
      const variantId = deriveVariantId(productId, key);
      if (variant.size) {
        variantSizes.push(variant.size);
      }
      if (variant.color) {
        variantColors.push(variant.color);
      }

      issues.push({
        severity: "info",
        code: "finalize.variant_mapped",
        message: "Variant processed for base catalog product",
        retailerId: ctx.retailerId,
        sourceId: ctx.sourceId,
        productId,
        variantId,
      });
    });

    if (variantSizes.length > 0) {
      baseProduct.sizes = Array.from(new Set([...baseProduct.sizes, ...variantSizes]));
    }
    if (variantColors.length > 0) {
      baseProduct.colors = Array.from(new Set([...baseProduct.colors, ...variantColors]));
    }
  }

  return { ok: true, product: baseProduct, issues };
}
