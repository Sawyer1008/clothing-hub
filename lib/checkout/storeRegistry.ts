import type { StoreConfig, StoreKey, StoreUrlBuilders } from "@/types/checkout";
import { getAffiliateUrl } from "./affiliate";

const defaultCapabilities = {
  supportsProductDeepLink: true,
  supportsCartDeepLink: false,
  supportsEmbeddedCheckout: false,
  supportsAssistedAutofill: false,
};

function withDefaultBuilders(builders?: Partial<StoreUrlBuilders>): StoreUrlBuilders {
  return {
    buildProductUrl: builders?.buildProductUrl ?? getAffiliateUrl,
    buildStorefrontUrl: builders?.buildStorefrontUrl,
  };
}

const STORE_CONFIGS: StoreConfig[] = [
  {
    storeKey: "abercrombie",
    displayName: "Abercrombie",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.abercrombie.com",
    }),
  },
  {
    storeKey: "adidas",
    displayName: "Adidas",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.adidas.com",
    }),
  },
  {
    storeKey: "aeropostale",
    displayName: "Aéropostale",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.aeropostale.com",
    }),
  },
  {
    storeKey: "asos",
    displayName: "ASOS",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.asos.com",
    }),
  },
  {
    storeKey: "carhartt",
    displayName: "Carhartt",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.carhartt.com",
    }),
  },
  {
    storeKey: "forever21",
    displayName: "Forever 21",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.forever21.com",
    }),
  },
  {
    storeKey: "gap",
    displayName: "Gap",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.gap.com",
    }),
  },
  {
    storeKey: "zara",
    displayName: "Zara",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.zara.com",
    }),
  },
  {
    storeKey: "nike",
    displayName: "Nike",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.nike.com",
    }),
  },
  {
    storeKey: "hollister",
    displayName: "Hollister",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.hollisterco.com",
    }),
  },
  {
    storeKey: "urbanoutfitters",
    displayName: "Urban Outfitters",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.urbanoutfitters.com",
    }),
  },
  {
    storeKey: "hm",
    displayName: "H&M",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.hm.com",
    }),
  },
  {
    storeKey: "uniqlo",
    displayName: "Uniqlo",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.uniqlo.com",
    }),
  },
  {
    storeKey: "pacsun",
    displayName: "PacSun",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.pacsun.com",
    }),
  },
  {
    storeKey: "levis" as StoreKey,
    displayName: "Levi's",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.levi.com",
    }),
  },
  {
    storeKey: "madewell" as StoreKey,
    displayName: "Madewell",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.madewell.com",
    }),
  },
  {
    storeKey: "jcrew" as StoreKey,
    displayName: "J.Crew",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.jcrew.com",
    }),
  },
  {
    storeKey: "newbalance" as StoreKey,
    displayName: "New Balance",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.newbalance.com",
    }),
  },
  {
    storeKey: "reformation" as StoreKey,
    displayName: "Reformation",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://www.thereformation.com",
    }),
  },
  {
    storeKey: "cedarloom" as StoreKey,
    displayName: "Cedar Loom",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://cedarloom.example",
    }),
  },
  {
    storeKey: "driftwooddenim" as StoreKey,
    displayName: "Driftwood Denim",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://driftwood.example",
    }),
  },
  {
    storeKey: "solsticeactive" as StoreKey,
    displayName: "Solstice Active",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://solstice.example",
    }),
  },
  {
    storeKey: "rueatelier" as StoreKey,
    displayName: "Rue Atelier",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://rueatelier.example",
    }),
  },
  {
    storeKey: "mockretailer" as StoreKey,
    displayName: "Mock Retailer",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://mockretailer.example",
    }),
  },
  {
    storeKey: "mockretailer2" as StoreKey,
    displayName: "Mock Retailer 2",
    capabilities: { ...defaultCapabilities },
    urlBuilders: withDefaultBuilders({
      buildStorefrontUrl: () => "https://mockretailer2.example",
    }),
  },
  {
    storeKey: "unknown",
    displayName: "Unknown Store",
    capabilities: { ...defaultCapabilities, supportsProductDeepLink: false },
    urlBuilders: withDefaultBuilders(),
  },
];

let registryCache: Map<StoreKey, StoreConfig> | null = null;

export function getStoreRegistry(): Map<StoreKey, StoreConfig> {
  if (registryCache) {
    return registryCache;
  }

  registryCache = new Map<StoreKey, StoreConfig>();

  for (const config of STORE_CONFIGS) {
    registryCache.set(config.storeKey, config);
  }

  return registryCache;
}
