// lib/ingestion/run/runIngestion.ts
// Orchestrates ingestion from sources through normalization and finalization.

import type { ProductSource } from "../sources/types";
import { normalizeRawProduct } from "../normalize";
import { finalizeCatalogProduct } from "../finalize/finalizeCatalogProduct";
import type {
  CatalogSnapshotV1,
  IngestionStore,
} from "../store/types";
import type {
  IngestionIssue,
  IngestionRunSummary,
  NormalizeContext,
} from "../types";

type RunIngestionOptions = {
  sources: ProductSource[];
  store: IngestionStore;
  now?: Date;
};

export async function runIngestion(options: RunIngestionOptions): Promise<IngestionRunSummary> {
  const { sources, store } = options;
  const startedAt = (options.now ?? new Date()).toISOString();
  const issues: IngestionIssue[] = [];
  const finalizedProducts: CatalogSnapshotV1["products"] = [];
  const seenProductIds = new Set<string>();
  const summaryRetailerId =
    sources.length === 1 ? sources[0].retailerId : "multi";
  const summarySourceId = sources.length === 1 ? sources[0].sourceId : "multi";

  let fetchedCount = 0;
  let normalizedCount = 0;

  for (const source of sources) {
    const sourceResult = await source.listRawProducts();
    issues.push(...sourceResult.issues);

    const normalizeCtx: NormalizeContext = {
      sourceId: source.sourceId,
      retailerId: source.retailerId,
    };

    if (!sourceResult.ok) {
      continue;
    }

    fetchedCount += sourceResult.products.length;

    const sortedRaw = [...sourceResult.products].sort((a, b) =>
      a.id.localeCompare(b.id)
    );

    sortedRaw.forEach((raw) => {
      const normalized = normalizeRawProduct(raw, normalizeCtx);
      issues.push(...normalized.issues);
      if (!normalized.ok) {
        return;
      }
      normalizedCount += 1;

      const finalized = finalizeCatalogProduct(normalized.draft, normalizeCtx);
      issues.push(...finalized.issues);
      if (!finalized.ok) {
        return;
      }

      if (seenProductIds.has(finalized.product.id)) {
        issues.push({
          severity: "warning",
          code: "run.duplicate_product_id",
          message: "Duplicate product id encountered; keeping first instance",
          retailerId: normalizeCtx.retailerId,
          sourceId: normalizeCtx.sourceId,
          productId: finalized.product.id,
        });
        return;
      }

      seenProductIds.add(finalized.product.id);
      finalizedProducts.push(finalized.product);
    });
  }

  finalizedProducts.sort((a, b) => a.id.localeCompare(b.id));

  const snapshot: CatalogSnapshotV1 = {
    version: 1,
    generatedAt: (options.now ?? new Date()).toISOString(),
    sources: sources.map((source) => ({
      sourceId: source.sourceId,
      retailerId: source.retailerId,
    })),
    products: finalizedProducts,
  };

  if (snapshot.products.length === 0) {
    const finishedAt = (options.now ?? new Date()).toISOString();
    return {
      retailerId: summaryRetailerId,
      sourceId: summarySourceId,
      fetchedCount,
      normalizedCount,
      persistedCount: 0,
      issues: [
        ...issues,
        {
          severity: "error",
          code: "run.no_products",
          message: "Ingestion produced zero products; snapshot not written",
        },
      ],
      startedAt,
      finishedAt,
    };
  }

  await store.writeCatalogSnapshot(snapshot);

  const finishedAt = (options.now ?? new Date()).toISOString();

  return {
    retailerId: summaryRetailerId,
    sourceId: summarySourceId,
    fetchedCount,
    normalizedCount,
    persistedCount: snapshot.products.length,
    issues,
    startedAt,
    finishedAt,
  };
}
