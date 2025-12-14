import type { RawProduct } from "@/types/rawProduct";

// Brand-specific cleanup helpers to make RawProduct data consistent before ingesting.

type CategoryMap = Record<string, string>;

const normalizeCategoryKey = (categoryPath: string): string =>
  categoryPath.replace(/\s*>\s*/g, " > ").replace(/\s+/g, " ").trim().toLowerCase();

const normalizeCategoryPath = (
  categoryPath: string | undefined,
  categoryMap: CategoryMap
): string | undefined => {
  if (!categoryPath) return categoryPath;
  const key = normalizeCategoryKey(categoryPath);
  return categoryMap[key] ?? categoryPath.trim();
};

const cleanName = (name: string): string => name.trim().replace(/\s+/g, " ");

const cleanBrand = (brand?: string): string | undefined => {
  if (!brand) return brand;
  const cleaned = brand.trim();
  return cleaned.length > 0 ? cleaned : undefined;
};

const cleanDescription = (description?: string): string | undefined =>
  description?.trim();

const abercrombieCategories: CategoryMap = {
  "men > hoodies & sweatshirts": "Men > Hoodies & Sweatshirts",
  "men > jeans": "Men > Jeans",
};

export function normalizeAbercrombieRawProduct(raw: RawProduct): RawProduct {
  return {
    ...raw,
    name: cleanName(raw.name),
    brand: cleanBrand(raw.brand),
    description: cleanDescription(raw.description),
    categoryPath: normalizeCategoryPath(raw.categoryPath, abercrombieCategories),
  };
}

const zaraCategories: CategoryMap = {
  "man > trousers > cargo": "Men > Pants > Cargo",
  "man > jeans": "Men > Jeans",
};

export function normalizeZaraRawProduct(raw: RawProduct): RawProduct {
  return {
    ...raw,
    name: cleanName(raw.name),
    brand: cleanBrand(raw.brand),
    description: cleanDescription(raw.description),
    categoryPath: normalizeCategoryPath(raw.categoryPath, zaraCategories),
  };
}

const hmCategories: CategoryMap = {
  "men > hoodies & sweatshirts": "Men > Hoodies & Sweatshirts",
  "men > t-shirts": "Men > T-shirts",
};

export function normalizeHMRawProduct(raw: RawProduct): RawProduct {
  return {
    ...raw,
    name: cleanName(raw.name),
    brand: cleanBrand(raw.brand),
    description: cleanDescription(raw.description),
    categoryPath: normalizeCategoryPath(raw.categoryPath, hmCategories),
  };
}

const uniqloCategories: CategoryMap = {
  "men > sweatshirts": "Men > Sweatshirts",
  "men > t-shirts": "Men > T-shirts",
};

export function normalizeUniqloRawProduct(raw: RawProduct): RawProduct {
  return {
    ...raw,
    name: cleanName(raw.name),
    brand: cleanBrand(raw.brand),
    description: cleanDescription(raw.description),
    categoryPath: normalizeCategoryPath(raw.categoryPath, uniqloCategories),
  };
}

const pacsunCategories: CategoryMap = {
  "men > graphic tees": "Men > T-shirts > Graphic",
  "men > pants": "Men > Pants",
};

export function normalizePacsunRawProduct(raw: RawProduct): RawProduct {
  return {
    ...raw,
    name: cleanName(raw.name),
    brand: cleanBrand(raw.brand),
    description: cleanDescription(raw.description),
    categoryPath: normalizeCategoryPath(raw.categoryPath, pacsunCategories),
  };
}

const nikeCategories: CategoryMap = {
  "men > t-shirts": "Men > T-shirts",
  "men > hoodies & sweatshirts": "Men > Hoodies & Sweatshirts",
  "men > pants": "Men > Pants",
  "men > jackets": "Men > Jackets",
};

export function normalizeNikeRawProduct(raw: RawProduct): RawProduct {
  return {
    ...raw,
    name: cleanName(raw.name),
    brand: cleanBrand(raw.brand),
    description: cleanDescription(raw.description),
    categoryPath: normalizeCategoryPath(raw.categoryPath, nikeCategories),
  };
}

const adidasCategories: CategoryMap = {
  "men > t-shirts": "Men > T-shirts",
  "men > hoodies & sweatshirts": "Men > Hoodies & Sweatshirts",
  "men > pants": "Men > Pants",
  "men > jackets": "Men > Jackets",
};

export function normalizeAdidasRawProduct(raw: RawProduct): RawProduct {
  return {
    ...raw,
    name: cleanName(raw.name),
    brand: cleanBrand(raw.brand),
    description: cleanDescription(raw.description),
    categoryPath: normalizeCategoryPath(raw.categoryPath, adidasCategories),
  };
}

const hollisterCategories: CategoryMap = {
  "men > t-shirts": "Men > T-shirts",
  "men > hoodies & sweatshirts": "Men > Hoodies & Sweatshirts",
  "men > jeans": "Men > Jeans",
  "men > pants": "Men > Pants",
};

export function normalizeHollisterRawProduct(raw: RawProduct): RawProduct {
  return {
    ...raw,
    name: cleanName(raw.name),
    brand: cleanBrand(raw.brand),
    description: cleanDescription(raw.description),
    categoryPath: normalizeCategoryPath(raw.categoryPath, hollisterCategories),
  };
}

const forever21Categories: CategoryMap = {
  "men > t-shirts": "Men > T-shirts",
  "men > hoodies & sweatshirts": "Men > Hoodies & Sweatshirts",
  "men > pants": "Men > Pants",
  "men > jeans": "Men > Jeans",
  "men > jackets": "Men > Jackets",
};

export function normalizeForever21RawProduct(raw: RawProduct): RawProduct {
  return {
    ...raw,
    name: cleanName(raw.name),
    brand: cleanBrand(raw.brand),
    description: cleanDescription(raw.description),
    categoryPath: normalizeCategoryPath(raw.categoryPath, forever21Categories),
  };
}

const asosCategories: CategoryMap = {
  "men > t-shirts": "Men > T-shirts",
  "men > hoodies & sweatshirts": "Men > Hoodies & Sweatshirts",
  "men > pants > cargo": "Men > Pants > Cargo",
  "men > pants": "Men > Pants",
  "men > jackets": "Men > Jackets",
};

export function normalizeAsosRawProduct(raw: RawProduct): RawProduct {
  return {
    ...raw,
    name: cleanName(raw.name),
    brand: cleanBrand(raw.brand),
    description: cleanDescription(raw.description),
    categoryPath: normalizeCategoryPath(raw.categoryPath, asosCategories),
  };
}

const gapCategories: CategoryMap = {
  "men > t-shirts": "Men > T-shirts",
  "men > hoodies & sweatshirts": "Men > Hoodies & Sweatshirts",
  "men > jeans": "Men > Jeans",
  "men > pants": "Men > Pants",
};

export function normalizeGapRawProduct(raw: RawProduct): RawProduct {
  return {
    ...raw,
    name: cleanName(raw.name),
    brand: cleanBrand(raw.brand),
    description: cleanDescription(raw.description),
    categoryPath: normalizeCategoryPath(raw.categoryPath, gapCategories),
  };
}

const aeropostaleCategories: CategoryMap = {
  "men > t-shirts": "Men > T-shirts",
  "men > hoodies & sweatshirts": "Men > Hoodies & Sweatshirts",
  "men > pants": "Men > Pants",
};

export function normalizeAeropostaleRawProduct(raw: RawProduct): RawProduct {
  return {
    ...raw,
    name: cleanName(raw.name),
    brand: cleanBrand(raw.brand),
    description: cleanDescription(raw.description),
    categoryPath: normalizeCategoryPath(raw.categoryPath, aeropostaleCategories),
  };
}

const urbanOutfittersCategories: CategoryMap = {
  "men > t-shirts": "Men > T-shirts",
  "men > t-shirts > graphic": "Men > T-shirts > Graphic",
  "men > hoodies & sweatshirts": "Men > Hoodies & Sweatshirts",
  "men > pants": "Men > Pants",
  "men > jackets": "Men > Jackets",
};

export function normalizeUrbanOutfittersRawProduct(raw: RawProduct): RawProduct {
  return {
    ...raw,
    name: cleanName(raw.name),
    brand: cleanBrand(raw.brand),
    description: cleanDescription(raw.description),
    categoryPath: normalizeCategoryPath(raw.categoryPath, urbanOutfittersCategories),
  };
}

const carharttCategories: CategoryMap = {
  "men > t-shirts": "Men > T-shirts",
  "men > hoodies & sweatshirts": "Men > Hoodies & Sweatshirts",
  "men > pants": "Men > Pants",
  "men > jackets": "Men > Jackets",
};

export function normalizeCarharttRawProduct(raw: RawProduct): RawProduct {
  return {
    ...raw,
    name: cleanName(raw.name),
    brand: cleanBrand(raw.brand),
    description: cleanDescription(raw.description),
    categoryPath: normalizeCategoryPath(raw.categoryPath, carharttCategories),
  };
}
