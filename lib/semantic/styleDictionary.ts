// lib/semantic/styleDictionary.ts

export type StyleId =
  | "streetwear"
  | "minimal"
  | "athleisure"
  | "preppy"
  | "casual"
  | "smart-casual"
  | "y2k";

export type StyleCategory =
  | "everyday"
  | "going-out"
  | "loungewear"
  | "sports"
  | "work"
  | "school";

export type FitProfile = "slim" | "regular" | "relaxed" | "oversized";

export type ColorMood =
  | "neutral"
  | "earthy"
  | "dark"
  | "bright"
  | "pastel"
  | "high-contrast";

export type StyleDefinition = {
  id: StyleId;
  label: string;
  description: string;
  categories: StyleCategory[];
  typicalFits: FitProfile[];
  typicalColorMoods: ColorMood[];
  coreKeywords: string[];
  softKeywords: string[];
  avoidKeywords?: string[];
};

export const STYLE_DEFINITIONS: Record<StyleId, StyleDefinition> = {
  streetwear: {
    id: "streetwear",
    label: "Streetwear",
    description:
      "Loose silhouettes, hoodies, cargos, sneakers, and graphic pieces with an urban feel.",
    categories: ["everyday", "going-out", "school"],
    typicalFits: ["relaxed", "oversized"],
    typicalColorMoods: ["neutral", "earthy", "dark", "high-contrast"],
    coreKeywords: [
      "hoodie",
      "cargo",
      "graphic",
      "streetwear",
      "baggy",
      "oversized",
      "puffer",
      "sneaker",
      "jersey",
      "crewneck",
    ],
    softKeywords: ["logo", "boxy", "relaxed", "stacked"],
    avoidKeywords: ["blazer", "oxford", "chino", "polo"],
  },

  minimal: {
    id: "minimal",
    label: "Minimal",
    description:
      "Clean, simple pieces with neutral colors and sharp, unfussy silhouettes.",
    categories: ["everyday", "work", "school"],
    typicalFits: ["slim", "regular"],
    typicalColorMoods: ["neutral", "dark"],
    coreKeywords: [
      "essential",
      "basic tee",
      "plain tee",
      "clean",
      "minimal",
      "box tee",
      "ribbed",
    ],
    softKeywords: ["solid", "crew neck", "v-neck", "long sleeve"],
    avoidKeywords: ["graphic", "logo", "distressed", "ripped"],
  },

  athleisure: {
    id: "athleisure",
    label: "Athleisure",
    description:
      "Gym-adjacent fits: joggers, tech fabrics, sweats, and performance pieces worn casually.",
    categories: ["everyday", "sports", "loungewear"],
    typicalFits: ["regular", "relaxed"],
    typicalColorMoods: ["neutral", "dark", "earthy"],
    coreKeywords: [
      "jogger",
      "sweatpant",
      "sweat pant",
      "sweatshirt",
      "track",
      "performance",
      "training",
      "tech fleece",
      "active",
    ],
    softKeywords: ["stretch", "dry-fit", "moisture", "athletic"],
  },

  preppy: {
    id: "preppy",
    label: "Preppy",
    description:
      "Polos, chinos, sweaters, and neat layering for a clean, put-together look.",
    categories: ["school", "work", "everyday"],
    typicalFits: ["regular", "slim"],
    typicalColorMoods: ["neutral", "bright", "pastel"],
    coreKeywords: [
      "polo",
      "chino",
      "oxford",
      "button-down",
      "cardigan",
      "quarter zip",
      "quarter-zip",
    ],
    softKeywords: ["collar", "striped", "rugby"],
  },

  casual: {
    id: "casual",
    label: "Casual",
    description:
      "Everyday basics that work for almost any relaxed setting: tees, jeans, simple hoodies.",
    categories: ["everyday", "school", "loungewear"],
    typicalFits: ["regular", "relaxed"],
    typicalColorMoods: ["neutral", "earthy", "dark"],
    coreKeywords: ["tee", "t-shirt", "jean", "hoodie", "sweatshirt"],
    softKeywords: ["regular fit", "standard fit", "crew neck"],
  },

  "smart-casual": {
    id: "smart-casual",
    label: "Smart casual",
    description:
      "A half-step above casual: structured shirts, nicer pants, simple knitwear.",
    categories: ["going-out", "work", "school"],
    typicalFits: ["regular", "slim"],
    typicalColorMoods: ["neutral", "dark"],
    coreKeywords: [
      "button-up",
      "button-down",
      "knit",
      "blazer",
      "trouser",
      "chino",
    ],
    softKeywords: ["tailored", "structured"],
  },

  y2k: {
    id: "y2k",
    label: "Y2K / Vintage",
    description:
      "Throwback silhouettes, washes, and graphics pulled from late 90s / early 2000s aesthetics.",
    categories: ["going-out", "everyday"],
    typicalFits: ["relaxed", "oversized"],
    typicalColorMoods: ["bright", "high-contrast", "dark"],
    coreKeywords: ["y2k", "vintage", "retro", "flare", "low-rise", "graphic"],
    softKeywords: ["washed", "distressed", "ripped", "baggy"],
  },
};

export const ALL_STYLES: StyleId[] = Object.keys(
  STYLE_DEFINITIONS
) as StyleId[];
