// lib/ingestion/sources/localCsvFeedSource.ts
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
import { parseCsv } from "./csv/parseCsv";

type ColumnMap = {
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

type LocalCsvFeedOptions = {
  filePath: string;
  retailerId: RetailerId;
  sourceId: SourceId;
  delimiter?: string;
  hasHeader?: boolean;
  columnMap: ColumnMap;
};

function parsePrice(
  value: string | undefined,
  currencyValue?: string
): { amount?: number; currency?: string } {
  if (!value) return {};

  const trimmed = value.trim();
  const parts = trimmed.split(/\s+/);
  let amountString = parts[0];
  let currency = currencyValue?.trim() || undefined;

  if (parts.length >= 2) {
    amountString = parts[0];
    currency = currency ?? parts[1];
  }

  const amount = Number.parseFloat(amountString);
  if (!Number.isFinite(amount)) {
    return {};
  }

  return {
    amount,
    currency: currency && currency.length > 0 ? currency : undefined,
  };
}

function asBoolean(value: string | undefined): boolean | undefined {
  if (!value) return undefined;
  const lower = value.trim().toLowerCase();
  if (lower === "true" || lower === "yes" || lower === "1") return true;
  if (lower === "false" || lower === "no" || lower === "0") return false;
  return undefined;
}

export function createLocalCsvFeedSource(options: LocalCsvFeedOptions): ProductSource {
  const {
    filePath,
    retailerId,
    sourceId,
    delimiter = ",",
    hasHeader = true,
    columnMap,
  } = options;
  const codePrefix = "local-csv";
  const resolvedPath = path.resolve(filePath);

  return {
    retailerId,
    sourceId,
    async listRawProducts(): Promise<ListRawProductsResult> {
      const issues: IngestionIssue[] = [];
      let csvText: string;

      try {
        csvText = await fs.readFile(resolvedPath, "utf8");
      } catch (error) {
        issues.push({
          severity: "error",
          code: `${codePrefix}.read_failed`,
          message: `Failed to read CSV feed at ${resolvedPath}`,
          retailerId,
          sourceId,
          details: { error: error instanceof Error ? error.message : String(error) },
        });
        return { ok: false, issues };
      }

      const rows = parseCsv(csvText, { delimiter });
      if (rows.length === 0) {
        issues.push({
          severity: "error",
          code: `${codePrefix}.empty`,
          message: "CSV feed is empty",
          retailerId,
          sourceId,
        });
        return { ok: false, issues };
      }

      const headerRow = hasHeader ? rows[0] : [];
      const dataRows = hasHeader ? rows.slice(1) : rows;

      const headerIndex = new Map<string, number>();
      headerRow.forEach((name, idx) => {
        headerIndex.set(name.trim(), idx);
      });

      function getValue(row: string[], columnName: string): string | undefined {
        if (hasHeader) {
          const idx = headerIndex.get(columnName);
          if (idx === undefined) return undefined;
          return row[idx]?.trim();
        }
        const idx = Number.parseInt(columnName, 10);
        if (Number.isInteger(idx) && idx >= 0 && idx < row.length) {
          return row[idx]?.trim();
        }
        return undefined;
      }

      const mappedProducts: RawProduct[] = [];

      dataRows.forEach((row, index) => {
        const productId = getValue(row, columnMap.sourceProductId);
        const title = getValue(row, columnMap.title);
        const productUrl = getValue(row, columnMap.productUrl);
        const imageUrl = getValue(row, columnMap.imageUrl);
        const priceValue = getValue(row, columnMap.price);
        const currencyValue = columnMap.currency ? getValue(row, columnMap.currency) : undefined;

        const priceParsed = parsePrice(priceValue, currencyValue);

        if (!productId || !title || !productUrl || !imageUrl || !priceParsed.amount) {
          issues.push({
            severity: "error",
            code: `${codePrefix}.missing_required`,
            message: "Row is missing required fields",
            retailerId,
            sourceId,
            details: { index, productId, title, productUrl, imageUrl, price: priceValue },
          });
          return;
        }

        const additionalImagesValue = columnMap.additionalImageUrls
          ? getValue(row, columnMap.additionalImageUrls)
          : undefined;
        const additionalImages =
          additionalImagesValue && additionalImagesValue.length > 0
            ? additionalImagesValue
                .split(/[|,]/)
                .map((v) => v.trim())
                .filter(Boolean)
            : undefined;

        const raw: RawProduct = {
          id: productId,
          retailerId,
          sourceId,
          name: title,
          brand: columnMap.brand ? getValue(row, columnMap.brand) : undefined,
          description: columnMap.description ? getValue(row, columnMap.description) : undefined,
          productUrl,
          imageUrl,
          imageUrls: additionalImages,
          price: priceParsed.amount,
          currency: priceParsed.currency,
          categoryPath: columnMap.categoryPath ? getValue(row, columnMap.categoryPath) : undefined,
          inStock: asBoolean(columnMap.availability ? getValue(row, columnMap.availability) : undefined),
        };

        mappedProducts.push(raw);
      });

      const { products, issues: validationIssues } = validateRawFeed(mappedProducts, {
        retailerId,
        sourceId,
        codePrefix,
        invalidFormatMessage: "CSV feed must map to an array of products",
      });
      issues.push(...validationIssues);

      if (products.length === 0) {
        return { ok: false, issues };
      }

      return { ok: true, products, issues };
    },
  };
}
