// data/overrides/types.ts

import type { RawProduct } from "@/types/rawProduct";

// Overrides patch specific RawProduct fields without editing the source data.
export type ProductOverride = {
  id: RawProduct["id"];
} & Partial<Omit<RawProduct, "id">>;
