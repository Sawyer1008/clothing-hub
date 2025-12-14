// lib/ingestion/store/index.ts
// Client-safe exports (types + pure helpers only).

export type { CatalogSnapshotV1, IngestionStore } from "./types";
export { assertValidSnapshotV1, parseCatalogSnapshotV1 } from "./types";
