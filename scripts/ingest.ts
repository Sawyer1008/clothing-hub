#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import process from "process";
import {
  createLocalJsonFeedSource,
  createHttpJsonFeedSource,
  createLocalCsvFeedSource,
} from "../lib/ingestion/sources/index.server";
import { createFileIngestionStore } from "../lib/ingestion/store/index.server";
import { runIngestion } from "../lib/ingestion/run/runIngestion";
import type { ProductSource } from "../lib/ingestion/sources/types";

type CliOptions = {
  feedPath?: string;
  outPath?: string;
  configPath?: string;
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--feed" && argv[i + 1]) {
      options.feedPath = argv[i + 1];
      i += 1;
    } else if (arg === "--out" && argv[i + 1]) {
      options.outPath = argv[i + 1];
      i += 1;
    } else if (arg === "--config" && argv[i + 1]) {
      options.configPath = argv[i + 1];
      i += 1;
    }
  }
  return options;
}

function formatIssueCounts(issuesLength: number, errorCount: number, warningCount: number) {
  return `${issuesLength} issues (${errorCount} errors, ${warningCount} warnings)`;
}

type SourceConfigEntry = {
  id?: string;
  type: "local_json" | "http_json" | "local_csv";
  retailerId?: string;
  sourceId?: string;
  filePath?: string;
  url?: string;
  timeoutMs?: number;
  enabled?: boolean;
  delimiter?: string;
  hasHeader?: boolean;
  columnMap?: Record<string, string>;
};

type SourceConfigFile = {
  version: number;
  sources: SourceConfigEntry[];
};

type CsvColumnMap = {
  sourceProductId: string;
  title: string;
  productUrl: string;
  imageUrl: string;
  price: string;
  brand?: string;
  description?: string;
  categoryPath?: string;
  additionalImageUrls?: string;
  currency?: string;
  availability?: string;
};

async function loadSourcesFromConfig(configPath: string): Promise<ProductSource[]> {
  const raw = await fs.readFile(configPath, "utf8");
  const parsed = JSON.parse(raw) as SourceConfigFile;
  if (parsed.version !== 1 || !Array.isArray(parsed.sources)) {
    throw new Error(`Invalid ingestion config at ${configPath}: version must be 1 and include sources array`);
  }

  const sources: ProductSource[] = [];
  const defaultLocalPath = path.resolve(process.cwd(), "data/ingestion/sources/local-seed.json");

  parsed.sources.forEach((entry, index) => {
    if (entry.enabled === false) return;
    const sourceId = entry.sourceId ?? entry.id ?? `${entry.type}-${index + 1}`;
    const retailerId = entry.retailerId ?? entry.type;

    if (entry.type === "local_json") {
      const filePath = path.resolve(process.cwd(), entry.filePath ?? defaultLocalPath);
      sources.push(
        createLocalJsonFeedSource({
          filePath,
          retailerId,
          sourceId,
        })
      );
    } else if (entry.type === "http_json") {
      if (!entry.url) {
        throw new Error(`Config source ${sourceId} is missing url`);
      }
      sources.push(
        createHttpJsonFeedSource({
          url: entry.url,
          retailerId,
          sourceId,
          timeoutMs: entry.timeoutMs,
        })
      );
    } else if (entry.type === "local_csv") {
      const filePath = path.resolve(
        process.cwd(),
        entry.filePath ?? "data/ingestion/sources/local-seed.csv"
      );
      const columnMap = entry.columnMap as Record<string, string> | undefined;
      const requiredColumns = [
        "sourceProductId",
        "title",
        "productUrl",
        "imageUrl",
        "price",
      ];
      if (
        !columnMap ||
        requiredColumns.some((key) => typeof columnMap[key] !== "string")
      ) {
        throw new Error(
          `Config source ${sourceId} is missing required columnMap fields: ${requiredColumns.join(
            ", "
          )}`
        );
      }
      sources.push(
        createLocalCsvFeedSource({
          filePath,
          retailerId,
          sourceId,
          delimiter: entry.delimiter,
          hasHeader: entry.hasHeader,
          columnMap: columnMap as CsvColumnMap,
        })
      );
    } else {
      throw new Error(`Unsupported source type: ${entry.type}`);
    }
  });

  return sources;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outPath = path.resolve(
    args.outPath ?? path.resolve(process.cwd(), "data/ingestion/output/catalog.v1.json")
  );

  let sources: ProductSource[];
  let feedDescription: string;

  const defaultConfigPath = path.resolve(process.cwd(), "data/ingestion/sources/sources.v1.json");
  const configPath = args.configPath
    ? path.resolve(process.cwd(), args.configPath)
    : defaultConfigPath;

  const configExists = await fs
    .access(configPath)
    .then(() => true)
    .catch(() => false);

  if (configExists) {
    sources = await loadSourcesFromConfig(configPath);
    feedDescription = `config:${configPath}`;
  } else {
    const feedPath = path.resolve(
      args.feedPath ?? path.resolve(process.cwd(), "data/ingestion/sources/local-seed.json")
    );
    sources = [createLocalJsonFeedSource({ filePath: feedPath })];
    feedDescription = feedPath;
  }

  const store = createFileIngestionStore({ catalogSnapshotPath: outPath });

  console.log(`Running ingestion...`);
  console.log(`- Sources: ${feedDescription}`);
  console.log(`- Output: ${outPath}`);

  const summary = await runIngestion({
    sources,
    store,
  });

  const errorCount = summary.issues.filter((issue) => issue.severity === "error").length;
  const warningCount = summary.issues.filter((issue) => issue.severity === "warning").length;
  const persisted = summary.persistedCount ?? 0;

  console.log(
    `Fetched ${summary.fetchedCount} raw, normalized ${summary.normalizedCount}, wrote ${persisted}`
  );
  console.log(formatIssueCounts(summary.issues.length, errorCount, warningCount));

  if (persisted === 0 || errorCount > 0) {
    console.error("Ingestion finished with errors; snapshot not written or empty.");
    process.exitCode = 1;
  } else {
    console.log("Ingestion completed.");
    process.exitCode = 0;
  }
}

main().catch((error) => {
  console.error("Ingestion failed:", error);
  process.exitCode = 1;
});
