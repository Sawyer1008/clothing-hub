// lib/ingestion/sources/httpJsonFeedSource.ts
// HTTP JSON feed adapter using fetch or https fallback.
import "server-only";

import https from "https";
import type { IngestionIssue, RawProduct, RetailerId, SourceId } from "../types";
import type { ListRawProductsResult, ProductSource } from "./types";
import { validateRawFeed } from "./validateRawFeed";

type HttpJsonFeedOptions = {
  url: string;
  retailerId: RetailerId;
  sourceId: SourceId;
  timeoutMs?: number;
};

function fetchWithHttps(url: string, timeoutMs?: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode}`));
        res.resume();
        return;
      }

      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => resolve(data));
    });

    req.on("error", reject);

    if (timeoutMs) {
      req.setTimeout(timeoutMs, () => {
        req.destroy(new Error("Request timed out"));
      });
    }
  });
}

async function fetchJsonText(url: string, timeoutMs?: number): Promise<string> {
  if (typeof fetch === "function") {
    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : undefined;
    const timer =
      controller && timeoutMs
        ? setTimeout(() => controller.abort(), timeoutMs)
        : null;

    try {
      const response = await fetch(url, {
        signal: controller?.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.text();
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  return fetchWithHttps(url, timeoutMs);
}

export function createHttpJsonFeedSource(options: HttpJsonFeedOptions): ProductSource {
  const { url, retailerId, sourceId, timeoutMs } = options;
  const codePrefix = "http-json";

  return {
    retailerId,
    sourceId,
    async listRawProducts(): Promise<ListRawProductsResult> {
      const issues: IngestionIssue[] = [];
      let parsed: unknown;

      try {
        const jsonText = await fetchJsonText(url, timeoutMs);
        parsed = JSON.parse(jsonText);
      } catch (error) {
        issues.push({
          severity: "error",
          code: `${codePrefix}.fetch_failed`,
          message: `Failed to fetch JSON feed from ${url}`,
          retailerId,
          sourceId,
          details: { error: error instanceof Error ? error.message : String(error) },
        });
        return { ok: false, issues };
      }

      const { products, issues: validationIssues } = validateRawFeed(parsed, {
        retailerId,
        sourceId,
        codePrefix,
        invalidFormatMessage: "HTTP JSON feed must be an array of products",
      });
      issues.push(...validationIssues);

      if (products.length === 0) {
        return { ok: false, issues };
      }

      return { ok: true, products: products as RawProduct[], issues };
    },
  };
}
