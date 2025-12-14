"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { formatPrice } from "@/utils/formatPrice";
import { useSavedProducts } from "@/context/SavedProductsContext";

export default function CartPage() {
  const { cart, cartCount, removeFromCart, updateQuantity, clearCart } =
    useCart();
  const { isSaved, toggleSaved } = useSavedProducts();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price.amount * item.quantity,
    0
  );
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + estimatedTax;
  const storeBreakdown = cart.reduce<Record<string, { count: number; subtotal: number }>>(
    (acc, item) => {
      const store = item.product.sourceName?.trim() || item.product.brand;
      const current = acc[store] ?? { count: 0, subtotal: 0 };
      const lineTotal = item.product.price.amount * item.quantity;

      acc[store] = {
        count: current.count + item.quantity,
        subtotal: current.subtotal + lineTotal,
      };
      return acc;
    },
    {}
  );
  const storeEntries = Object.entries(storeBreakdown);

  const handleMoveToSaved = (productId: string) => {
    if (!isSaved(productId)) {
      toggleSaved(productId);
    }
    removeFromCart(productId);
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>
        <p className="text-sm text-slate-300">
          Your cart is empty. Browse the catalog to add your first piece or check
          your saved items.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/catalog"
            className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-white"
          >
            Browse catalog
          </Link>
          <Link
            href="/saved"
            className="inline-flex items-center rounded-full border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:text-white"
          >
            View saved items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 fade-in-up">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>
          <p className="text-sm text-slate-300">
            {cartCount} item{cartCount === 1 ? "" : "s"} · Subtotal{" "}
            {formatPrice(subtotal)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/catalog"
            className="rounded-full border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:text-white"
          >
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={clearCart}
            className="rounded-full border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-600 hover:text-white"
          >
            Clear cart
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-3">
          {cart.map((item) => {
            const image = item.product.images?.[0];
            const imageUrl = image?.url ?? "/file.svg";
            const lineTotal = item.product.price.amount * item.quantity;
            const sizeLabel =
              item.product.sizes && item.product.sizes.length > 0
                ? item.product.sizes[0]
                : "One size";
            const saved = isSaved(item.product.id);

            return (
              <div
                key={item.product.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
              >
                <div className="flex gap-3">
                  <div className="relative h-24 w-20 overflow-hidden rounded-lg bg-slate-800 sm:h-28 sm:w-24">
                    <img
                      src={imageUrl}
                      alt={image?.alt ?? item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {item.product.brand}
                        </p>
                        <Link
                          href={`/product/${item.product.id}`}
                          className="text-sm font-semibold text-slate-50 hover:text-white"
                        >
                          {item.product.name}
                        </Link>
                        {item.product.sizes.length > 0 && (
                          <p className="text-xs text-slate-400">
                            Size/variant: {sizeLabel}
                          </p>
                        )}
                        <p className="text-xs text-slate-400">
                          {formatPrice(item.product.price.amount)} each
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-xs text-slate-400 transition hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="inline-flex items-center divide-x divide-slate-800 rounded-full border border-slate-800 bg-slate-950/80 text-sm">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="px-3 py-1 text-slate-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-slate-100">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="px-3 py-1 text-slate-300 transition hover:text-white"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-sm font-semibold text-slate-100 sm:text-right">
                        Line total: {formatPrice(lineTotal)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <button
                        type="button"
                        onClick={() => toggleSaved(item.product.id)}
                        className="transition hover:text-white"
                      >
                        {saved ? "Unsave" : "Save for later"}
                      </button>
                      <span className="h-3 w-px bg-slate-800" aria-hidden="true" />
                      <button
                        type="button"
                        onClick={() => handleMoveToSaved(item.product.id)}
                        className="transition hover:text-white"
                      >
                        Move to saved
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="w-full lg:w-[320px]">
          <div className="sticky top-4 space-y-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              {storeEntries.length > 0 && (
                <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 text-xs text-slate-300">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    By store
                  </div>
                  <div className="space-y-1.5">
                    {storeEntries.map(([store, info]) => (
                      <div
                        key={store}
                        className="flex items-center justify-between text-slate-200"
                      >
                        <span>{store}</span>
                        <span className="text-slate-100">
                          {info.count} item{info.count === 1 ? "" : "s"} ·{" "}
                          {formatPrice(info.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Estimated tax (8%)</span>
                <span className="font-semibold">
                  {formatPrice(estimatedTax)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-base">
                <span className="font-semibold text-slate-100">Total</span>
                <span className="font-semibold text-slate-100">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Final totals, shipping, taxes, and returns happen on each
                store&apos;s checkout.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/checkout"
                className="flex w-full items-center justify-center rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-white"
              >
                Proceed to checkout
              </Link>
              <Link
                href="/saved"
                className="text-center text-xs font-semibold text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
              >
                Saved items
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
