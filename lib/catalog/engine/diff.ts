import type { RawProduct } from "../../../types/rawProduct";

export type DiffCounts = {
  total: number;
  added: number;
  updated: number;
  missing: number;
};

export type DiffSummary = {
  counts: DiffCounts;
  addedIds?: string[];
  updatedIds?: string[];
  missingIds?: string[];
};

function optionalFieldEqual<T>(left: T | undefined, right: T | undefined): boolean {
  if (left === undefined && right === undefined) {
    return true;
  }
  return left === right;
}

function hasMeaningfulChange(current: RawProduct, previous: RawProduct): boolean {
  if (current.name !== previous.name) {
    return true;
  }
  if (current.productUrl !== previous.productUrl) {
    return true;
  }
  if (!optionalFieldEqual(current.price, previous.price)) {
    return true;
  }
  if (!optionalFieldEqual(current.imageUrl, previous.imageUrl)) {
    return true;
  }
  if (!optionalFieldEqual(current.categoryPath, previous.categoryPath)) {
    return true;
  }
  return false;
}

export function diffRawProducts(
  current: RawProduct[],
  previous: RawProduct[]
): DiffSummary {
  const previousById = new Map<string, RawProduct>();
  previous.forEach((item) => {
    previousById.set(item.id, item);
  });

  const addedIds: string[] = [];
  const updatedIds: string[] = [];
  const currentIds = new Set<string>();

  current.forEach((item) => {
    currentIds.add(item.id);
    const previousItem = previousById.get(item.id);
    if (!previousItem) {
      addedIds.push(item.id);
      return;
    }
    if (hasMeaningfulChange(item, previousItem)) {
      updatedIds.push(item.id);
    }
  });

  const missingIds: string[] = [];
  previous.forEach((item) => {
    if (!currentIds.has(item.id)) {
      missingIds.push(item.id);
    }
  });

  const counts: DiffCounts = {
    total: current.length,
    added: addedIds.length,
    updated: updatedIds.length,
    missing: missingIds.length,
  };

  return {
    counts,
    addedIds,
    updatedIds,
    missingIds,
  };
}
