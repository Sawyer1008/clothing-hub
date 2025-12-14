// data/overrides/index.ts

import { abercrombieOverrides } from "./abercrombie";
import { adidasOverrides } from "./adidas";
import { aeropostaleOverrides } from "./aeropostale";
import { asosOverrides } from "./asos";
import { carharttOverrides } from "./carhartt";
import { forever21Overrides } from "./forever21";
import { gapOverrides } from "./gap";
import { hmOverrides } from "./hm";
import { hollisterOverrides } from "./hollister";
import { pacsunOverrides } from "./pacsun";
import { uniqloOverrides } from "./uniqlo";
import { urbanOutfittersOverrides } from "./urbanOutfitters";
import { zaraOverrides } from "./zara";
import type { ProductOverride } from "./types";

export const overridesBySource: Record<string, ProductOverride[]> = {
  Abercrombie: abercrombieOverrides,
  Adidas: adidasOverrides,
  "Aéropostale": aeropostaleOverrides,
  ASOS: asosOverrides,
  Carhartt: carharttOverrides,
  "Forever 21": forever21Overrides,
  Gap: gapOverrides,
  Zara: zaraOverrides,
  "H&M": hmOverrides,
  Hollister: hollisterOverrides,
  Uniqlo: uniqloOverrides,
  "Urban Outfitters": urbanOutfittersOverrides,
  PacSun: pacsunOverrides,
};

export function buildOverrideMap(
  overrides: ProductOverride[]
): Map<ProductOverride["id"], ProductOverride> {
  return new Map(overrides.map((override) => [override.id, override]));
}
