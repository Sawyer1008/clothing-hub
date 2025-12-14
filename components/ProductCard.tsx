// components/ProductCard.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types/product";
import { useCart } from "@/app/cart/CartContext";
import { useSavedProducts } from "@/context/SavedProductsContext";
import { formatPrice } from "@/utils/formatPrice";

type ProductCardProps = {
  product: Product;
  testMode?: boolean;
};

export default function ProductCard({ product, testMode }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isSaved, toggleSaved } = useSavedProducts();
  const [justAdded, setJustAdded] = useState(false);
  const addTimeoutRef = useRef<number | null>(null);
  const confirmDurationMs = 800;

  const mainImage = product.images?.[0];
  const imageUrl = mainImage?.url ?? "/file.svg";

  const onSale =
    product.price.originalAmount &&
    product.price.originalAmount > product.price.amount;
  const discountPercent =
    onSale && product.price.originalAmount
      ? Math.round(
          ((product.price.originalAmount - product.price.amount) /
            product.price.originalAmount) *
            100
        )
      : null;

  useEffect(() => {
    return () => {
      if (addTimeoutRef.current) {
        window.clearTimeout(addTimeoutRef.current);
      }
    };
  }, []);

  const handleAdd = () => {
    if (justAdded) return;
    addToCart(product);
    setJustAdded(true);
    if (addTimeoutRef.current) {
      window.clearTimeout(addTimeoutRef.current);
    }
    addTimeoutRef.current = window.setTimeout(() => {
      setJustAdded(false);
    }, confirmDurationMs);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-lg hover:shadow-slate-900/40">
      {/* Image + save button */}
      <Link
        href={`/product/${product.id}`}
        className="relative block aspect-[3/4] overflow-hidden bg-slate-900"
      >
        <img
          src={imageUrl}
          alt={mainImage?.alt ?? product.name}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleSaved(product.id);
          }}
          className="absolute right-2 top-2 rounded-full bg-slate-950/80 px-2 py-1 text-xs font-semibold text-slate-100 shadow-sm hover:bg-slate-100 hover:text-slate-900"
          aria-label={isSaved(product.id) ? "Remove from saved" : "Save item"}
        >
          {isSaved(product.id) ? "♥" : "♡"}
        </button>
        {testMode && (
          <span className="absolute right-2 top-11 rounded-full border border-slate-800 bg-slate-900/90 px-2 py-0.5 text-[10px] font-semibold text-slate-200 shadow-sm">
            Test Mode
          </span>
        )}
        {onSale && (
          <span className="absolute left-2 top-2 rounded-full bg-emerald-400/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-950 shadow-sm ring-1 ring-emerald-300/80">
            {discountPercent ? `${discountPercent}% off` : "On sale"}
          </span>
        )}
      </Link>

      {/* Info + actions */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {product.brand}
          </p>
          <Link
            href={`/product/${product.id}`}
            className="line-clamp-2 text-sm font-medium text-slate-50 transition hover:text-slate-100"
          >
            {product.name}
          </Link>
          {product.subcategory && (
            <p className="text-[11px] text-slate-400">{product.subcategory}</p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-slate-900/80 px-2 py-1 font-semibold text-slate-50 shadow-sm">
            {formatPrice(product.price.amount)}
          </span>
          {onSale && product.price.originalAmount && (
            <>
              <span className="text-xs text-slate-500 line-through">
                {formatPrice(product.price.originalAmount)}
              </span>
              <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-200 ring-1 ring-emerald-400/60">
                Deal
              </span>
            </>
          )}
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-800/80 bg-slate-900/70 px-2 py-0.5 text-[10px] text-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Add to cart button */}
        <div className="relative mt-auto pt-1">
          <button
            type="button"
            onClick={handleAdd}
            disabled={justAdded}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white active:scale-95 disabled:translate-y-0 disabled:opacity-70 disabled:hover:bg-slate-100 disabled:cursor-not-allowed"
          >
            {justAdded ? "Added ✓" : "Add to cart"}
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full transition ${
                justAdded ? "bg-emerald-400 shadow-[0_0_0_6px_rgba(74,222,128,0.18)]" : "bg-slate-300"
              }`}
            />
          </button>
          <span
            className={`pointer-events-none absolute -top-5 right-2 text-[10px] font-semibold text-emerald-200 transition duration-300 ${
              justAdded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
            }`}
          >
            Added
          </span>
        </div>
      </div>
    </div>
  );
}
