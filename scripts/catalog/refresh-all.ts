#!/usr/bin/env node
import { createJsonFileAdapter } from "../../lib/catalog/adapters/jsonFileAdapter";
import type { CatalogAdapter } from "../../lib/catalog/adapters/types";
import { runCatalogRefresh } from "../../lib/catalog/engine/run";

const adapters: CatalogAdapter[] = [
  createJsonFileAdapter({
    sourceName: "Mock Retailer",
    sourceSlug: "mockRetailer.sample",
  }),
];

type AdapterResult = {
  adapter: CatalogAdapter;
  status: "OK" | "FAILED";
  result?: Awaited<ReturnType<typeof runCatalogRefresh>>;
  error?: string;
};

async function runAdapter(adapter: CatalogAdapter): Promise<AdapterResult> {
  try {
    const rawProducts = adapter.load();
    const result = await runCatalogRefresh(adapter.sourceName, rawProducts, {
      allowedSourceNames: [adapter.sourceName],
    });
    return { adapter, status: "OK", result };
  } catch (error) {
    return {
      adapter,
      status: "FAILED",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function printSummary(summary: AdapterResult) {
  const sourceSlug = summary.result?.sourceSlug ?? summary.adapter.sourceSlug;
  console.log(`Source ${sourceSlug}: ${summary.status}`);

  if (summary.status === "OK" && summary.result) {
    const counts = summary.result.diffSummary.counts;
    console.log(
      `- Added: ${counts.added}, Updated: ${counts.updated}, Missing: ${counts.missing}`
    );
    console.log(`- Snapshot: ${summary.result.snapshotPath}`);
    console.log(`- Latest: ${summary.result.latestPath}`);
    return;
  }

  if (summary.error) {
    console.log(`- Error: ${summary.error}`);
  }
}

async function main() {
  const summaries: AdapterResult[] = [];

  for (const adapter of adapters) {
    const summary = await runAdapter(adapter);
    summaries.push(summary);
    printSummary(summary);
  }

  if (summaries.some((summary) => summary.status === "FAILED")) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
