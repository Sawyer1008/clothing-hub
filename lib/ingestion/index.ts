// lib/ingestion/index.ts
// Public ingestion type exports (runtime sources are exported from their subpaths).

export * from "./types";
export type { ProductSource, ListRawProductsResult } from "./sources/types";
export { normalizeRawProduct } from "./normalize";
export * from "./identity";
export { finalizeCatalogProduct } from "./finalize";
