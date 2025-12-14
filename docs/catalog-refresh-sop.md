# Catalog refresh SOP

End-to-end steps to refresh a raw feed from a JSON export without breaking persisted product IDs.

1) Prepare JSON: obtain `<brand>.json` array of raw items matching the `RawProduct` shape (stable `id`, required fields present).
2) Generate TS feed: run `npm run catalog:refresh-raw -- --in <brand>.json --out data/raw/<brand>.ts --export <exportName>` to write a deterministic `RawProduct[]` file (sorted by `id`, unknown keys stripped).
3) Wire catalog: import the new feed and add a `rawSources` entry in `lib/catalog/catalog.ts` with the exact `name` string that should persist in product IDs.
4) Validate IDs: run `npm run catalog:validate-ids` to ensure no duplicate `RawProduct.id` per source and no cross-source collisions of derived `Product.id` (`${sourceName.toLowerCase()}-${rawId}`).
5) Verify build: run `npm run build` to confirm ingestion compiles with the updated sources.
6) Ship safely: never rename an existing `rawSources[].name` or mutate existing `RawProduct.id` values; add overrides or new items instead.
