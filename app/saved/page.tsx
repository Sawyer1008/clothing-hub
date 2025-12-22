// app/saved/page.tsx
"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useSavedProducts } from "@/context/SavedProductsContext";

export default function SavedPage() {
  const { savedProducts, clearSaved } = useSavedProducts();

  if (savedProducts.length === 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Saved items</h1>
        <p className="text-sm text-slate-400">
          You haven&apos;t saved anything yet. Tap the heart icon on any product to save it here and jump
          back in later.
        </p>
        <p className="text-xs text-slate-500">
          Start the demo: Open Catalog → open a product → tap Save.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/catalog"
            className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-white"
          >
            Browse catalog
          </Link>
          <Link
            href="/assistant"
            className="rounded-full border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
          >
            Ask the stylist
          </Link>
          <Link
            href="/cart"
            className="rounded-full border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
          >
            View cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Saved items</h1>
          <p className="text-xs text-slate-400">
            {savedProducts.length} item{savedProducts.length === 1 ? "" : "s"}{" "}
            saved from across brands.
          </p>
        </div>
        <button
          type="button"
          onClick={clearSaved}
          className="rounded-full border border-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
        >
          Clear all
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {savedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
