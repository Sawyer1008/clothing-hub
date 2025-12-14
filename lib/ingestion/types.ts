// lib/ingestion/types.ts
// Core ingestion contracts used by all sources and normalizers.

import type { Product as ProductModel } from "@/types/product";

export type RetailerId = string;

export type SourceId = string;

export type RawVariant = {
  id: string;
  sku?: string;
  name?: string;
  size?: string;
  color?: string;
  price?: number;
  currency?: string;
  inStock?: boolean;
  imageUrl?: string;
  url?: string;
  attributes?: Record<string, string | number | boolean | null>;
};

export type RawProduct = {
  id: string;
  retailerId: RetailerId;
  sourceId?: SourceId;

  name: string;
  brand?: string;
  description?: string;

  productUrl?: string;
  imageUrl?: string;
  imageUrls?: string[];

  price?: number;
  originalPrice?: number;
  currency?: string;

  gender?: string;
  categoryPath?: string;

  colors?: string[];
  sizes?: string[];
  tags?: string[];

  inStock?: boolean;
  variants?: RawVariant[];

  metadata?: Record<string, unknown>;
};

export type Money = {
  amount: number;
  currency: string;
};

export type IngestionIssueSeverity = "info" | "warning" | "error";

export type IngestionIssue = {
  severity: IngestionIssueSeverity;
  code: string;
  message: string;
  retailerId?: RetailerId;
  sourceId?: SourceId;
  productId?: string;
  variantId?: string;
  field?: string;
  details?: Record<string, unknown>;
};

export type IngestionRunSummary = {
  retailerId: RetailerId;
  sourceId: SourceId;
  fetchedCount: number;
  normalizedCount: number;
  persistedCount?: number;
  issues: IngestionIssue[];
  startedAt: string;
  finishedAt?: string;
};

export type NormalizedVariantDraft = {
  id: string;
  sku?: string;
  name?: string;
  size?: string;
  color?: string;
  price?: Money;
  imageUrl?: string;
  url?: string;
  inStock?: boolean;
  attributes?: Record<string, string | number | boolean | null>;
};

export type NormalizedProductDraft = {
  sourceProductId: string;
  retailerId: RetailerId;
  sourceId: SourceId;
  title: string;
  brand?: string;
  description?: string;
  productUrl: string;
  imageUrls: string[];
  price: Money;
  originalPrice?: Money;
  variants?: NormalizedVariantDraft[];
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  categoryPath?: string;
  gender?: string;
  inStock?: boolean;
};

export type NormalizeContext = {
  sourceId: SourceId;
  retailerId: RetailerId;
};

export type NormalizeResult =
  | { ok: true; draft: NormalizedProductDraft; issues: IngestionIssue[] }
  | { ok: false; issues: IngestionIssue[] };

export type IngestedCatalogProduct = CatalogProduct & {
  ingestion: {
    retailerId: RetailerId;
    sourceId: SourceId;
    sourceProductId: string;
    productUrl: string;
  };
};

export type FinalizeResult =
  | { ok: true; product: CatalogProduct; issues: IngestionIssue[] }
  | { ok: false; issues: IngestionIssue[] };

export type CatalogProduct = ProductModel;
