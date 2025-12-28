// lib/catalog/catalog.ts

import type { Product } from "@/types/product";
import type { RawProduct } from "@/types/rawProduct";
// Legacy manual seed list used for curated or hard-coded products.
// All user-facing flows (catalog, search, cart, saved, stylist, assistant, product pages)
// should read from getAllProducts(), which merges raw sources, overrides, and normalizers.
import { products as manualProducts } from "@/data/products";
import { abercrombieRaw } from "@/data/raw/abercrombie";
import { adidasRaw } from "@/data/raw/adidas";
import { aeropostaleRaw } from "@/data/raw/aeropostale";
import { asosRaw } from "@/data/raw/asos";
import { carharttRaw } from "@/data/raw/carhartt";
import { forever21Raw } from "@/data/raw/forever21";
import { gapRaw } from "@/data/raw/gap";
import { zaraRaw } from "@/data/raw/zara";
import { nikeRaw } from "@/data/raw/nike";
import { hollisterRaw } from "@/data/raw/hollister";
import { urbanOutfittersRaw } from "@/data/raw/urbanOutfitters";
import { hmRaw } from "@/data/raw/hm";
import { uniqloRaw } from "@/data/raw/uniqlo";
import { pacsunRaw } from "@/data/raw/pacsun";
import { levisRaw } from "@/data/raw/levis";
import { madewellRaw } from "@/data/raw/madewell";
import { jcrewRaw } from "@/data/raw/jcrew";
import { newBalanceRaw } from "@/data/raw/newBalance";
import { reformationRaw } from "@/data/raw/reformation";
import mockRetailerSnapshot from "@/data/snapshots/mock-retailer/latest.json";
import mockRetailer2Snapshot from "@/data/snapshots/mock-retailer-2/latest.json";
import cedarLoomSnapshot from "@/data/snapshots/cedar-loom/latest.json";
import { buildOverrideMap, overridesBySource } from "@/data/overrides";
import { ingestRawProducts } from "./ingest";

const SNAPSHOT_SOURCES = ["mock-retailer", "mock-retailer-2", "cedar-loom"] as const;
type SnapshotSourceSlug = (typeof SNAPSHOT_SOURCES)[number];

type SnapshotPayload = {
  sourceName?: string;
  raw?: RawProduct[];
};

const SNAPSHOT_PAYLOADS: Record<SnapshotSourceSlug, unknown> = {
  "mock-retailer": mockRetailerSnapshot,
  "mock-retailer-2": mockRetailer2Snapshot,
  "cedar-loom": cedarLoomSnapshot,
};

// Define all raw sources here so it's easy to add new brands later.
const rawSources = [
  {
    name: "Abercrombie",
    type: "manual" as const,
    data: abercrombieRaw,
  },
  {
    name: "Adidas",
    type: "manual" as const,
    data: adidasRaw,
  },
  {
    name: "Aéropostale",
    type: "manual" as const,
    data: aeropostaleRaw,
  },
  {
    name: "ASOS",
    type: "manual" as const,
    data: asosRaw,
  },
  {
    name: "Carhartt",
    type: "manual" as const,
    data: carharttRaw,
  },
  {
    name: "Forever 21",
    type: "manual" as const,
    data: forever21Raw,
  },
  {
    name: "Gap",
    type: "manual" as const,
    data: gapRaw,
  },
  {
    name: "Zara",
    type: "manual" as const,
    data: zaraRaw,
  },
  {
    name: "Nike",
    type: "manual" as const,
    data: nikeRaw,
  },
  {
    name: "Hollister",
    type: "manual" as const,
    data: hollisterRaw,
  },
  {
    name: "Urban Outfitters",
    type: "manual" as const,
    data: urbanOutfittersRaw,
  },
  {
    name: "H&M",
    type: "manual" as const,
    data: hmRaw,
  },
  {
    name: "Uniqlo",
    type: "manual" as const,
    data: uniqloRaw,
  },
  {
    name: "PacSun",
    type: "manual" as const,
    data: pacsunRaw,
  },
  {
    name: "Levis",
    type: "manual" as const,
    data: levisRaw,
  },
  {
    name: "Madewell",
    type: "manual" as const,
    data: madewellRaw,
  },
  {
    name: "J.Crew",
    type: "manual" as const,
    data: jcrewRaw,
  },
  {
    name: "New Balance",
    type: "manual" as const,
    data: newBalanceRaw,
  },
  {
    name: "Reformation",
    type: "manual" as const,
    data: reformationRaw,
  },
];

function loadSnapshotSources(): Array<{
  name: string;
  type: "manual";
  data: RawProduct[];
}> {
  const sources: Array<{ name: string; type: "manual"; data: RawProduct[] }> = [];

  for (const slug of SNAPSHOT_SOURCES) {
    const snapshotPath = `data/snapshots/${slug}/latest.json`;
    try {
      const payload = SNAPSHOT_PAYLOADS[slug];
      if (!payload || typeof payload !== "object") {
        throw new Error("Snapshot payload is empty.");
      }

      const { sourceName, raw } = payload as SnapshotPayload;
      if (!sourceName || typeof sourceName !== "string") {
        throw new Error("Snapshot payload is missing sourceName.");
      }
      if (!Array.isArray(raw)) {
        throw new Error("Snapshot payload is missing raw array.");
      }

      sources.push({
        name: sourceName,
        type: "manual",
        data: raw,
      });
    } catch (error) {
      console.warn(
        `[catalog] Failed to load snapshot source "${slug}" from ${snapshotPath}.`,
        error
      );
    }
  }

  return sources;
}

// Merge per-brand overrides onto raw items before sending them through ingest.
function applyOverridesToSource(
  rawProducts: RawProduct[],
  sourceName: string
): RawProduct[] {
  const overrides = overridesBySource[sourceName];
  if (!overrides || overrides.length === 0) {
    return rawProducts;
  }

  const overrideMap = buildOverrideMap(overrides);

  return rawProducts.map((raw) => {
    const override = overrideMap.get(raw.id);
    if (!override) {
      return raw;
    }

    return {
      ...raw,
      ...override,
      id: raw.id,
    };
  });
}

// Ingest all raw sources into normalized Products.
const snapshotSources = loadSnapshotSources();
const ingestedProducts: Product[] = [...rawSources, ...snapshotSources].flatMap(
  (source) => {
    const withOverrides = applyOverridesToSource(source.data, source.name);

    return ingestRawProducts(withOverrides, source.name, source.type);
  }
);

// Our full catalog is: manual items + ingested items.
// Later this will also include DB rows, more brands, etc.
const allProductsInternal: Product[] = [
  ...manualProducts,
  ...ingestedProducts,
];

export function getAllProducts(): Product[] {
  return allProductsInternal;
}

export function findProductById(id: string): Product | undefined {
  const all = getAllProducts();
  return all.find((p) => p.id === id);
}
