"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { getAllProducts } from "@/lib/catalog/catalog";
import {
  inferStylesForProduct,
  inferColorMoodsFromProduct,
} from "@/lib/semantic/tagRules";
import { inferFitForProduct } from "@/lib/semantic/fitDictionary";
import { parseQueryToIntent } from "@/lib/semantic/queryParser";

const allProducts: Product[] = getAllProducts();

type OutfitRole = "top" | "bottom" | "outerwear" | "footwear" | "accessory";

// LOCAL helper – not imported from anywhere
function getOutfitRoleForProduct(product: Product): OutfitRole {
  const cat = product.category.toLowerCase();
  const sub = (product.subcategory || "").toLowerCase();

  // tops
  if (
    ["top", "tee", "t-shirt", "shirt", "polo", "sweater", "crewneck", "tank"].some(
      (w) => cat.includes(w) || sub.includes(w)
    )
  ) {
    return "top";
  }

  // bottoms
  if (
    ["pant", "pants", "jean", "cargo", "short", "jogger"].some(
      (w) => cat.includes(w) || sub.includes(w)
    )
  ) {
    return "bottom";
  }

  // outerwear
  if (
    ["jacket", "coat", "puffer", "parka", "outerwear"].some(
      (w) => cat.includes(w) || sub.includes(w)
    )
  ) {
    return "outerwear";
  }

  // footwear
  if (
    ["shoe", "sneaker", "boot"].some((w) => cat.includes(w) || sub.includes(w))
  ) {
    return "footwear";
  }

  // accessories
  if (
    ["hat", "cap", "beanie", "belt", "bag", "backpack", "scarf"].some(
      (w) => cat.includes(w) || sub.includes(w)
    )
  ) {
    return "accessory";
  }

  // default
  return "top";
}

export default function SemanticDebugPage() {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    allProducts[0]?.id ?? ""
  );

  const [queryText, setQueryText] = useState(
    "streetwear outfit for a rainy night under 150 for a guy"
  );

  const selectedProduct = useMemo(
    () => allProducts.find((p) => p.id === selectedProductId),
    [selectedProductId]
  );

  const productAnalysis = useMemo(() => {
    if (!selectedProduct) return null;

    const styles = inferStylesForProduct(selectedProduct);
    const fit = inferFitForProduct(selectedProduct);
    const role = getOutfitRoleForProduct(selectedProduct);
    const moods = inferColorMoodsFromProduct(selectedProduct);

    return { styles, fit, role, moods };
  }, [selectedProduct]);

  const parsedQuery = useMemo(() => {
    if (!queryText.trim()) return null;
    return parseQueryToIntent(queryText);
  }, [queryText]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">
          Semantic Debug Lab
        </h1>
        <p className="text-xs text-slate-400">
          Internal playground to inspect how the style/fit/category/query rules
          behave. This page is for you and future agents, not real users.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Product analysis */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-tight">
              Product → semantic view
            </h2>
            <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] text-slate-400">
              {allProducts.length} products loaded
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Select product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 focus:border-slate-300 focus:outline-none"
            >
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand} · {p.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && productAnalysis && (
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Raw
                </p>
                <p className="mt-1 text-slate-200">
                  <span className="text-slate-400">ID:</span>{" "}
                  <code className="rounded bg-slate-900 px-1 py-0.5 text-[11px]">
                    {selectedProduct.id}
                  </code>
                </p>
                <p className="text-slate-200">
                  <span className="text-slate-400">Name:</span>{" "}
                  {selectedProduct.name}
                </p>
                <p className="text-slate-200">
                  <span className="text-slate-400">Brand:</span>{" "}
                  {selectedProduct.brand}
                </p>
                <p className="text-slate-200">
                  <span className="text-slate-400">Category:</span>{" "}
                  {selectedProduct.category}
                  {selectedProduct.subcategory
                    ? ` · ${selectedProduct.subcategory}`
                    : ""}
                </p>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Inferred style / fit / role
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-100">
                    Fit: {productAnalysis.fit}
                  </span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-100">
                    Role: {productAnalysis.role}
                  </span>
                  {productAnalysis.styles.map((style) => (
                    <span
                      key={style}
                      className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-slate-100"
                    >
                      Style: {style}
                    </span>
                  ))}
                  {productAnalysis.moods.map((mood) => (
                    <span
                      key={mood}
                      className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-slate-300"
                    >
                      Color mood: {mood}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Tags + colors
                </p>
                <div className="mt-1 space-y-1">
                  <p className="text-slate-200">
                    <span className="text-slate-400">Tags:</span>{" "}
                    {selectedProduct.tags && selectedProduct.tags.length > 0
                      ? selectedProduct.tags.join(", ")
                      : "—"}
                  </p>
                  <p className="text-slate-200">
                    <span className="text-slate-400">Colors:</span>{" "}
                    {selectedProduct.colors && selectedProduct.colors.length > 0
                      ? selectedProduct.colors.join(", ")
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Query analysis */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <h2 className="text-sm font-semibold tracking-tight">
            Query → intent view
          </h2>

          <div className="space-y-2 text-xs">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Query text
            </label>
            <textarea
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 focus:border-slate-300 focus:outline-none"
            />
          </div>

          {parsedQuery && (
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Parsed intent
                </p>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                  <p className="text-slate-200">
                    <span className="text-slate-400">Gender:</span>{" "}
                    {parsedQuery.gender ?? "—"}
                  </p>
                  <p className="text-slate-200">
                    <span className="text-slate-400">Max price:</span>{" "}
                    {parsedQuery.maxPrice ? `$${parsedQuery.maxPrice}` : "—"}
                  </p>
                  <p className="text-slate-200">
                    <span className="text-slate-400">Min price:</span>{" "}
                    {parsedQuery.minPrice ? `$${parsedQuery.minPrice}` : "—"}
                  </p>
                  <p className="text-slate-200">
                    <span className="text-slate-400">Occasions:</span>{" "}
                    {parsedQuery.occasions.join(", ")}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Styles / colors / pieces
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {parsedQuery.stylePreferences.map((style) => (
                    <span
                      key={style}
                      className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-slate-100"
                    >
                      Style: {style}
                    </span>
                  ))}
                  {parsedQuery.colorMoods.map((mood) => (
                    <span
                      key={mood}
                      className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-slate-300"
                    >
                      Color mood: {mood}
                    </span>
                  ))}
                  {parsedQuery.wantsPieces.map((piece) => (
                    <span
                      key={piece}
                      className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-slate-300"
                    >
                      Piece: {piece}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Raw keywords
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {parsedQuery.rawKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-slate-300"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
