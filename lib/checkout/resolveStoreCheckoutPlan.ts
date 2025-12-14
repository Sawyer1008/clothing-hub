import type {
  CheckoutAction,
  CheckoutLineItem,
  CheckoutPlan,
  StoreKey,
} from "@/types/checkout";
import { getAffiliateUrl } from "./affiliate";
import { getStoreRegistry } from "./storeRegistry";

type ResolveInput = {
  storeKey: StoreKey;
  storeName: string;
  items: CheckoutLineItem[];
};

function buildCopyListPayload(items: CheckoutLineItem[], buildProductUrl: (product: CheckoutLineItem["product"]) => string): string {
  if (items.length === 0) {
    return "";
  }

  const lines = items.map(
    (item) =>
      `${item.quantity} × ${item.product.name} — ${buildProductUrl(item.product)}`
  );
  return lines.join("\n");
}

export function resolveStoreCheckoutPlan(input: ResolveInput): CheckoutPlan {
  const registry = getStoreRegistry();
  const storeConfig =
    registry.get(input.storeKey) ?? registry.get("unknown");

  if (!storeConfig) {
    throw new Error("Store registry is missing the unknown fallback");
  }

  const buildProductUrl =
    storeConfig.urlBuilders?.buildProductUrl ?? getAffiliateUrl;
  const storefrontUrl = storeConfig.urlBuilders?.buildStorefrontUrl?.();

  const primaryItem = input.items[0];

  const fallbackPrimaryAction: CheckoutAction = storefrontUrl
    ? {
        type: "open-storefront",
        label: `Open ${storeConfig.displayName || input.storeName} storefront`,
        url: storefrontUrl,
      }
    : {
        type: "copy-list",
        label: `Copy list for ${input.storeName}`,
        payload: buildCopyListPayload(input.items, buildProductUrl),
      };

  const primaryAction: CheckoutAction =
    primaryItem && storeConfig.capabilities.supportsProductDeepLink
      ? {
          type: "open-product",
          label: `Open ${storeConfig.displayName} for ${primaryItem.product.name}`,
          url: buildProductUrl(primaryItem.product),
          productId: primaryItem.product.id,
        }
      : fallbackPrimaryAction;

  const productActions: CheckoutAction[] = input.items.map((item) => ({
    type: "open-product",
    label: `Open ${item.product.name}`,
    url: buildProductUrl(item.product),
    productId: item.product.id,
  }));

  const secondaryActions: CheckoutAction[] = [
    ...productActions,
    ...(storefrontUrl
      ? [
          {
            type: "open-storefront",
            label: `Open ${storeConfig.displayName || input.storeName} storefront`,
            url: storefrontUrl,
          } as CheckoutAction,
        ]
      : []),
    {
      type: "copy-list",
      label: `Copy list for ${input.storeName}`,
      payload: buildCopyListPayload(input.items, buildProductUrl),
    },
  ];

  const fallbackChecklist = [
    "Review each item’s size, color, and quantity before checkout.",
    "Check the store’s shipping costs, delivery window, and return policy.",
    "Complete payment on the store site to place your order.",
    "Return to Clothing Hub to update your cart after purchasing.",
  ];

  const disclaimers = [
    "Purchases happen on the store site.",
    "Clothing Hub does not process or verify payments.",
    "Order status and receipts are managed by the store.",
  ];

  return {
    primaryAction,
    secondaryActions,
    fallbackChecklist,
    disclaimers,
  };
}
