# Catalog pipeline

Quick reference for how products move through the ingestion pipeline and how to safely add brands or overrides.

## Data flow
- Raw brand data lives in `data/raw/*` as `RawProduct[]`.
- Optional per-brand overrides in `data/overrides/*` are merged by `applyOverridesToSource` in `lib/catalog/catalog.ts` (matched by `id`).
- Brand-specific cleanup runs in `lib/catalog/brandNormalizers.ts`, routed by `normalizeRawProductForSource` inside `lib/catalog/ingest.ts`.
- `ingestRawProducts` in `lib/catalog/ingest.ts` turns cleaned `RawProduct` objects into normalized `Product` objects.
- `getAllProducts` in `lib/catalog/catalog.ts` combines manual `data/products` entries with ingested products.
- The catalog data is then consumed by `/api/search` and the `/catalog` page.

## ID stability contract
- `Product.id` is a persisted user-state key (cart/saved items depend on it).
- Ingested `Product.id` is derived from `${sourceName.toLowerCase()}-${rawId}`, so `rawSources[].name` is part of the ID.
- Never rename an existing `rawSources[].name`.
- Never change an existing `RawProduct.id`; deprecate via overrides or add a new product instead.

## Adding a new brand (checklist)
- Create `data/raw/<brandName>.ts` exporting `RawProduct[]` with stable `id` values.
- Add the brand to `rawSources` in `lib/catalog/catalog.ts` with its `name`, `type`, and `data`.
- Add a brand normalizer in `lib/catalog/brandNormalizers.ts` (recommended even for light cleanup) and route it in `normalizeRawProductForSource` within `lib/catalog/ingest.ts`.
- Add an entry to `overridesBySource` in `data/overrides/index.ts` and create `data/overrides/<brandName>.ts` with `ProductOverride[]` as needed.
- Confirm `getAllProducts()` includes the new brand (via `rawSources` ingestion).

## Overriding specific products
- Add overrides to `data/overrides/<brandName>.ts` using `ProductOverride` fields you want to change.
- The `id` in each override must exactly match the `RawProduct.id`; other fields are optional and merged on top of the raw item.
- Overrides run before brand normalization and before `ingestRawProducts`, so downstream normalization sees the merged data.

## Notes for agents
- Keep ingestion helpers pure and type-safe; avoid side effects inside normalizers.
- Prefer adding normalizers or overrides instead of hacking raw data files so scraped data stays intact.
- Keep diffs small and localized; avoid changing function signatures unless absolutely required for new sources.

## Manual curated products (legacy seed)
- `data/products.ts` contains a small, hand-curated `Product[]` seed used for special cases or testing.
- All main user flows (catalog UI, search API, cart, saved items, stylist, assistant, product detail pages) should rely on `getAllProducts()` from `lib/catalog/catalog.ts` so they automatically see:
  - raw brand data from `data/raw/*`
  - per-brand overrides from `data/overrides/*`
  - brand-specific normalization in `lib/catalog/brandNormalizers.ts`
- Treat `data/products.ts` as optional curated data that gets merged into the full catalog, not as the primary data source.
