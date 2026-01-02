import type { Product } from "@/types/product";
import type { AffiliateProgram, AffiliateProgramParams } from "@/types/affiliate";
import { AffiliateNetwork } from "@/types/affiliate";
import { affiliateConfigV1 } from "@/data/affiliates/affiliate-config.v1";
import { getStoreKeyForProduct } from "./storeKey";

type AffiliateBuilderInput = {
  product: Product;
  storeKey: string;
  directUrl: string;
  params?: AffiliateProgramParams;
};

type AffiliateBuilder = (input: AffiliateBuilderInput) => string | null;

const affiliateBuilders: Record<AffiliateNetwork, AffiliateBuilder> = {
  [AffiliateNetwork.impact]: buildTemplateAffiliateUrl,
  [AffiliateNetwork.cj]: buildTemplateAffiliateUrl,
  [AffiliateNetwork.rakuten]: buildTemplateAffiliateUrl,
  [AffiliateNetwork.none]: () => null,
};

function buildTemplateAffiliateUrl(input: AffiliateBuilderInput): string | null {
  const template =
    typeof input.params?.template === "string" ? input.params.template.trim() : "";
  if (!template) {
    return null;
  }

  const encodedUrl = encodeURIComponent(input.directUrl);

  return template
    .replaceAll("{{url}}", encodedUrl)
    .replaceAll("{{storeKey}}", input.storeKey)
    .replaceAll("{{productId}}", input.product.id);
}

function isAbsoluteHttpUrl(value: string | undefined): value is string {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function resolveDirectUrl(product: Product): string {
  if (isAbsoluteHttpUrl(product.url)) {
    return product.url;
  }

  return `/product/${product.id}`;
}

function resolveAffiliateUrl(
  program: AffiliateProgram,
  input: AffiliateBuilderInput
): string | null {
  if (!program.enabled) {
    return null;
  }

  const builder = affiliateBuilders[program.network];
  return builder ? builder(input) : null;
}

export function getOutboundUrl(
  product: Product
): { url: string; method: "affiliate" | "direct"; network?: AffiliateNetwork } {
  const storeKey = getStoreKeyForProduct(product);
  const directUrl = resolveDirectUrl(product);
  const program = affiliateConfigV1[storeKey];

  if (program) {
    const affiliateUrl = resolveAffiliateUrl(program, {
      product,
      storeKey,
      directUrl,
      params: program.params,
    });

    if (affiliateUrl) {
      return { url: affiliateUrl, method: "affiliate", network: program.network };
    }
  }

  return { url: directUrl, method: "direct" };
}
