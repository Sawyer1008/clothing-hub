export type StylistRequest = {
  prompt: string;
  maxBudget?: number;
  userPrefs?: Record<string, unknown>;
};

export type StylistResponse = {
  explanation: string;
  primaryOutfit: string[];
  alternates?: string[];
};
