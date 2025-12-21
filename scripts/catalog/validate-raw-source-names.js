#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractRawSourcesBlock(contents) {
  const match = contents.match(/const\s+rawSources\s*=\s*\[([\s\S]*?)\n\];/);
  if (!match) {
    throw new Error("Could not locate rawSources array in lib/catalog/catalog.ts");
  }
  return match[1];
}

function extractRawSourceNames(contents) {
  const block = extractRawSourcesBlock(contents);
  const names = [];
  const nameRegex = /name:\s*"([^"]+)"/g;
  let match;
  while ((match = nameRegex.exec(block))) {
    names.push(match[1]);
  }
  if (names.length === 0) {
    throw new Error("No rawSources names found in lib/catalog/catalog.ts");
  }
  return names;
}

function uniqueList(items) {
  const seen = new Set();
  const unique = [];
  for (const item of items) {
    if (!seen.has(item)) {
      seen.add(item);
      unique.push(item);
    }
  }
  return unique;
}

function main() {
  const catalogPath = path.resolve(__dirname, "../../lib/catalog/catalog.ts");
  const lockPath = path.resolve(
    __dirname,
    "../../data/curation/raw-source-names.lock.v1.json"
  );

  const catalogContents = readFile(catalogPath);
  const namesInCode = uniqueList(extractRawSourceNames(catalogContents));

  if (!fs.existsSync(lockPath)) {
    console.error(`Lock file not found: ${lockPath}`);
    process.exit(1);
  }

  const lockRaw = readFile(lockPath);
  let namesInLock;
  try {
    namesInLock = JSON.parse(lockRaw);
  } catch (error) {
    console.error("Failed to parse lock file JSON:", error.message || error);
    process.exit(1);
  }

  if (!Array.isArray(namesInLock)) {
    console.error("Lock file must be a JSON array of raw source names.");
    process.exit(1);
  }

  const uniqueLock = uniqueList(namesInLock);
  const missingInLock = namesInCode.filter((name) => !uniqueLock.includes(name));
  const missingInCode = uniqueLock.filter((name) => !namesInCode.includes(name));

  if (missingInLock.length > 0 || missingInCode.length > 0) {
    console.error("Raw source name lock mismatch detected.");
    if (missingInLock.length > 0) {
      console.error("missingInLock:");
      missingInLock.forEach((name) => console.error(`- ${name}`));
    }
    if (missingInCode.length > 0) {
      console.error("missingInCode:");
      missingInCode.forEach((name) => console.error(`- ${name}`));
    }
    process.exit(1);
  }

  console.log("Raw source names match lock file.");
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
