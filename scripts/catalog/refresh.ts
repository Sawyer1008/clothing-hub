#!/usr/bin/env node
import { createJsonFileAdapter } from "../../lib/catalog/adapters/jsonFileAdapter";
import { runCatalogRefresh } from "../../lib/catalog/engine/run";

const SOURCE_NAME = "Mock Retailer";
const SOURCE_SLUG = "mockRetailer.sample";

async function main() {
  const adapter = createJsonFileAdapter({
    sourceName: SOURCE_NAME,
    sourceSlug: SOURCE_SLUG,
  });
  const rawProducts = adapter.load();

  const result = await runCatalogRefresh(adapter.sourceName, rawProducts, {
    allowedSourceNames: [adapter.sourceName],
  });

  console.log(`Catalog snapshot written for ${adapter.sourceName}.`);
  console.log(`- Source slug: ${result.sourceSlug}`);
  console.log(
    `- Added: ${result.diffSummary.counts.added}, Updated: ${result.diffSummary.counts.updated}, Missing: ${result.diffSummary.counts.missing}`
  );
  console.log(`- Latest: ${result.latestPath}`);
  console.log(`- Snapshot: ${result.snapshotPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
