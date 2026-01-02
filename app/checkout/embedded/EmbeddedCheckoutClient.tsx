"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/app/cart/CartContext";

export default function EmbeddedCheckoutClient() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { cart, removeFromCart } = useCart();
  const brand = searchParams.get("brand") ?? "Unknown brand";
  const brandItems = cart.filter(
    (item) =>
      item.product.sourceName?.trim() === brand ||
      (!item.product.sourceName && item.product.brand === brand) ||
      item.product.brand === brand
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Placeholder for Phase 4: future auto-cart sync and checkout events
      console.log("[embedded-checkout] Received message", event.data);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const sendTestMessage = useCallback(() => {
    const targetWindow = iframeRef.current?.contentWindow;
    if (!targetWindow) {
      console.warn("[embedded-checkout] Iframe not ready for messaging");
      return;
    }

    const payload = {
      source: "clothing-hub",
      type: "embedded-checkout-test",
      message: "Hello from the host shell",
      sentAt: new Date().toISOString(),
    };

    // Placeholder bridge: this will be replaced with brand checkout messaging
    targetWindow.postMessage(payload, "*");
    console.log("[embedded-checkout] Sent test message", payload);
  }, []);

  const handleCompleteBrand = useCallback(() => {
    for (const item of brandItems) {
      removeFromCart(item.product.id);
    }

    router.push("/checkout");
  }, [brandItems, removeFromCart, router]);

  if (!brand || brandItems.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Experimental sandbox
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            No matching items found
          </h1>
          <p className="text-sm text-slate-300">
            We couldn&apos;t find items in your cart for this store. This sandbox
            doesn&apos;t process payments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/checkout"
            className="inline-flex items-center rounded-full border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:text-white"
          >
            Back to checkout
          </Link>
          <Link
            href="/cart"
            className="inline-flex items-center rounded-full border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:text-white"
          >
            Back to cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Experimental sandbox
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Embedded checkout for {brand}
          </h1>
          <p className="text-sm text-slate-300">
            This is not a real checkout. It won&apos;t process payments or confirm
            purchases. Future third-party checkouts may load here inside a
            secure iframe shell as a placeholder for the messaging bridge and
            layout.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/checkout"
            className="inline-flex items-center rounded-full border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:text-white"
          >
            Back to checkout
          </Link>
          <button
            type="button"
            onClick={handleCompleteBrand}
            className="inline-flex items-center rounded-full border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white"
          >
            Remove {brand} items from my cart
          </button>
        </div>
        <p className="text-xs text-slate-400">
          This only updates your Style Hub cart; it doesn&apos;t verify or process a purchase.
        </p>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-900/40">
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-2">
            <iframe
              ref={iframeRef}
              src="about:blank"
              title="Embedded checkout preview"
              className="h-[420px] w-full rounded-md border border-slate-800 bg-black/30 sm:h-[520px] md:h-[620px]"
            />
          </div>
          <div className="space-y-2 text-sm text-slate-200">
            <p className="text-slate-300">
              This is a sandbox view. Real checkout integrations will appear
              here later, with safe message passing to keep cart details in
              sync.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={sendTestMessage}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-white"
              >
                Send test message to iframe
              </button>
              <span className="text-xs text-slate-400">
                Open your console to see placeholder bridge logs.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
