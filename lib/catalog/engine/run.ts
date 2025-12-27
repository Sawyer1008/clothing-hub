import fs from "fs/promises";
import type { RawProduct } from "../../../types/rawProduct";
import { diffRawProducts } from "./diff";
import {
  getLatestSnapshotPath,
  slugSourceName,
  writeSnapshot,
  type SnapshotPayload,
  type SnapshotCounts,
} from "./snapshot";
import { validateRawProducts, type ValidationOptions } from "./validate";

type RunResult = {
  sourceSlug: string;
  generatedAt: string;
  counts: SnapshotCounts;
  diffSummary: SnapshotPayload["diffSummary"];
  latestPath: string;
  snapshotPath: string;
};

async function loadLatestSnapshot(
  sourceSlug: string
): Promise<SnapshotPayload | null> {
  const latestPath = getLatestSnapshotPath(sourceSlug);
  try {
    const contents = await fs.readFile(latestPath, "utf8");
    const parsed = JSON.parse(contents) as SnapshotPayload;
    if (!parsed || !Array.isArray(parsed.raw)) {
      throw new Error(`Latest snapshot at ${latestPath} is missing raw data.`);
    }
    return parsed;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err && err.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function runCatalogRefresh(
  sourceName: string,
  raw: RawProduct[],
  opts?: ValidationOptions
): Promise<RunResult> {
  validateRawProducts(sourceName, raw, opts);

  const sourceSlug = slugSourceName(sourceName);
  const latestSnapshot = await loadLatestSnapshot(sourceSlug);
  const previousRaw = latestSnapshot?.raw ?? [];
  const diffSummary = diffRawProducts(raw, previousRaw);

  const generatedAt = new Date().toISOString();
  const counts: SnapshotCounts = {
    total: raw.length,
    added: diffSummary.counts.added,
    updated: diffSummary.counts.updated,
    missing: diffSummary.counts.missing,
  };

  const payload: SnapshotPayload = {
    sourceName,
    sourceSlug,
    generatedAt,
    counts,
    diffSummary,
    raw,
  };

  const { snapshotPath, latestPath } = await writeSnapshot(payload);

  return {
    sourceSlug,
    generatedAt,
    counts,
    diffSummary,
    latestPath,
    snapshotPath,
  };
}
