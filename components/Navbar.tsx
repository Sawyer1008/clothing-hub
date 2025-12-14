// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/cart/CartContext";
import { useSavedProducts } from "@/context/SavedProductsContext";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Catalog" },
  { href: "/assistant", label: "AI Assistant" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { savedIds } = useSavedProducts();
  const [cartPulse, setCartPulse] = useState(false);
  const cartTimerRef = useRef<number | null>(null);
  const prevCartCountRef = useRef<number>(cartCount);

  useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setCartPulse(true);
      if (cartTimerRef.current) {
        window.clearTimeout(cartTimerRef.current);
      }
      cartTimerRef.current = window.setTimeout(() => {
        setCartPulse(false);
      }, 600);
    }
    prevCartCountRef.current = cartCount;

    return () => {
      if (cartTimerRef.current) {
        window.clearTimeout(cartTimerRef.current);
      }
    };
  }, [cartCount]);

  // Active logic for right-side pills
  const isCartFlow =
    pathname.startsWith("/cart") || pathname.startsWith("/checkout");
  const isSavedActive = pathname.startsWith("/saved");

  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
      <Link href="/" className="text-sm font-semibold tracking-tight">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-900">
          CH
        </span>{" "}
        <span className="ml-1 text-slate-100">Clothing Hub</span>
      </Link>

      <div className="flex items-center gap-4">
        {/* middle pills */}
        <div className="hidden items-center gap-1 rounded-full bg-slate-900/70 px-1 py-1 text-xs text-slate-300 sm:flex">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-3 py-1 transition-colors",
                  active
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-300 hover:bg-slate-800 hover:text-slate-50",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* right side: Saved + Cart */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/saved"
            className={`relative rounded-full px-3 py-1 transition ${
              isSavedActive
                ? "bg-slate-100 text-slate-900"
                : "text-slate-200 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Saved
            {savedIds.length > 0 && (
              <span className="absolute -top-1 -right-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white">
                {savedIds.length}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className={`relative rounded-full px-3 py-1 transition ${
              isCartFlow
                ? "bg-slate-100 text-slate-900"
                : "text-slate-200 hover:bg-slate-800 hover:text-white"
            } ${cartPulse ? "shadow-[0_0_0_6px_rgba(255,255,255,0.08)]" : ""}`}
          >
            {cartPulse && (
              <span className="pointer-events-none absolute inset-0 -z-10 animate-ping rounded-full border border-slate-100/40" />
            )}
            Cart
            {cartCount > 0 && (
              <span
                className={`absolute -top-1 -right-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white transition ${
                  cartPulse ? "scale-110 shadow-[0_0_0_8px_rgba(239,68,68,0.15)]" : ""
                }`}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
