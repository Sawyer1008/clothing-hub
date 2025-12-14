// lib/catalog/ingest.ts

import type { RawProduct } from "@/types/rawProduct";
import type { Product, ProductSource } from "@/types/product";
import {
  normalizeAbercrombieRawProduct,
  normalizeAdidasRawProduct,
  normalizeAeropostaleRawProduct,
  normalizeAsosRawProduct,
  normalizeCarharttRawProduct,
  normalizeForever21RawProduct,
  normalizeHMRawProduct,
  normalizeHollisterRawProduct,
  normalizeNikeRawProduct,
  normalizePacsunRawProduct,
  normalizeGapRawProduct,
  normalizeUniqloRawProduct,
  normalizeUrbanOutfittersRawProduct,
  normalizeZaraRawProduct,
} from "./brandNormalizers";
import {
  autoTagsFromRaw,
  mapCategory,
  normalizeBrand,
  normalizeColors,
  normalizeGender,
} from "./normalize";

// Route raw items through brand-specific normalizers before generic ingestion.
function normalizeRawProductForSource(raw: RawProduct, sourceName: string): RawProduct {
  switch (sourceName.toLowerCase()) {
    case "abercrombie":
      return normalizeAbercrombieRawProduct(raw);
    case "zara":
      return normalizeZaraRawProduct(raw);
    case "h&m":
    case "h & m":
      return normalizeHMRawProduct(raw);
    case "uniqlo":
      return normalizeUniqloRawProduct(raw);
    case "pacsun":
      return normalizePacsunRawProduct(raw);
    case "nike":
      return normalizeNikeRawProduct(raw);
    case "adidas":
      return normalizeAdidasRawProduct(raw);
    case "hollister":
      return normalizeHollisterRawProduct(raw);
    case "forever 21":
    case "forever21":
      return normalizeForever21RawProduct(raw);
    case "asos":
      return normalizeAsosRawProduct(raw);
    case "gap":
      return normalizeGapRawProduct(raw);
    case "aéropostale":
    case "aeropostale":
      return normalizeAeropostaleRawProduct(raw);
    case "urban outfitters":
      return normalizeUrbanOutfittersRawProduct(raw);
    case "carhartt":
      return normalizeCarharttRawProduct(raw);
    default:
      return raw;
  }
}

// Turn a list of RawProduct objects into clean Product objects.
// `sourceName` = brand/site like "Abercrombie"
// `sourceType` = "api" | "scrape" | "manual" for tracking later
export function ingestRawProducts(
  rawProducts: RawProduct[],
  sourceName: string,
  sourceType: ProductSource
): Product[] {
  const now = new Date().toISOString();

  return rawProducts.map<Product>((raw) => {
    const normalizedRaw = normalizeRawProductForSource(raw, sourceName);
    const brand = normalizeBrand(normalizedRaw.brand, sourceName);
    const gender = normalizeGender(normalizedRaw.gender);
    const { category, subcategory } = mapCategory(normalizedRaw.categoryPath, normalizedRaw.name);
    const colors = normalizeColors(normalizedRaw.colors);

    const tags = autoTagsFromRaw(normalizedRaw, category, subcategory);

    return {
      id: `${sourceName.toLowerCase()}-${normalizedRaw.id}`,
      source: sourceType,
      sourceName,
      sourceId: normalizedRaw.id,

      name: normalizedRaw.name,
      brand,
      description: normalizedRaw.description,

      images: [
        {
          url: normalizedRaw.imageUrl,
          alt: normalizedRaw.name,
        },
      ],
      url: normalizedRaw.productUrl,

      price: {
        amount: normalizedRaw.price,
        currency: normalizedRaw.currency ?? "USD",
      },

      gender,
      category,
      subcategory,

      colors,
      sizes: normalizedRaw.sizes ?? [],

      tags,
      inStock: true, // assume in stock; real pipeline will supply this
      popularityScore: normalizedRaw.popularityScore ?? 50,
      lastUpdated: now,

    };
  });
}
