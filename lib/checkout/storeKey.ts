import type { Product } from "@/types/product";
import type { StoreKey } from "@/types/checkout";

const STORE_KEY_ALIASES: Record<string, StoreKey> = {
  abercrombie: "abercrombie",
  abercrombiefitch: "abercrombie",
  adidas: "adidas",
  aeropostale: "aeropostale",
  asos: "asos",
  carhartt: "carhartt",
  forever21: "forever21",
  foreverxxi: "forever21",
  gap: "gap",
  zara: "zara",
  nike: "nike",
  hollister: "hollister",
  urbanoutfitters: "urbanoutfitters",
  urbanoutfitter: "urbanoutfitters",
  hm: "hm",
  handm: "hm",
  hnm: "hm",
  levis: "levis" as StoreKey,
  madewell: "madewell" as StoreKey,
  jcrew: "jcrew" as StoreKey,
  newbalance: "newbalance" as StoreKey,
  reformation: "reformation" as StoreKey,
  cedarloom: "cedarloom" as StoreKey,
  driftwooddenim: "driftwooddenim" as StoreKey,
  solsticeactive: "solsticeactive" as StoreKey,
  rueatelier: "rueatelier" as StoreKey,
  mockretailer: "mockretailer" as StoreKey,
  mockretailer2: "mockretailer2" as StoreKey,
  uniqlo: "uniqlo",
  pacsun: "pacsun",
  pacificsunwear: "pacsun",
};

function normalizeSourceName(sourceName: string): string {
  return sourceName
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function toStoreKey(sourceName: string): StoreKey {
  const normalized = normalizeSourceName(sourceName);
  const matched = STORE_KEY_ALIASES[normalized];
  if (matched) {
    return matched;
  }

  return "unknown";
}

export function getStoreKeyForProduct(product: Product): StoreKey {
  const candidate = product.sourceName?.trim() || product.brand?.trim();
  if (!candidate) {
    return "unknown";
  }

  return toStoreKey(candidate);
}
