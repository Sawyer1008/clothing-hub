"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../cart/CartContext";
import { formatPrice } from "@/utils/formatPrice";
import { getOutboundUrl } from "@/lib/checkout/affiliate";
import { resolveStoreCheckoutPlan } from "@/lib/checkout/resolveStoreCheckoutPlan";
import { getStoreKeyForProduct } from "@/lib/checkout/storeKey";
import type { CheckoutLineItem, CheckoutAction } from "@/types/checkout";

type StoreProgress = {
  openedProductIds: string[];
  checklistDone: number[];
  sequenceIndex: number;
  popupBlocked?: boolean;
};

const PROGRESS_STORAGE_KEY = "checkoutProgress-v1";

export default function CheckoutPage() {
  const { cart, removeFromCart } = useCart();
  const [openChecklists, setOpenChecklists] = useState<Record<string, boolean>>(
    {}
  );
  const [storeProgressMap, setStoreProgressMap] = useState<Record<string, StoreProgress>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, StoreProgress>;
      setStoreProgressMap(parsed);
    } catch (err) {
      console.error("Failed to load checkout progress", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(storeProgressMap));
    } catch (err) {
      console.error("Failed to persist checkout progress", err);
    }
  }, [storeProgressMap]);

  const updateStoreProgress = (storeKey: string, updater: (prev: StoreProgress) => StoreProgress) => {
    setStoreProgressMap((prev) => {
      const current = prev[storeKey] ?? { openedProductIds: [], checklistDone: [], sequenceIndex: 0 };
      return { ...prev, [storeKey]: updater(current) };
    });
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-sm text-slate-300">
          Your cart is empty. Add items from the catalog to start checkout. Style Hub routes you to
          each store to pay; we don&apos;t process or verify payments.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/catalog"
            className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-white"
          >
            Browse catalog
          </Link>
          <Link
            href="/saved"
            className="rounded-full border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
          >
            Saved items
          </Link>
          <Link
            href="/cart"
            className="rounded-full border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
          >
            Back to cart
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price.amount * item.quantity,
    0
  );
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + estimatedTax;

  // Group items by store/brand for a "multi-site" mental model
  const itemsByBrand = new Map<string, typeof cart[number][]>();

  for (const item of cart) {
    const brand = item.product.sourceName?.trim() || item.product.brand;
    const list = itemsByBrand.get(brand) ?? [];
    list.push(item);
    itemsByBrand.set(brand, list);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 fade-in-up">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
            <Link
              href="/cart"
              className="text-xs font-semibold text-slate-200 underline-offset-4 transition hover:text-white hover:underline"
            >
              Back to cart
            </Link>
          </div>
          <p className="text-sm text-slate-300">
            We help organize your cart. Checkout happens on each store&apos;s site.
          </p>
          <p className="text-sm font-semibold text-slate-50">
            Estimated total across sites: {formatPrice(total)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Link
            href="/catalog"
            className="rounded-full border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
          >
            Continue shopping
          </Link>
        </div>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-sm font-semibold text-slate-100">How checkout works</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
          <li>Style Hub organizes your list; purchasing happens on each store site.</li>
          <li>Final totals, shipping, and returns are determined by each store.</li>
          <li>Style Hub does not process payments.</li>
        </ul>
      </section>

      <div className="space-y-4">
        {[...itemsByBrand.entries()].map(([brand, items]) => {
          const brandTotal = items.reduce(
            (sum, item) => sum + item.product.price.amount * item.quantity,
            0
          );
          const brandItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
          const lineItems: CheckoutLineItem[] = items.map((item) => ({
            product: item.product,
            quantity: item.quantity,
          }));
          const storeKey = items[0]
            ? getStoreKeyForProduct(items[0].product)
            : "unknown";
          const plan = resolveStoreCheckoutPlan({
            storeKey,
            storeName: brand,
            items: lineItems,
          });
          const storeProgressKey = `${storeKey}:${brand}`;
          const storeProgress =
            storeProgressMap[storeProgressKey] ?? { openedProductIds: [], checklistDone: [], sequenceIndex: 0 };

          const sequenceList = items
            .map((item) => {
              const out = getOutboundUrl(item.product);
              const url = out.url;
              return url && url.trim()
                ? { productId: item.product.id, url }
                : null;
            })
            .filter(Boolean) as { productId: string; url: string }[];

          const openProductActions = plan.secondaryActions.filter(
            (action): action is Extract<CheckoutAction, { type: "open-product" }> =>
              action.type === "open-product" &&
              typeof action.url === "string" &&
              action.url.trim().length > 0
          );
          const handleOpenAll = () => {
            if (openProductActions.length === 0) return;
            if (
              openProductActions.length > 3 &&
              typeof window !== "undefined"
            ) {
              const confirmed = window.confirm(
                `Open ${openProductActions.length} product pages for ${brand}?`
              );
              if (!confirmed) return;
            }

            let blocked = false;
            const newlyOpenedIds: string[] = [];
            const openedIndices: number[] = [];
            openProductActions.forEach((action) => {
              if (typeof window !== "undefined") {
                const opened = window.open(action.url, "_blank", "noopener,noreferrer");
                if (opened) {
                  newlyOpenedIds.push(action.productId);
                  const idx = sequenceList.findIndex((item) => item.productId === action.productId);
                  if (idx !== -1) openedIndices.push(idx);
                } else {
                  blocked = true;
                }
              }
            });
            if (newlyOpenedIds.length > 0) {
              updateStoreProgress(storeProgressKey, (prev) => {
                const mergedIds = Array.from(new Set([...prev.openedProductIds, ...newlyOpenedIds]));
                const maxOpenedIdx = openedIndices.length ? Math.max(...openedIndices) + 1 : prev.sequenceIndex;
                return {
                  ...prev,
                  openedProductIds: mergedIds,
                  sequenceIndex: Math.max(prev.sequenceIndex, maxOpenedIdx),
                  popupBlocked: blocked ? true : prev.popupBlocked ?? false,
                };
              });
            } else if (blocked) {
              updateStoreProgress(storeProgressKey, (prev) => ({ ...prev, popupBlocked: true }));
            }
          };
          const copyText = async (text: string) => {
            if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(text);
              return;
            }

            if (typeof document !== "undefined") {
              const textarea = document.createElement("textarea");
              textarea.value = text;
              textarea.style.position = "fixed";
              textarea.style.opacity = "0";
              document.body.appendChild(textarea);
              textarea.focus();
              textarea.select();
              document.execCommand("copy");
              document.body.removeChild(textarea);
            }
          };
          const copyChecklist = () => {
            const missingLinks = items
              .map((item) => {
                const out = getOutboundUrl(item.product);
                const url = out.url;
                if (!url || !url.trim()) {
                  return "(link unavailable)";
                }
                return null;
              })
              .filter(Boolean) as string[];

            const checklistText = [
              `Checkout checklist — ${brand}`,
              "",
              ...plan.disclaimers.map((line) => `Note: ${line}`),
              "",
              ...plan.fallbackChecklist.map((step) => `[ ] ${step}`),
              ...(missingLinks.length ? ["", ...missingLinks] : []),
            ].join("\n");
            void copyText(checklistText);
          };
          const handlePrimaryAction = (action: CheckoutAction) => {
            if (action.type === "copy-list") {
              void copyText(action.payload);
            }
          };
          const isChecklistOpen = Boolean(openChecklists[brand]);
          const toggleChecklist = () =>
            setOpenChecklists((prev) => ({
              ...prev,
              [brand]: !prev[brand],
            }));
          const handleChecklistToggle = (idx: number) => {
            updateStoreProgress(storeProgressKey, (prev) => {
              const nextSet = new Set(prev.checklistDone);
              if (nextSet.has(idx)) {
                nextSet.delete(idx);
              } else {
                nextSet.add(idx);
              }
              return { ...prev, checklistDone: Array.from(nextSet) };
            });
          };
          const handleOpenNext = () => {
            if (typeof window === "undefined") return;
            const nextItem = sequenceList[storeProgress.sequenceIndex];
            if (!nextItem) return;
            const opened = window.open(nextItem.url, "_blank", "noopener,noreferrer");
            if (opened) {
              updateStoreProgress(storeProgressKey, (prev) => ({
                ...prev,
                openedProductIds: Array.from(new Set([...prev.openedProductIds, nextItem.productId])),
                sequenceIndex: prev.sequenceIndex + 1,
                popupBlocked: false,
              }));
            } else {
              updateStoreProgress(storeProgressKey, (prev) => ({ ...prev, popupBlocked: true }));
            }
          };
          const handleResetProgress = () => {
            updateStoreProgress(storeProgressKey, () => ({
              openedProductIds: [],
              checklistDone: [],
              sequenceIndex: 0,
              popupBlocked: false,
            }));
          };
          const handleStoreComplete = () => {
            for (const item of items) {
              removeFromCart(item.product.id);
            }
          };
          const checklistDoneCount = storeProgress.checklistDone.length;
          const totalChecklist = plan.fallbackChecklist.length;
          const totalOpenable = sequenceList.length;
          const openedCount = storeProgress.openedProductIds.filter((id) =>
            sequenceList.some((item) => item.productId === id)
          ).length;
          return (
            <section
              key={brand}
              className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-50">
                    {brand}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {brandItemCount} item{brandItemCount === 1 ? "" : "s"} · {formatPrice(brandTotal)}
                  </p>
                </div>
              </header>

              <ul className="mt-3 space-y-2">
                {items.map((item) => {
                  const out = getOutboundUrl(item.product);
                  const affiliateUrl = out.url;
                  const hasValidUrl = Boolean(affiliateUrl && affiliateUrl.trim().length > 0);
                  return (
                    <li
                      key={item.product.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-slate-950/50 px-3 py-2 text-sm"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {item.product.brand}
                        </span>
                        <span className="text-slate-100">{item.product.name}</span>
                        <span className="text-xs text-slate-400">
                          {item.quantity} × {formatPrice(item.product.price.amount)}
                        </span>
                        {hasValidUrl ? (
                          <a
                            href={affiliateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-semibold text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
                          >
                            Open on {brand}
                          </a>
                        ) : (
                          <div className="space-y-1 text-[11px] text-amber-300">
                            <p>Link unavailable.</p>
                            <Link
                              href={`/product/${item.product.id}`}
                              className="inline-flex text-[11px] font-semibold text-slate-200 underline-offset-4 transition hover:text-white hover:underline"
                            >
                              View details
                            </Link>
                          </div>
                        )}
                      </div>
                      <span className="text-slate-50">
                        {formatPrice(item.product.price.amount * item.quantity)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Checkout Tools
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Progress: {openedCount}/{totalOpenable} links opened · Checklist: {checklistDoneCount}/{totalChecklist}
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {plan.primaryAction.type === "open-product" ||
                  plan.primaryAction.type === "open-storefront" ? (
                    <a
                      href={plan.primaryAction.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-white"
                    >
                      {plan.primaryAction.label}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePrimaryAction(plan.primaryAction)}
                      className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-white"
                    >
                      {plan.primaryAction.label}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenAll}
                    className="inline-flex items-center justify-center rounded-full border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
                  >
                    Open all items ({openProductActions.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenNext}
                    disabled={storeProgress.sequenceIndex >= sequenceList.length}
                    className="inline-flex items-center justify-center rounded-full border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
                  >
                    {storeProgress.sequenceIndex >= sequenceList.length
                      ? "All items opened"
                      : `Open next item (${storeProgress.sequenceIndex + 1}/${sequenceList.length})`}
                  </button>
                  <button
                    type="button"
                    onClick={copyChecklist}
                    className="inline-flex items-center justify-center rounded-full border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
                  >
                    Copy checklist
                  </button>
                  <button
                    type="button"
                    onClick={toggleChecklist}
                    className="inline-flex items-center justify-center rounded-full border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
                  >
                    {isChecklistOpen ? "Hide checklist" : "Show checklist"}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetProgress}
                    className="inline-flex items-center justify-center rounded-full border border-amber-500/60 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:border-amber-400 hover:text-amber-100"
                  >
                    Reset progress
                  </button>
                </div>
                {storeProgress.popupBlocked && (
                  <p className="mt-2 text-[11px] text-amber-300">
                    Your browser may block popups — use Copy checklist or open items one by one.
                  </p>
                )}
                {isChecklistOpen && (
                  <div className="mt-3 space-y-2 rounded-md bg-slate-950 px-3 py-2 text-xs text-slate-200">
                    <div className="font-semibold text-slate-100">Checklist</div>
                    <ul className="space-y-1 text-slate-300">
                      {plan.fallbackChecklist.map((step, idx) => {
                        const checked = storeProgress.checklistDone.includes(idx);
                        return (
                          <li key={step} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="h-3 w-3 rounded border-slate-600 bg-slate-950"
                              checked={checked}
                              onChange={() => handleChecklistToggle(idx)}
                            />
                            <span className="flex-1">{step}</span>
                          </li>
                        );
                      })}
                    </ul>
                    {plan.disclaimers.length > 0 && (
                      <div className="pt-1 text-[11px] text-slate-400">
                        {plan.disclaimers.join(" ")}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleStoreComplete}
                className="mt-2 w-full rounded-full border border-slate-800 px-3 py-2 text-center text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
              >
                I finished on {brand} — remove these from my cart
              </button>
              <p className="mt-1 text-[11px] text-slate-400">
                This only updates your Style Hub cart; it doesn&apos;t confirm purchase.
              </p>
            </section>
          );
        })}
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="space-y-3 text-sm text-slate-200 sm:text-base">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Estimated tax (8%)</span>
            <span className="font-semibold">{formatPrice(estimatedTax)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-base">
            <span className="font-semibold text-slate-100">Estimated total</span>
            <span className="font-semibold text-slate-100">
              {formatPrice(total)}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Taxes and final totals are estimates. You&apos;ll see final pricing
            on the brand&apos;s checkout.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-900 bg-slate-950/50 p-4 text-xs text-slate-400">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Experimental tools
        </div>
        <a
          href="/checkout/embedded"
          className="mt-1 inline-flex items-center text-xs font-semibold text-slate-400 underline-offset-4 transition hover:text-slate-200 hover:underline"
        >
          Embedded checkout sandbox (experimental)
        </a>
      </section>
    </div>
  );
}
