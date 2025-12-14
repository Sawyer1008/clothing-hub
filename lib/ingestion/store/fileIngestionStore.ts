// lib/ingestion/store/fileIngestionStore.ts
// File-backed ingestion store with atomic snapshot writes.
import "server-only";

import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import type { CatalogSnapshotV1 } from "./types";
import { assertValidSnapshotV1, parseCatalogSnapshotV1 } from "./types";

type FileIngestionStoreOptions = {
  catalogSnapshotPath?: string;
};

const DEFAULT_SNAPSHOT_PATH = path.resolve(
  process.cwd(),
  "data/ingestion/output/catalog.v1.json"
);

export function getDefaultCatalogSnapshotPath(): string {
  return DEFAULT_SNAPSHOT_PATH;
}

async function atomicWrite(targetPath: string, content: string): Promise<void> {
  const dir = path.dirname(targetPath);
  await fs.mkdir(dir, { recursive: true });

  const tmpPath = `${targetPath}.tmp`;
  await fs.writeFile(tmpPath, content, "utf8");

  try {
    await fs.rename(tmpPath, targetPath);
  } catch (error) {
    try {
      await fs.rm(targetPath);
    } catch {
      // ignore
    }
    await fs.rename(tmpPath, targetPath);
  }
}

export function createFileIngestionStore(
  options: FileIngestionStoreOptions = {}
) {
  const catalogSnapshotPath = path.resolve(
    options.catalogSnapshotPath ?? DEFAULT_SNAPSHOT_PATH
  );

  return {
    async writeCatalogSnapshot(snapshot: CatalogSnapshotV1): Promise<void> {
      assertValidSnapshotV1(snapshot);
      const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
      await atomicWrite(catalogSnapshotPath, serialized);
    },

    async readCatalogSnapshot(): Promise<CatalogSnapshotV1 | null> {
      try {
        const json = await fs.readFile(catalogSnapshotPath, "utf8");
        return parseCatalogSnapshotV1(json, catalogSnapshotPath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return null;
        }
        throw error;
      }
    },
  };
}

export function readCatalogSnapshotV1(
  catalogSnapshotPath: string = DEFAULT_SNAPSHOT_PATH
): CatalogSnapshotV1 | null {
  try {
    const json = fsSync.readFileSync(catalogSnapshotPath, "utf8");
    return parseCatalogSnapshotV1(json, catalogSnapshotPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}
