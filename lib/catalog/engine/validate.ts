import type { RawProduct } from "../../../types/rawProduct";

export type ValidationOptions = {
  allowedSourceNames: string[];
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateRawProducts(
  sourceName: string,
  raw: RawProduct[],
  opts?: ValidationOptions
): void {
  const allowedSourceNames = opts?.allowedSourceNames ?? [];
  if (!Array.isArray(allowedSourceNames) || allowedSourceNames.length === 0) {
    throw new Error("allowedSourceNames must be provided to validate source names.");
  }
  if (!allowedSourceNames.includes(sourceName)) {
    throw new Error(`Source "${sourceName}" is not in the allowed source list.`);
  }
  if (!Array.isArray(raw)) {
    throw new Error("Raw products must be an array.");
  }

  const seenIds = new Set<string>();

  raw.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Raw product at index ${index} is not an object.`);
    }

    if (!isNonEmptyString(item.id)) {
      throw new Error(`Invalid raw.id at index ${index}.`);
    }
    if (!isNonEmptyString(item.name)) {
      throw new Error(`Invalid raw.name for id "${item.id}" at index ${index}.`);
    }
    if (!isNonEmptyString(item.productUrl)) {
      throw new Error(`Invalid raw.productUrl for id "${item.id}" at index ${index}.`);
    }

    if (seenIds.has(item.id)) {
      throw new Error(`Duplicate raw.id "${item.id}" found for source "${sourceName}".`);
    }
    seenIds.add(item.id);

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(item.productUrl);
    } catch (error) {
      throw new Error(`Invalid productUrl for id "${item.id}": "${item.productUrl}".`);
    }
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error(
        `Unsupported productUrl protocol for id "${item.id}": "${parsedUrl.protocol}".`
      );
    }
  });
}
