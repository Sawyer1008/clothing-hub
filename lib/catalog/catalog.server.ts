// lib/catalog/catalog.server.ts
import "server-only";

import type { Product } from "@/types/product";
import { getAllProducts as getAllProductsPhase2 } from "./catalog";
import {
  getDefaultCatalogSnapshotPath,
  readCatalogSnapshotV1,
} from "@/lib/ingestion/store/index.server";

const useIngested =
  process.env.CH_USE_INGESTED_CATALOG === "1" ||
  process.env.CH_USE_INGESTED_CATALOG === "true";

export function getAllProducts(): Product[] {
  if (!useIngested) {
    return getAllProductsPhase2();
  }

  const snapshotPath = getDefaultCatalogSnapshotPath();
  const snapshot = readCatalogSnapshotV1(snapshotPath);
  if (!snapshot) {
    throw new Error(
      `Ingested catalog snapshot not found at ${snapshotPath}. Run \`npm run ingest\` to generate it, or unset CH_USE_INGESTED_CATALOG.`
    );
  }
  return snapshot.products;
}

export function findProductById(id: string): Product | undefined {
  const all = getAllProducts();
  return all.find((p) => p.id === id);
}
