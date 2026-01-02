# Affiliate program SOP (v1)

Steps to enable a new affiliate program entry safely and consistently.

1) Confirm the correct `storeKey`.
   - Use existing catalog/registry sources (`lib/checkout/storeRegistry.ts` and `lib/checkout/storeKey.ts`).
   - Do not change any Product or RawProduct IDs.
2) Update config in `data/affiliates/affiliate-config.v1.json`.
   - Add a new entry keyed by the storeKey.
   - Set `enabled: true`.
   - Set `network` to a real network name (not `none`).
   - Set `params.template` with the required placeholders (`{{url}}` plus optional `{{storeKey}}`/`{{productId}}`).
   - To disable a store, remove the entry entirely (do not set `enabled: false`).
3) Validate locally.
   - Run `npm run validate:affiliates`.
   - Run `npm run build`.
4) Manual verification (no tracking checks).
   - Open a product page and click "View on {brand}" to confirm the destination matches the resolver output.
   - In checkout, open item links or "Open all items" and confirm destinations resolve through the affiliate template or direct URL.
   - Verify only link destinations change; UI text and behavior stay the same.

Safety and communication guardrails:
- No attribution or earnings guarantees (internal or public).
- Retailer checkout is the source of truth for orders and fulfillment.
- Do not imply automated attribution, tracking, or network API integrations.
