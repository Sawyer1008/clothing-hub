// lib/ingestion/normalize/normalizeRawProduct.ts
// Pure normalization from RawProduct to NormalizedProductDraft with issues.

import type {
  IngestionIssue,
  Money,
  NormalizeContext,
  NormalizeResult,
  NormalizedProductDraft,
  NormalizedVariantDraft,
  RawProduct,
  RawVariant,
} from "../types";
import {
  dedupePreserveOrder,
  isPositiveMoney,
  normalizeStringArray,
  normalizeText,
  normalizeUrl,
} from "./helpers";

type MoneyValidationOptions = {
  required: boolean;
  field: string;
  productId: string;
  retailerId: NormalizeContext["retailerId"];
  sourceId: NormalizeContext["sourceId"];
  variantId?: string;
};

function validateMoney(
  amount: unknown,
  currency: unknown,
  options: MoneyValidationOptions
): { money?: Money; issues: IngestionIssue[] } {
  const issues: IngestionIssue[] = [];

  if (amount === undefined || amount === null) {
    if (options.required) {
      issues.push({
        severity: "error",
        code: "normalize.missing_price",
        message: "Price is required",
        retailerId: options.retailerId,
        sourceId: options.sourceId,
        productId: options.productId,
        variantId: options.variantId,
        field: options.field,
      });
    }
    return { issues };
  }

  if (!isPositiveMoney(amount)) {
    issues.push({
      severity: "error",
      code: "normalize.invalid_price",
      message: "Price must be a positive number",
      retailerId: options.retailerId,
      sourceId: options.sourceId,
      productId: options.productId,
      variantId: options.variantId,
      field: options.field,
      details: { amount },
    });
    return { issues };
  }

  const normalizedCurrency = normalizeText(typeof currency === "string" ? currency : undefined);
  if (!normalizedCurrency) {
    issues.push({
      severity: options.required ? "error" : "warning",
      code: "normalize.missing_currency",
      message: "Currency is required when price is present",
      retailerId: options.retailerId,
      sourceId: options.sourceId,
      productId: options.productId,
      variantId: options.variantId,
      field: options.field,
    });
    return { issues };
  }

  return {
    money: {
      amount,
      currency: normalizedCurrency.toUpperCase(),
    },
    issues,
  };
}

function normalizeVariant(
  variant: RawVariant,
  ctx: NormalizeContext,
  productId: string,
  currencyFallback?: string
): { variant?: NormalizedVariantDraft; issues: IngestionIssue[] } {
  const issues: IngestionIssue[] = [];
  const variantId = normalizeText(variant.id);

  if (!variantId) {
    issues.push({
      severity: "error",
      code: "normalize.missing_variant_id",
      message: "Variant is missing required id",
      retailerId: ctx.retailerId,
      sourceId: ctx.sourceId,
      productId,
      field: "variants",
    });
    return { issues };
  }

  const priceResult = validateMoney(
    variant.price,
    variant.currency ?? currencyFallback,
    {
      required: false,
      field: "variant.price",
      productId,
      retailerId: ctx.retailerId,
      sourceId: ctx.sourceId,
      variantId,
    }
  );
  issues.push(...priceResult.issues);

  const imageUrl = normalizeUrl(variant.imageUrl);
  if (!imageUrl && typeof variant.imageUrl === "string") {
    issues.push({
      severity: "warning",
      code: "normalize.invalid_variant_image_url",
      message: "Variant imageUrl is invalid",
      retailerId: ctx.retailerId,
      sourceId: ctx.sourceId,
      productId,
      variantId,
      field: "variant.imageUrl",
      details: { value: variant.imageUrl },
    });
  }

  const url = normalizeUrl(variant.url);
  if (!url && typeof variant.url === "string") {
    issues.push({
      severity: "warning",
      code: "normalize.invalid_variant_url",
      message: "Variant url is invalid",
      retailerId: ctx.retailerId,
      sourceId: ctx.sourceId,
      productId,
      variantId,
      field: "variant.url",
      details: { value: variant.url },
    });
  }

  const normalizedVariant: NormalizedVariantDraft = {
    id: variantId,
    sku: normalizeText(variant.sku),
    name: normalizeText(variant.name),
    size: normalizeText(variant.size),
    color: normalizeText(variant.color),
    price: priceResult.money,
    imageUrl,
    url,
    inStock: typeof variant.inStock === "boolean" ? variant.inStock : undefined,
    attributes: variant.attributes,
  };

  return { variant: normalizedVariant, issues };
}

export function normalizeRawProduct(raw: RawProduct, ctx: NormalizeContext): NormalizeResult {
  const issues: IngestionIssue[] = [];
  const productId = raw.id;

  const title = normalizeText(raw.name);
  if (!title) {
    issues.push({
      severity: "error",
      code: "normalize.missing_name",
      message: "Product name is required",
      retailerId: ctx.retailerId,
      sourceId: ctx.sourceId,
      productId,
      field: "name",
    });
  }

  const productUrl = normalizeUrl(raw.productUrl);
  if (!productUrl) {
    issues.push({
      severity: "error",
      code: "normalize.invalid_product_url",
      message: "Product URL must be a valid http/https URL",
      retailerId: ctx.retailerId,
      sourceId: ctx.sourceId,
      productId,
      field: "productUrl",
      details: { value: raw.productUrl },
    });
  }

  const imageCandidates: string[] = [];
  if (Array.isArray(raw.imageUrls)) {
    imageCandidates.push(...raw.imageUrls);
  }
  if (typeof raw.imageUrl === "string") {
    imageCandidates.push(raw.imageUrl);
  }

  const normalizedImages = dedupePreserveOrder(
    imageCandidates
      .map((img) => {
        const normalized = normalizeUrl(img);
        if (!normalized) {
          issues.push({
            severity: "warning",
            code: "normalize.invalid_image_url",
            message: "Image URL must be a valid http/https URL",
            retailerId: ctx.retailerId,
            sourceId: ctx.sourceId,
            productId,
            field: "imageUrls",
            details: { value: img },
          });
        }
        return normalized;
      })
      .filter((img): img is string => Boolean(img))
  );

  if (normalizedImages.length === 0) {
    issues.push({
      severity: "error",
      code: "normalize.missing_image_urls",
      message: "At least one valid image URL is required",
      retailerId: ctx.retailerId,
      sourceId: ctx.sourceId,
      productId,
      field: "imageUrls",
    });
  }

  const priceResult = validateMoney(raw.price, raw.currency, {
    required: true,
    field: "price",
    productId,
    retailerId: ctx.retailerId,
    sourceId: ctx.sourceId,
  });
  issues.push(...priceResult.issues);

  const originalPriceResult = validateMoney(raw.originalPrice, raw.currency, {
    required: false,
    field: "originalPrice",
    productId,
    retailerId: ctx.retailerId,
    sourceId: ctx.sourceId,
  });
  issues.push(...originalPriceResult.issues);

  const variants: NormalizedVariantDraft[] = [];
  if (Array.isArray(raw.variants)) {
    raw.variants.forEach((variant) => {
      const result = normalizeVariant(variant, ctx, productId, raw.currency);
      issues.push(...result.issues);
      if (result.variant) {
        variants.push(result.variant);
      }
    });
  }

  const tags = normalizeStringArray(raw.tags);
  const colors = normalizeStringArray(raw.colors);
  const sizes = normalizeStringArray(raw.sizes);
  const categoryPath = normalizeText(raw.categoryPath);
  const brand = normalizeText(raw.brand);
  const description = normalizeText(raw.description);
  const gender = normalizeText(raw.gender);

  const price = priceResult.money;
  const hasFatalIssues =
    !title || !productUrl || !price || normalizedImages.length === 0;

  if (hasFatalIssues) {
    return { ok: false, issues };
  }

  const draft: NormalizedProductDraft = {
    sourceProductId: productId,
    retailerId: ctx.retailerId,
    sourceId: ctx.sourceId,
    title,
    brand,
    description,
    productUrl,
    imageUrls: normalizedImages,
    price,
    originalPrice: originalPriceResult.money,
    variants: variants.length > 0 ? variants : undefined,
  };

  if (tags) {
    draft.tags = tags;
  }
  if (colors) {
    draft.colors = colors;
  }
  if (sizes) {
    draft.sizes = sizes;
  }
  if (categoryPath) {
    draft.categoryPath = categoryPath;
  }
  if (gender) {
    draft.gender = gender;
  }
  if (typeof raw.inStock === "boolean") {
    draft.inStock = raw.inStock;
  }

  return { ok: true, draft, issues };
}
