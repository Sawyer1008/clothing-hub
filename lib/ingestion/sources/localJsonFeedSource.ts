// lib/ingestion/sources/localJsonFeedSource.ts
// Offline local JSON feed adapter for ingestion development.
import "server-only";

import fs from "fs/promises";
import path from "path";
import type {
  IngestionIssue,
  RawProduct,
  RetailerId,
  SourceId,
} from "../types";
import type { ListRawProductsResult, ProductSource } from "./types";
import { validateRawFeed } from "./validateRawFeed";

type LocalJsonFeedOptions = {
  filePath?: string;
  retailerId?: RetailerId;
  sourceId?: SourceId;
};

const DEFAULT_RETAILER_ID: RetailerId = "local-seed";
const DEFAULT_SOURCE_ID: SourceId = "local-json";
const DEFAULT_FILE_PATH = path.resolve(
  process.cwd(),
  "data/ingestion/sources/local-seed.json"
);

export function createLocalJsonFeedSource(
  options: LocalJsonFeedOptions = {}
): ProductSource {
  const retailerId = options.retailerId ?? DEFAULT_RETAILER_ID;
  const sourceId = options.sourceId ?? DEFAULT_SOURCE_ID;
  const filePath = path.resolve(options.filePath ?? DEFAULT_FILE_PATH);

  return {
    retailerId,
    sourceId,
    async listRawProducts(): Promise<ListRawProductsResult> {
      const issues: IngestionIssue[] = [];
      let parsed: unknown;

      try {
        const json = await fs.readFile(filePath, "utf8");
        parsed = JSON.parse(json);
      } catch (error) {
        issues.push({
          severity: "error",
          code: "local-json.read_failed",
          message: `Failed to read local JSON feed at ${filePath}`,
          retailerId,
          sourceId,
          details: { error: error instanceof Error ? error.message : String(error) },
        });
        return { ok: false, issues };
      }

      const { products, issues: validationIssues } = validateRawFeed(parsed, {
        retailerId,
        sourceId,
        codePrefix: "local-json",
        invalidFormatMessage: "Local JSON feed must be an array of products",
      });
      issues.push(...validationIssues);

      if (products.length === 0) {
        return { ok: false, issues };
      }

      return { ok: true, products, issues };
    },
  };
}
