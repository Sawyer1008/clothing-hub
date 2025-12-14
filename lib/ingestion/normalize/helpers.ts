// lib/ingestion/normalize/helpers.ts
// Shared pure helpers for normalization.

import type { Money } from "../types";

export function normalizeText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > 0 ? normalized : undefined;
}

export function normalizeUrl(value: unknown): string | undefined {
  const text = normalizeText(typeof value === "string" ? value : undefined);
  if (!text) {
    return undefined;
  }

  try {
    const url = new URL(text);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

export function dedupePreserveOrder<T>(values: T[]): T[] {
  const seen = new Set<T>();
  const result: T[] = [];

  values.forEach((value) => {
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  });

  return result;
}

export function normalizeStringArray(values: unknown): string[] | undefined {
  if (!Array.isArray(values)) {
    return undefined;
  }

  const normalized = dedupePreserveOrder(
    values
      .map((value) => normalizeText(value))
      .filter((value): value is string => Boolean(value))
  );

  return normalized.length > 0 ? normalized : undefined;
}

export function isPositiveMoney(amount: unknown): amount is Money["amount"] {
  return typeof amount === "number" && Number.isFinite(amount) && amount > 0;
}
