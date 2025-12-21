# Catalog refresh SOP

Weekly steps to refresh curated raw feeds without breaking persisted product IDs.

1) Choose brands to refresh from `data/curation/brands.v1.ts` (active only). Keep each feed small and curated.
2) Prepare JSON: build `<brand>.json` as a `RawProduct[]` array with stable `id` values and required fields. Use AI to normalize and clean the list if needed.
3) Generate TS feeds (repeat per brand): `npm run catalog:refresh-raw -- --in <brand>.json --out data/raw/<brandKey>.ts --export <exportName>`.
   Madewell example: `npm run catalog:refresh-raw -- --in scripts/catalog/examples/madewell.raw.v1.json --out data/raw/madewell.ts --export madewellRaw`.
4) Wire catalog: ensure `rawSources` in `lib/catalog/catalog.ts` references the new file. Do not rename existing sources.
5) Validate source names: run `npm run catalog:validate-source-names` to confirm the lock file matches `rawSources`.
6) Validate IDs: run `npm run catalog:validate-ids` to confirm no duplicate `RawProduct.id` per source and no cross-source collisions of derived `Product.id`.
7) Verify build: run `npm run build` to confirm ingestion compiles with the updated sources.
8) Spot-check: browse `/catalog` or a few `/product/<id>` pages to confirm coverage and pricing.

ID stability rules (non-negotiable):
- Never rename `rawSources[].name`. Renames break `Product.id` stability.
- IDs are append-only.
- Prefer `inStock: false` over deletion (when supported by the feed) to preserve saved/cart IDs.
- Never change an existing `RawProduct.id`; deprecate via overrides or add a new item instead.
