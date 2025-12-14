#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const allowedFields = new Set([
  "id",
  "name",
  "brand",
  "description",
  "imageUrl",
  "productUrl",
  "price",
  "currency",
  "gender",
  "categoryPath",
  "colors",
  "sizes",
  "tags",
  "popularityScore",
]);

const requiredFields = ["id", "name", "imageUrl", "productUrl", "price"];

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!value || !key.startsWith("--")) {
      console.error("Usage: node scripts/catalog/refresh-raw-from-json.js --in <raw.json> --out <data/raw/brand.ts> --export <exportName>");
      process.exit(1);
    }
    args[key.slice(2)] = value;
  }
  return args;
}

function validateItem(item, index) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw new Error(`Item at index ${index} is not an object`);
  }
  for (const field of requiredFields) {
    if (item[field] === undefined || item[field] === null) {
      throw new Error(`Missing required field "${field}" on item at index ${index}`);
    }
  }
  if (typeof item.id !== "string" || item.id.trim() === "") {
    throw new Error(`Invalid id at index ${index}`);
  }
  if (typeof item.name !== "string" || item.name.trim() === "") {
    throw new Error(`Invalid name at index ${index}`);
  }
  if (typeof item.imageUrl !== "string" || item.imageUrl.trim() === "") {
    throw new Error(`Invalid imageUrl at index ${index}`);
  }
  if (typeof item.productUrl !== "string" || item.productUrl.trim() === "") {
    throw new Error(`Invalid productUrl at index ${index}`);
  }
  if (typeof item.price !== "number" || Number.isNaN(item.price)) {
    throw new Error(`Invalid price at index ${index}`);
  }
}

function sanitizeItem(item) {
  const cleaned = {};
  for (const key of allowedFields) {
    if (item[key] !== undefined) {
      cleaned[key] = item[key];
    }
  }
  return cleaned;
}

function main() {
  const args = parseArgs(process.argv);
  const inputPath = args.in;
  const outputPath = args.out;
  const exportName = args.export;

  if (!inputPath || !outputPath || !exportName) {
    console.error("Usage: node scripts/catalog/refresh-raw-from-json.js --in <raw.json> --out <data/raw/brand.ts> --export <exportName>");
    process.exit(1);
  }

  const rawText = fs.readFileSync(inputPath, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    console.error("Failed to parse JSON input:", err.message);
    process.exit(1);
  }

  if (!Array.isArray(parsed)) {
    console.error("Input must be a JSON array of raw products");
    process.exit(1);
  }

  const seenIds = new Set();
  const cleanedItems = parsed.map((item, index) => {
    validateItem(item, index);
    if (seenIds.has(item.id)) {
      throw new Error(`Duplicate id "${item.id}" found in input`);
    }
    seenIds.add(item.id);
    return sanitizeItem(item);
  });

  const sorted = [...cleanedItems].sort((a, b) => a.id.localeCompare(b.id));
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  const contents =
    `import type { RawProduct } from "@/types/rawProduct";\n\n` +
    `export const ${exportName}: RawProduct[] = ${JSON.stringify(sorted, null, 2)};\n`;

  fs.writeFileSync(outputPath, contents, "utf8");
  console.log(`Wrote ${sorted.length} items to ${outputPath} as export "${exportName}"`);
}

try {
  main();
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
