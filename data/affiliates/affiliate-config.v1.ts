import type { AffiliateProgramMap } from "@/types/affiliate";
import affiliateConfigV1Data from "./affiliate-config.v1.json";

// v1 rule: disabled stores are omitted. Included entries must set enabled: true.
export const affiliateConfigV1: AffiliateProgramMap =
  affiliateConfigV1Data as AffiliateProgramMap;
