// lib/ingestion/store/types.ts
// Contracts for persisting catalog snapshots.

import type { CatalogProduct, RetailerId, SourceId } from "../types";

export type CatalogSnapshotV1 = {
  version: 1;
  generatedAt: string;
  sources: Array<{ sourceId: SourceId; retailerId: RetailerId }>;
  products: CatalogProduct[];
};

export interface IngestionStore {
  writeCatalogSnapshot: (snapshot: CatalogSnapshotV1) => Promise<void>;
  readCatalogSnapshot?: () => Promise<CatalogSnapshotV1 | null>;
}

export function parseCatalogSnapshotV1(
  json: string,
  sourcePath: string
): CatalogSnapshotV1 {
  try {
    const parsed = JSON.parse(json) as CatalogSnapshotV1;
    assertValidSnapshotV1(parsed);
    return parsed;
  } catch (error) {
    throw new Error(
      `Invalid catalog snapshot at ${sourcePath}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export function assertValidSnapshotV1(snapshot: CatalogSnapshotV1): void {
  if (!snapshot || typeof snapshot !== "object") {
    throw new Error("Snapshot must be an object");
  }

  if (snapshot.version !== 1) {
    throw new Error("Snapshot version must be 1");
  }

  if (typeof snapshot.generatedAt !== "string") {
    throw new Error("Snapshot generatedAt must be a string");
  }

  if (!Array.isArray(snapshot.products)) {
    throw new Error("Snapshot products must be an array");
  }

  snapshot.products.forEach((product, index) => {
    if (
      !product ||
      typeof product !== "object" ||
      typeof (product as { id?: unknown }).id !== "string"
    ) {
      throw new Error(`Snapshot product at index ${index} is missing a string id`);
    }
  });
}
