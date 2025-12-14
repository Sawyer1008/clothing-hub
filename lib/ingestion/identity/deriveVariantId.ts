// lib/ingestion/identity/deriveVariantId.ts

import { fnv1a32, stableKey, toIdSafeSegment } from "./idUtils";

export function deriveVariantId(productId: string, variantKey: string): string {
  const variantSeg = toIdSafeSegment(variantKey, 32);
  const hash = fnv1a32(stableKey([productId, variantKey]));
  return `v_${productId}_${variantSeg}_${hash}`;
}
