# Affiliate spine (v1)

## Config + versioning

- Location: `data/affiliates/affiliate-config.v1.ts`.
- Versioning: new config versions should live alongside `affiliate-config.v1.ts`
  (for example `affiliate-config.v2.ts`) and remain deterministic.
- Disabled stores are omitted: if a storeKey is missing from the map, it is
  treated as not affiliate-enabled. Entries that exist must set `enabled: true`.

## Fields + placeholders

- `storeKey` values must match known store keys (see the checkout store registry).
- `network` is an enum: `impact`, `cj`, `rakuten`, or `none`.
- `params.template` is a placeholder string required in v1 to build affiliate
  URLs deterministically. It is not a real network format yet.
- Template tokens supported in v1:
  - `{{url}}` → the encoded direct product URL
  - `{{productId}}` → the Clothing Hub product id
  - `{{storeKey}}` → the store key

## Safety + routing notes

- Outbound routing is deterministic and uses only product + static config data.
- Retailer checkout is the source of truth for purchases and fulfillment.
- Embedded checkout does not guarantee affiliate attribution.

## Explicit limitations

- No earnings or attribution promises.
- No affiliate network API calls.
- No tracking or analytics added here.
