// lib/ingestion/identity/deriveProductId.ts

import type { RetailerId } from "../types";
import { fnv1a32, stableKey, toIdSafeSegment } from "./idUtils";

type DeriveProductIdContext = {
  retailerId: RetailerId;
};

type ProductDraftIdentity = {
  sourceProductId: string;
};

export function deriveProductId(
  ctx: DeriveProductIdContext,
  draft: ProductDraftIdentity
): string {
  const retailerSeg = toIdSafeSegment(ctx.retailerId, 24);
  const sourceSeg = toIdSafeSegment(draft.sourceProductId, 48);
  const hash = fnv1a32(stableKey([ctx.retailerId, draft.sourceProductId]));
  return `p_${retailerSeg}_${sourceSeg}_${hash}`;
}
