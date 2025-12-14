// lib/ingestion/sources/types.ts
// Contracts for ingestion sources.

import type { IngestionIssue, RawProduct, RetailerId, SourceId } from "../types";

export type ListRawProductsResult =
  | { ok: true; products: RawProduct[]; issues: IngestionIssue[] }
  | { ok: false; issues: IngestionIssue[] };

export interface ProductSource {
  sourceId: SourceId;
  retailerId: RetailerId;
  listRawProducts: () => Promise<ListRawProductsResult>;
}
