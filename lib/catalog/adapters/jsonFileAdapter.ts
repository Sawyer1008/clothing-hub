import fs from "fs";
import path from "path";
import process from "process";
import type { RawProduct } from "../../../types/rawProduct";
import type { CatalogAdapter } from "./types";

type JsonFeedItem = {
  externalId: string;
  title: string;
  brand?: string;
  description?: string;
  productUrl: string;
  imageUrl: string;
  imageUrls?: string[];
  price: number;
  originalPrice?: number;
  currency?: string;
  categoryPath?: string;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  gender?: string;
  inStock?: boolean;
};

type JsonFileAdapterOptions = {
  sourceName: string;
  sourceSlug: string;
};

function readFeedFile(feedPath: string): string {
  try {
    return fs.readFileSync(feedPath, "utf8");
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err && err.code === "ENOENT") {
      throw new Error(`Feed file not found: ${feedPath}`);
    }
    throw new Error(`Unable to read feed file: ${feedPath}`);
  }
}

function parseFeedItems(feedPath: string, contents: string): JsonFeedItem[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    throw new Error(`Feed file is not valid JSON: ${feedPath}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`Feed file must be a JSON array: ${feedPath}`);
  }
  return parsed as JsonFeedItem[];
}

function mapFeedItemToRaw(item: JsonFeedItem): RawProduct {
  return {
    id: item.externalId,
    name: item.title,
    brand: item.brand,
    description: item.description,
    imageUrl: item.imageUrl,
    imageUrls: item.imageUrls,
    productUrl: item.productUrl,
    price: item.price,
    originalPrice: item.originalPrice,
    currency: item.currency,
    categoryPath: item.categoryPath,
    colors: item.colors,
    sizes: item.sizes,
    tags: item.tags,
    gender: item.gender,
    inStock: item.inStock,
  };
}

export function createJsonFileAdapter(
  options: JsonFileAdapterOptions
): CatalogAdapter {
  const feedPath = path.resolve(
    process.cwd(),
    "data/feeds",
    `${options.sourceSlug}.json`
  );

  return {
    sourceName: options.sourceName,
    sourceSlug: options.sourceSlug,
    load() {
      const contents = readFeedFile(feedPath);
      const items = parseFeedItems(feedPath, contents);
      return items.map(mapFeedItemToRaw);
    },
  };
}
