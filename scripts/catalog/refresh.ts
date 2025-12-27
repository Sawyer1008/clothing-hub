#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import process from "process";
import type { RawProduct } from "../../types/rawProduct";
import { runCatalogRefresh } from "../../lib/catalog/engine/run";

type MockRetailerFeedItem = {
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

const SOURCE_NAME = "Mock Retailer";
const FEED_PATH = path.resolve(process.cwd(), "data/feeds/mockRetailer.sample.json");

async function loadFeedItems(filePath: string): Promise<MockRetailerFeedItem[]> {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Mock retailer feed must be a JSON array.");
  }
  return parsed as MockRetailerFeedItem[];
}

function mapFeedItemToRaw(item: MockRetailerFeedItem): RawProduct {
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

async function main() {
  const items = await loadFeedItems(FEED_PATH);
  const rawProducts = items.map(mapFeedItemToRaw);

  const result = await runCatalogRefresh(SOURCE_NAME, rawProducts, {
    allowedSourceNames: [SOURCE_NAME],
  });

  console.log(`Catalog snapshot written for ${SOURCE_NAME}.`);
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
