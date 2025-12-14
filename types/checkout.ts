import type { Product } from "./product";

export type StoreKey =
  | "abercrombie"
  | "adidas"
  | "aeropostale"
  | "asos"
  | "carhartt"
  | "forever21"
  | "gap"
  | "zara"
  | "nike"
  | "hollister"
  | "urbanoutfitters"
  | "hm"
  | "uniqlo"
  | "pacsun"
  | "unknown";

export type CheckoutLineItem = {
  product: Product;
  quantity: number;
};

export type StoreCapabilities = {
  supportsProductDeepLink: boolean;
  supportsCartDeepLink: boolean;
  supportsEmbeddedCheckout: boolean;
  supportsAssistedAutofill: boolean;
};

export type StoreUrlBuilders = {
  buildProductUrl: (product: Product) => string;
  buildStorefrontUrl?: () => string;
};

export type StoreConfig = {
  storeKey: StoreKey;
  displayName: string;
  capabilities: StoreCapabilities;
  urlBuilders?: StoreUrlBuilders;
};

export type CheckoutAction =
  | {
      type: "open-product";
      label: string;
      url: string;
      productId: string;
    }
  | {
      type: "open-storefront";
      label: string;
      url: string;
    }
  | {
      type: "copy-list";
      label: string;
      payload: string;
    };

export type CheckoutPlan = {
  primaryAction: CheckoutAction;
  secondaryActions: CheckoutAction[];
  fallbackChecklist: string[];
  disclaimers: string[];
};

