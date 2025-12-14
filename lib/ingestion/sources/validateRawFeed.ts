// lib/ingestion/sources/validateRawFeed.ts
// Shared validation helpers for raw feed entries.

import type {
  IngestionIssue,
  RawProduct,
  RawVariant,
  RetailerId,
  SourceId,
} from "../types";

export type ValidateRawFeedOptions = {
  retailerId: RetailerId;
  sourceId: SourceId;
  codePrefix: string;
  invalidFormatMessage?: string;
};

type ValidateRawFeedResult = {
  products: RawProduct[];
  issues: IngestionIssue[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value.filter((entry) => typeof entry === "string") as string[];
  return items.length > 0 ? items : undefined;
}

function parseAttributes(value: unknown): Record<string, string | number | boolean | null> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const entries: Record<string, string | number | boolean | null> = {};
  Object.entries(value).forEach(([key, val]) => {
    if (
      typeof val === "string" ||
      typeof val === "number" ||
      typeof val === "boolean" ||
      val === null
    ) {
      entries[key] = val;
    }
  });

  return Object.keys(entries).length > 0 ? entries : undefined;
}

function parseVariants(
  value: unknown,
  retailerId: RetailerId,
  sourceId: SourceId,
  productId: string,
  codePrefix: string
): { variants?: RawVariant[]; issues: IngestionIssue[] } {
  const issues: IngestionIssue[] = [];

  if (!Array.isArray(value)) {
    return { issues };
  }

  const variants: RawVariant[] = [];

  value.forEach((variant, index) => {
    if (!isRecord(variant)) {
      issues.push({
        severity: "error",
        code: `${codePrefix}.invalid_variant`,
        message: "Variant entry must be an object",
        retailerId,
        sourceId,
        productId,
        variantId: typeof variant === "string" ? variant : undefined,
        details: { index },
      });
      return;
    }

    const variantId = typeof variant.id === "string" ? variant.id : undefined;
    if (!variantId) {
      issues.push({
        severity: "error",
        code: `${codePrefix}.missing_variant_id`,
        message: "Variant is missing required id",
        retailerId,
        sourceId,
        productId,
        details: { index },
      });
      return;
    }

    const attributes = parseAttributes(variant.attributes);

    const parsedVariant: RawVariant = {
      id: variantId,
      sku: typeof variant.sku === "string" ? variant.sku : undefined,
      name: typeof variant.name === "string" ? variant.name : undefined,
      size: typeof variant.size === "string" ? variant.size : undefined,
      color: typeof variant.color === "string" ? variant.color : undefined,
      price: typeof variant.price === "number" ? variant.price : undefined,
      currency: typeof variant.currency === "string" ? variant.currency : undefined,
      inStock: typeof variant.inStock === "boolean" ? variant.inStock : undefined,
      imageUrl: typeof variant.imageUrl === "string" ? variant.imageUrl : undefined,
      url: typeof variant.url === "string" ? variant.url : undefined,
      attributes,
    };

    variants.push(parsedVariant);
  });

  return {
    variants: variants.length > 0 ? variants : undefined,
    issues,
  };
}

function validateRawProduct(
  input: unknown,
  retailerIdFallback: RetailerId,
  sourceIdFallback: SourceId,
  codePrefix: string,
  index: number
): { product?: RawProduct; issues: IngestionIssue[] } {
  const issues: IngestionIssue[] = [];

  if (!isRecord(input)) {
    issues.push({
      severity: "error",
      code: `${codePrefix}.invalid_product`,
      message: "Product entry must be an object",
      retailerId: retailerIdFallback,
      sourceId: sourceIdFallback,
      details: { index },
    });
    return { issues };
  }

  const id = typeof input.id === "string" ? input.id : undefined;
  const retailerId = typeof input.retailerId === "string" ? input.retailerId : retailerIdFallback;
  const sourceId = typeof input.sourceId === "string" ? input.sourceId : sourceIdFallback;
  const name = typeof input.name === "string" ? input.name : undefined;

  if (!id) {
    issues.push({
      severity: "error",
      code: `${codePrefix}.missing_product_id`,
      message: "Product is missing required id",
      retailerId,
      sourceId,
      details: { index },
    });
  }

  if (!retailerId) {
    issues.push({
      severity: "error",
      code: `${codePrefix}.missing_retailer_id`,
      message: "Product is missing required retailerId",
      productId: id,
      sourceId,
      details: { index },
    });
  }

  if (!name) {
    issues.push({
      severity: "error",
      code: `${codePrefix}.missing_name`,
      message: "Product is missing required name",
      retailerId,
      sourceId,
      productId: id,
      details: { index },
    });
  }

  if (!id || !retailerId || !name) {
    return { issues };
  }

  const images = toStringArray(input.imageUrls);
  const colors = toStringArray(input.colors);
  const sizes = toStringArray(input.sizes);
  const tags = toStringArray(input.tags);

  const { variants, issues: variantIssues } = parseVariants(
    input.variants,
    retailerId,
    sourceId,
    id,
    codePrefix
  );
  issues.push(...variantIssues);

  const product: RawProduct = {
    id,
    retailerId,
    sourceId,
    name,
    brand: typeof input.brand === "string" ? input.brand : undefined,
    description: typeof input.description === "string" ? input.description : undefined,
    productUrl: typeof input.productUrl === "string" ? input.productUrl : undefined,
    imageUrl: typeof input.imageUrl === "string" ? input.imageUrl : undefined,
    imageUrls: images,
    price: typeof input.price === "number" ? input.price : undefined,
    originalPrice: typeof input.originalPrice === "number" ? input.originalPrice : undefined,
    currency: typeof input.currency === "string" ? input.currency : undefined,
    gender: typeof input.gender === "string" ? input.gender : undefined,
    categoryPath: typeof input.categoryPath === "string" ? input.categoryPath : undefined,
    colors,
    sizes,
    tags,
    inStock: typeof input.inStock === "boolean" ? input.inStock : undefined,
    variants,
    metadata: isRecord(input.metadata) ? input.metadata : undefined,
  };

  return { product, issues };
}

export function validateRawFeed(
  raw: unknown,
  options: ValidateRawFeedOptions
): ValidateRawFeedResult {
  const issues: IngestionIssue[] = [];
  const { retailerId, sourceId, codePrefix } = options;
  const invalidFormatMessage =
    options.invalidFormatMessage ?? "Feed must be an array of products";

  if (!Array.isArray(raw)) {
    issues.push({
      severity: "error",
      code: `${codePrefix}.invalid_format`,
      message: invalidFormatMessage,
      retailerId,
      sourceId,
    });
    return { issues, products: [] };
  }

  const products: RawProduct[] = [];

  raw.forEach((entry, index) => {
    const { product, issues: entryIssues } = validateRawProduct(
      entry,
      retailerId,
      sourceId,
      codePrefix,
      index
    );
    issues.push(...entryIssues);
    if (product) {
      products.push(product);
    }
  });

  return { products, issues };
}
