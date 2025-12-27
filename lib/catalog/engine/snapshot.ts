import fs from "fs/promises";
import path from "path";
import type { RawProduct } from "../../../types/rawProduct";
import type { DiffSummary } from "./diff";

export type SnapshotCounts = {
  total: number;
  added?: number;
  updated?: number;
  missing?: number;
};

export type SnapshotPayload = {
  sourceName: string;
  sourceSlug: string;
  generatedAt: string;
  counts: SnapshotCounts;
  diffSummary: DiffSummary;
  raw: RawProduct[];
};

export function slugSourceName(sourceName: string): string {
  const lower = sourceName.toLowerCase();
  const spaced = lower.replace(/\s+/g, "-");
  const cleaned = spaced.replace(/[^a-z0-9-]/g, "");
  const collapsed = cleaned.replace(/-+/g, "-");
  return collapsed.replace(/^-+|-+$/g, "");
}

export function formatSnapshotTimestamp(date: Date): string {
  const iso = date.toISOString();
  const noMillis = iso.replace(/\.\d{3}Z$/, "Z");
  return noMillis.replace(/:/g, "-");
}

export function getSnapshotDir(sourceSlug: string): string {
  return path.resolve(process.cwd(), "data/snapshots", sourceSlug);
}

export function getLatestSnapshotPath(sourceSlug: string): string {
  return path.join(getSnapshotDir(sourceSlug), "latest.json");
}

export async function writeSnapshot(
  payload: SnapshotPayload
): Promise<{ snapshotPath: string; latestPath: string }> {
  const snapshotDir = getSnapshotDir(payload.sourceSlug);
  await fs.mkdir(snapshotDir, { recursive: true });

  const snapshotFile = `${formatSnapshotTimestamp(new Date(payload.generatedAt))}.json`;
  const snapshotPath = path.join(snapshotDir, snapshotFile);
  const latestPath = path.join(snapshotDir, "latest.json");
  const serialized = `${JSON.stringify(payload, null, 2)}\n`;

  await fs.writeFile(snapshotPath, serialized, "utf8");
  await fs.writeFile(latestPath, serialized, "utf8");

  return { snapshotPath, latestPath };
}
