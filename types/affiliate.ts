export enum AffiliateNetwork {
  impact = "impact",
  cj = "cj",
  rakuten = "rakuten",
  none = "none",
}

export type AffiliateProgramParams = {
  template?: string;
  [key: string]: unknown;
};

export type AffiliateProgram = {
  storeKey: string;
  enabled: boolean;
  network: AffiliateNetwork;
  params?: AffiliateProgramParams;
};

export type AffiliateProgramMap = Record<string, AffiliateProgram>;
