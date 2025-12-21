export type BrandStatus = "active" | "planned";

export type CuratedBrand = {
  key: string;
  sourceName: string;
  status: BrandStatus;
  notes?: string;
};

export const curatedBrandsV1: CuratedBrand[] = [
  {
    key: "abercrombie",
    sourceName: "Abercrombie",
    status: "active",
  },
  {
    key: "adidas",
    sourceName: "Adidas",
    status: "active",
  },
  {
    key: "aeropostale",
    sourceName: "Aéropostale",
    status: "active",
  },
  {
    key: "asos",
    sourceName: "ASOS",
    status: "active",
  },
  {
    key: "carhartt",
    sourceName: "Carhartt",
    status: "active",
  },
  {
    key: "forever21",
    sourceName: "Forever 21",
    status: "active",
  },
  {
    key: "gap",
    sourceName: "Gap",
    status: "active",
  },
  {
    key: "zara",
    sourceName: "Zara",
    status: "active",
  },
  {
    key: "nike",
    sourceName: "Nike",
    status: "active",
  },
  {
    key: "hollister",
    sourceName: "Hollister",
    status: "active",
  },
  {
    key: "urbanOutfitters",
    sourceName: "Urban Outfitters",
    status: "active",
  },
  {
    key: "hm",
    sourceName: "H&M",
    status: "active",
  },
  {
    key: "uniqlo",
    sourceName: "Uniqlo",
    status: "active",
  },
  {
    key: "pacsun",
    sourceName: "PacSun",
    status: "active",
  },
  {
    key: "levis",
    sourceName: "Levis",
    status: "active",
  },
  {
    key: "newBalance",
    sourceName: "New Balance",
    status: "active",
  },
  {
    key: "reformation",
    sourceName: "Reformation",
    status: "active",
  },
  {
    key: "aritzia",
    sourceName: "Aritzia",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "cos",
    sourceName: "COS",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "everlane",
    sourceName: "Everlane",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "madewell",
    sourceName: "Madewell",
    status: "active",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "jCrew",
    sourceName: "J.Crew",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "bananaRepublic",
    sourceName: "Banana Republic",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "lululemon",
    sourceName: "Lululemon",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "patagonia",
    sourceName: "Patagonia",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "theNorthFace",
    sourceName: "The North Face",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "dickies",
    sourceName: "Dickies",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "champion",
    sourceName: "Champion",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "vans",
    sourceName: "Vans",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "converse",
    sourceName: "Converse",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "drMartens",
    sourceName: "Dr. Martens",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "puma",
    sourceName: "Puma",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "reebok",
    sourceName: "Reebok",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "asics",
    sourceName: "ASICS",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
  {
    key: "birkenstock",
    sourceName: "Birkenstock",
    status: "planned",
    notes:
      "Manual curation: pick 10-20 hero items (best sellers/new arrivals), capture imageUrl/productUrl, keep SKU-based ids stable.",
  },
];
