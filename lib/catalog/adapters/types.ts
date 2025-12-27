import type { RawProduct } from "../../../types/rawProduct";

// Adapter contract:
// - Preserve external IDs as raw.id.
// - Do zero validation or normalization.
// - Pure + deterministic (local-only, sync reads).
export type CatalogAdapter = {
  sourceName: string;
  sourceSlug: string;
  load: () => RawProduct[];
};
