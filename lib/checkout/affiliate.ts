import type { Product } from "@/types/product";
import { getOutboundUrl } from "./outbound";

export { getOutboundUrl } from "./outbound";

export function getAffiliateUrl(product: Product): string {
  return getOutboundUrl(product).url;
}
