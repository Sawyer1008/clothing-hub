#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function parseCatalogFile(catalogText) {
  const importRegex =
    /import\s+\{\s*([A-Za-z0-9_]+)\s*\}\s+from\s+"@\/data\/raw\/([^"]+)";/g;
  const imports = new Map();
  let match;
  while ((match = importRegex.exec(catalogText))) {
    imports.set(match[1], match[2]);
  }

  const sourceRegex = /{\s*name:\s*"([^"]+)"[\s\S]*?data:\s*([A-Za-z0-9_]+)/g;
  const sources = [];
  while ((match = sourceRegex.exec(catalogText))) {
    sources.push({ name: match[1], dataId: match[2] });
  }

  return { imports, sources };
}

function extractRawIds(rawFilePath) {
  const text = readFile(rawFilePath);
  const idRegex = /id:\s*"([^"]+)"/g;
  let match;
  const ids = [];
  while ((match = idRegex.exec(text))) {
    ids.push(match[1]);
  }
  return ids;
}

function main() {
  const catalogPath = path.join(__dirname, "..", "..", "lib", "catalog", "catalog.ts");
  const catalogText = readFile(catalogPath);
  const { imports, sources } = parseCatalogFile(catalogText);

  const derivedIdSet = new Set();

  for (const source of sources) {
    const importPath = imports.get(source.dataId);
    if (!importPath) {
      console.error(`Missing import for data identifier "${source.dataId}"`);
      process.exit(1);
    }

    const rawFilePath = path.join(__dirname, "..", "..", "data", "raw", `${importPath}.ts`);
    if (!fs.existsSync(rawFilePath)) {
      console.error(`Raw file does not exist for source "${source.name}": ${rawFilePath}`);
      process.exit(1);
    }

    const rawIds = extractRawIds(rawFilePath);
    const seenRawIds = new Set();
    for (const rawId of rawIds) {
      if (seenRawIds.has(rawId)) {
        console.error(`Duplicate RawProduct.id "${rawId}" in source "${source.name}"`);
        process.exit(1);
      }
      seenRawIds.add(rawId);

      const derivedId = `${source.name.toLowerCase()}-${rawId}`;
      if (derivedIdSet.has(derivedId)) {
        console.error(
          `Derived Product.id collision: "${derivedId}" (source "${source.name}", raw id "${rawId}")`
        );
        process.exit(1);
      }
      derivedIdSet.add(derivedId);
    }
  }

  console.log("Raw ID stability validation passed");
}

try {
  main();
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
