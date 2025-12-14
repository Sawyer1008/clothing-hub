// lib/semantic/queryParser.ts
import type { StyleId, ColorMood } from "./styleDictionary";

export type OccasionId =
  | "casual-day"
  | "school"
  | "work"
  | "gym"
  | "date"
  | "party"
  | "night-out"
  | "travel"
  | "cold-weather"
  | "warm-weather"
  | "rainy";

export type ParsedQuery = {
  originalText: string;
  gender?: "mens" | "womens" | "unisex" | "kids";
  maxPrice?: number;
  minPrice?: number;
  stylePreferences: StyleId[];
  colorMoods: ColorMood[];
  occasions: OccasionId[];
  wantsPieces: ("top" | "bottom" | "outerwear" | "footwear" | "accessory")[];
  rawKeywords: string[];
};

function toWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9$ ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function parsePrice(words: string[]): { maxPrice?: number; minPrice?: number } {
  let maxPrice: number | undefined;
  let minPrice: number | undefined;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    if (w.startsWith("$")) {
      const num = Number(w.slice(1));
      if (!isNaN(num)) {
        const prev = words[i - 1];
        if (prev === "under" || prev === "below" || prev === "max") {
          maxPrice = num;
        } else if (prev === "over" || prev === "above" || prev === "min") {
          minPrice = num;
        } else {
          maxPrice = num;
        }
      }
    } else if (/^\d+$/.test(w)) {
      const num = Number(w);
      const prev = words[i - 1];
      const prev2 = words[i - 2];

      if (
        prev === "under" ||
        prev === "below" ||
        prev === "max" ||
        prev2 === "under" ||
        prev2 === "below"
      ) {
        maxPrice = num;
      } else if (prev === "over" || prev === "above" || prev === "min") {
        minPrice = num;
      }
    }
  }

  return { maxPrice, minPrice };
}

function parseGender(words: string[]): ParsedQuery["gender"] {
  if (words.some((w) => ["men", "mens", "guy", "guys", "male"].includes(w))) {
    return "mens";
  }
  if (
    words.some((w) =>
      ["women", "womens", "girl", "girls", "female"].includes(w)
    )
  ) {
    return "womens";
  }
  return undefined;
}

function parseOccasions(words: string[]): OccasionId[] {
  const set = new Set<OccasionId>();

  if (words.some((w) => ["school", "class", "campus"].includes(w))) {
    set.add("school");
  }
  if (words.some((w) => ["work", "office", "job", "internship"].includes(w))) {
    set.add("work");
  }
  if (words.some((w) => ["gym", "workout", "lifting", "running"].includes(w))) {
    set.add("gym");
  }
  if (words.some((w) => ["date", "date-night"].includes(w))) {
    set.add("date");
  }
  if (words.some((w) => ["party", "club", "clubbing"].includes(w))) {
    set.add("party");
  }
  if (words.some((w) => ["night", "night-out", "bar"].includes(w))) {
    set.add("night-out");
  }
  if (words.some((w) => ["trip", "travel", "vacation", "flight"].includes(w))) {
    set.add("travel");
  }
  if (words.some((w) => ["cold", "winter", "freezing"].includes(w))) {
    set.add("cold-weather");
  }
  if (words.some((w) => ["hot", "summer", "heat"].includes(w))) {
    set.add("warm-weather");
  }
  if (words.some((w) => ["rain", "rainy", "storm", "stormy"].includes(w))) {
    set.add("rainy");
  }

  if (set.size === 0) {
    set.add("casual-day");
  }

  return Array.from(set);
}

function parseStyles(words: string[]): StyleId[] {
  const styles: StyleId[] = [];

  if (words.includes("streetwear")) styles.push("streetwear");
  if (words.includes("minimal") || words.includes("clean")) styles.push("minimal");
  if (words.includes("athleisure") || words.includes("sporty"))
    styles.push("athleisure");
  if (words.includes("preppy")) styles.push("preppy");
  if (words.includes("y2k") || words.includes("vintage")) styles.push("y2k");
  if (words.includes("smart") || words.includes("business"))
    styles.push("smart-casual");
  if (words.includes("casual") && !styles.includes("casual")) styles.push("casual");

  return styles;
}

function parseColorMoods(words: string[]): ColorMood[] {
  const moods = new Set<ColorMood>();

  if (words.includes("neutral") || words.includes("neutrals")) moods.add("neutral");
  if (words.includes("earth") || words.includes("earthy")) moods.add("earthy");
  if (words.includes("dark") || words.includes("all-black")) moods.add("dark");
  if (words.includes("bright") || words.includes("colorful")) moods.add("bright");
  if (words.includes("pastel") || words.includes("pastels")) moods.add("pastel");
  if (words.includes("contrast") || words.includes("high-contrast")) {
    moods.add("high-contrast");
  }

  return Array.from(moods);
}

function parsePieces(
  words: string[]
): ParsedQuery["wantsPieces"] {
  const pieces = new Set<ParsedQuery["wantsPieces"][number]>();

  if (words.some((w) => ["top", "hoodie", "shirt", "tee"].includes(w))) {
    pieces.add("top");
  }
  if (words.some((w) => ["pant", "pants", "jean", "cargos", "shorts"].includes(w))) {
    pieces.add("bottom");
  }
  if (words.some((w) => ["jacket", "coat", "puffer"].includes(w))) {
    pieces.add("outerwear");
  }
  if (words.some((w) => ["shoe", "sneaker", "boots"].includes(w))) {
    pieces.add("footwear");
  }
  if (words.some((w) => ["hat", "cap", "belt", "bag"].includes(w))) {
    pieces.add("accessory");
  }

  return Array.from(pieces);
}

export function parseQueryToIntent(text: string): ParsedQuery {
  const words = toWords(text);
  const { maxPrice, minPrice } = parsePrice(words);
  const gender = parseGender(words);
  const occasions = parseOccasions(words);
  const stylePreferences = parseStyles(words);
  const colorMoods = parseColorMoods(words);
  const wantsPieces = parsePieces(words);

  const rawKeywords = words.filter(
    (w) =>
      ![
        "outfit",
        "fit",
        "under",
        "below",
        "over",
        "above",
        "for",
        "a",
        "the",
        "and",
        "with",
      ].includes(w)
  );

  return {
    originalText: text,
    gender,
    maxPrice,
    minPrice,
    stylePreferences,
    colorMoods,
    occasions,
    wantsPieces,
    rawKeywords,
  };
}
